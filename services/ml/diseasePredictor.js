/**
 * Disease Predictor
 * Implements multiple ML algorithms for disease prediction and analysis
 */
const dataLoader = require('./dataLoader');
const { TfIdfVectorizer } = require('./vectorizer');

class DiseasePredictor {
  constructor() {
    this.dataLoader = dataLoader;
    this.vectorizer = new TfIdfVectorizer();
    this.initialized = false;
    this.weightedSymptoms = {};
  }

  /**
   * Initialize the predictor with disease data
   */
  async initialize() {
    try {
      if (!this.dataLoader.isInitialized()) {
        await this.dataLoader.loadData();
      }
      
      // Train the vectorizer with all symptom data
      const diseases = this.dataLoader.getAllDiseases();
      const documents = diseases.map(disease => disease.Symptoms);
      this.vectorizer.fit(documents);
      
      // Calculate symptom weights based on their specificity
      this._calculateSymptomWeights();
      
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Error initializing disease predictor:', error);
      return false;
    }
  }

  /**
   * Calculate the importance weight of each symptom based on its specificity
   * Rare symptoms that appear in fewer diseases get higher weights
   */
  _calculateSymptomWeights() {
    const symptomsIndex = this.dataLoader.symptomsIndex;
    const totalDiseases = this.dataLoader.getAllDiseases().length;
    
    Object.keys(symptomsIndex).forEach(symptom => {
      // Inverse document frequency concept - symptoms that appear in fewer diseases get higher weights
      const diseasesWithSymptom = symptomsIndex[symptom].length;
      this.weightedSymptoms[symptom] = Math.log(totalDiseases / (1 + diseasesWithSymptom));
    });
  }

  /**
   * Predict diseases based on a list of symptoms using multiple algorithms
   * @param {Array} symptoms - Array of symptom strings
   * @param {Number} limit - Maximum number of results to return
   * @returns {Object} Results from different algorithms
   */
  async predictDisease(symptoms, limit = 5) {
    if (!this.initialized) {
      await this.initialize();
    }
    
    const normalizedSymptoms = symptoms.map(s => s.trim().toLowerCase());
    
    return {
      naiveBayes: this._naiveBayesPrediction(normalizedSymptoms, limit),
      weightedSymptoms: this._weightedSymptomMatch(normalizedSymptoms, limit),
      similarityBased: this._similarityBasedPrediction(normalizedSymptoms, limit)
    };
  }

  /**
   * Simplified Naive Bayes prediction algorithm
   */
  _naiveBayesPrediction(symptoms, limit) {
    const diseases = this.dataLoader.getAllDiseases();
    const totalDiseases = diseases.length;
    
    // Calculate score for each disease
    const results = diseases.map(disease => {
      const diseaseSymptoms = disease.Symptoms.toLowerCase().split(', ').map(s => s.trim());
      
      // Count matching symptoms
      let matchCount = 0;
      symptoms.forEach(symptom => {
        if (diseaseSymptoms.includes(symptom)) {
          matchCount++;
        }
      });
      
      // Calculate probability as (matching symptoms / total symptoms provided) * (disease symptom count / total possible symptoms)
      const probability = (matchCount / symptoms.length) * (diseaseSymptoms.length / this.dataLoader.getAllSymptoms().length);
      
      return {
        disease: disease.DiseaseName,
        diseaseId: disease.DiseaseID,
        confidence: probability * 100, // Convert to percentage
        matchedSymptoms: matchCount,
        description: disease.Description,
        symptoms: disease.Symptoms,
        treatment: disease.Treatment
      };
    });
    
    // Sort by confidence and return top results
    return results
      .filter(result => result.matchedSymptoms > 0) // Only include diseases with at least one matching symptom
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, limit);
  }

  /**
   * Weighted symptom matching algorithm
   * Weights symptoms by their specificity (rarer symptoms have higher weights)
   */
  _weightedSymptomMatch(symptoms, limit) {
    const diseases = this.dataLoader.getAllDiseases();
    
    // Calculate weighted score for each disease
    const results = diseases.map(disease => {
      const diseaseSymptoms = disease.Symptoms.toLowerCase().split(', ').map(s => s.trim());
      
      // Calculate weighted score
      let weightedScore = 0;
      let matchedSymptomsList = [];
      
      symptoms.forEach(symptom => {
        if (diseaseSymptoms.includes(symptom)) {
          const weight = this.weightedSymptoms[symptom] || 1;
          weightedScore += weight;
          matchedSymptomsList.push(symptom);
        }
      });
      
      // Normalize score as percentage of maximum possible score for these symptoms
      const maxPossibleScore = symptoms.reduce((sum, symptom) => sum + (this.weightedSymptoms[symptom] || 1), 0);
      const normalizedScore = (weightedScore / maxPossibleScore) * 100;
      
      return {
        disease: disease.DiseaseName,
        diseaseId: disease.DiseaseID,
        confidence: normalizedScore,
        matchedSymptoms: matchedSymptomsList.length,
        matchedSymptomsList,
        description: disease.Description,
        symptoms: disease.Symptoms,
        treatment: disease.Treatment
      };
    });
    
    // Sort by confidence and return top results
    return results
      .filter(result => result.matchedSymptoms > 0) // Only include diseases with at least one matching symptom
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, limit);
  }

  /**
   * Similarity-based prediction using TF-IDF vectorization
   */
  _similarityBasedPrediction(symptoms, limit) {
    const diseases = this.dataLoader.getAllDiseases();
    const symptomsText = symptoms.join(', ');
    
    // Get vector representation of input symptoms
    const inputVector = this.vectorizer.transform([symptomsText])[0];
    
    // Calculate similarity for each disease
    const results = diseases.map(disease => {
      const diseaseVector = this.vectorizer.transform([disease.Symptoms])[0];
      
      // Calculate cosine similarity between symptom vectors
      const similarity = this._cosineSimilarity(inputVector, diseaseVector);
      
      return {
        disease: disease.DiseaseName,
        diseaseId: disease.DiseaseID,
        confidence: similarity * 100, // Convert to percentage
        description: disease.Description,
        symptoms: disease.Symptoms,
        treatment: disease.Treatment
      };
    });
    
    // Sort by similarity and return top results
    return results
      .filter(result => result.confidence > 0) // Only include diseases with some similarity
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, limit);
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  _cosineSimilarity(vectorA, vectorB) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let term in vectorA) {
      if (vectorB[term]) {
        dotProduct += vectorA[term] * vectorB[term];
      }
      normA += Math.pow(vectorA[term], 2);
    }
    
    for (let term in vectorB) {
      normB += Math.pow(vectorB[term], 2);
    }
    
    // Prevent division by zero
    if (normA === 0 || normB === 0) {
      return 0;
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Get recommendations for disease-specific preventive measures
   * @param {String} diseaseId - ID of the disease
   * @returns {Object} Prevention recommendations
   */
  getPreventionRecommendations(diseaseId) {
    const disease = this.dataLoader.getDiseaseById(diseaseId);
    if (!disease) return null;
    
    // Placeholder for generating customized prevention recommendations
    // In a real system, this would use more sophisticated logic or a database of recommendations
    
    let recommendations = [];
    
    switch (disease.DiseaseName.toLowerCase()) {
      case 'influenza':
        recommendations = [
          'Get annual flu vaccination',
          'Practice regular handwashing',
          'Avoid close contact with sick individuals',
          'Maintain good sleep and nutrition habits',
          'Stay home when sick to prevent spread'
        ];
        break;
      case 'hypertension':
        recommendations = [
          'Maintain healthy weight',
          'Regular physical activity (150 min/week)',
          'Reduce sodium intake (<2300mg daily)',
          'Limit alcohol consumption',
          'Manage stress with mindfulness techniques',
          'Regular blood pressure monitoring'
        ];
        break;
      case 'diabetes':
        recommendations = [
          'Regular physical activity',
          'Maintain healthy weight',
          'Limit refined carbohydrates and sugars',
          'Regular blood glucose monitoring',
          'Annual eye examinations',
          'Proper foot care'
        ];
        break;
      default:
        recommendations = [
          'Maintain a healthy diet rich in fruits and vegetables',
          'Regular physical activity',
          'Adequate sleep (7-8 hours)',
          'Stress management techniques',
          'Regular medical check-ups',
          'Avoid tobacco and excessive alcohol'
        ];
    }
    
    return {
      disease: disease.DiseaseName,
      recommendations,
      generalAdvice: 'Always consult healthcare professionals for personalized medical advice.'
    };
  }

  /**
   * Analyze disease risk factors based on patient data and symptoms
   */
  analyzeRiskFactors(patientData, symptoms) {
    // Placeholder for risk factor analysis
    // In a real system, this would use more sophisticated models
    
    const riskFactors = {
      age: null,
      gender: null,
      lifestyle: [],
      environmentalFactors: [],
      geneticPredisposition: []
    };
    
    // Age-related risk analysis
    if (patientData.age) {
      if (patientData.age > 65) {
        riskFactors.age = 'Higher risk due to age > 65';
      } else if (patientData.age < 12) {
        riskFactors.age = 'Potential pediatric considerations';
      }
    }
    
    // Gender-specific risk analysis
    if (patientData.gender) {
      const normalizedSymptoms = symptoms.map(s => s.toLowerCase());
      
      if (patientData.gender === 'Female' && 
          (normalizedSymptoms.includes('abdominal pain') || 
           normalizedSymptoms.includes('pelvic pain'))) {
        riskFactors.gender = 'Consider gynecological causes';
      }
      
      if (patientData.gender === 'Male' && normalizedSymptoms.includes('chest pain')) {
        riskFactors.gender = 'Higher risk of cardiovascular conditions';
      }
    }
    
    // Return comprehensive risk analysis
    return {
      patientSpecificRisks: riskFactors,
      recommendedScreenings: this._getRecommendedScreenings(patientData, symptoms)
    };
  }
  
  /**
   * Get recommended health screenings based on patient data and symptoms
   */
  _getRecommendedScreenings(patientData, symptoms) {
    const screenings = [];
    const normalizedSymptoms = symptoms.map(s => s.toLowerCase());
    
    // Age-based screenings
    if (patientData.age > 45) {
      screenings.push('Blood pressure monitoring');
      screenings.push('Cholesterol screening');
    }
    
    if (patientData.age > 50) {
      screenings.push('Colorectal cancer screening');
    }
    
    // Symptom-based screenings
    if (normalizedSymptoms.includes('fatigue') && normalizedSymptoms.includes('weight loss')) {
      screenings.push('Complete blood count');
      screenings.push('Thyroid function tests');
    }
    
    if (normalizedSymptoms.includes('chest pain') || normalizedSymptoms.includes('shortness of breath')) {
      screenings.push('ECG/EKG');
      screenings.push('Cardiac enzyme tests');
    }
    
    return screenings;
  }
}

// Create singleton instance
const diseasePredictor = new DiseasePredictor();

module.exports = diseasePredictor;
