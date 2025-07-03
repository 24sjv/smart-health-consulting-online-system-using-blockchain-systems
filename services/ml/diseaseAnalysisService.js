/**
 * Disease Analysis Service
 * High-level service to integrate ML capabilities with the rest of the application
 */
const diseasePredictor = require('./diseasePredictor');
const dataLoader = require('./dataLoader');

class DiseaseAnalysisService {
  constructor() {
    this.predictor = diseasePredictor;
    this.dataLoader = dataLoader;
    this.initialized = false;
  }

  /**
   * Initialize the service
   */
  async initialize() {
    try {
      if (!this.initialized) {
        // Load disease data
        await this.dataLoader.loadData();
        
        // Initialize predictor
        await this.predictor.initialize();
        
        this.initialized = true;
        console.log('Disease Analysis Service initialized successfully');
      }
      return true;
    } catch (error) {
      console.error('Failed to initialize Disease Analysis Service:', error);
      return false;
    }
  }

  /**
   * Analyze symptoms and predict possible diseases
   * @param {Array} symptoms - Array of symptom strings
   * @param {Number} limit - Maximum number of results to return
   * @returns {Object} Analysis results
   */
  async analyzeSymptoms(symptoms, limit = 5) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      // Get predictions from all algorithms
      const predictions = await this.predictor.predictDisease(symptoms, limit);
      
      // Ensemble the results from different algorithms for higher accuracy
      const ensembleResults = this._ensemblePredictions(predictions, limit);
      
      // Structure the response
      return {
        success: true,
        analysis: {
          inputSymptoms: symptoms,
          topDiseases: ensembleResults,
          algorithmResults: predictions,
          confidence: this._calculateOverallConfidence(ensembleResults),
        },
        metadata: {
          analysisTimestamp: new Date().toISOString(),
          modelsUsed: ['naiveBayes', 'weightedSymptoms', 'similarityBased']
        }
      };
    } catch (error) {
      console.error('Error analyzing symptoms:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Ensemble predictions from multiple algorithms
   * @param {Object} predictions - Predictions from different algorithms
   * @param {Number} limit - Maximum number of results to return
   * @returns {Array} Ensemble predictions
   */
  _ensemblePredictions(predictions, limit) {
    // Combine all predictions
    const allPredictions = [
      ...predictions.naiveBayes,
      ...predictions.weightedSymptoms,
      ...predictions.similarityBased
    ];
    
    // Group by disease and calculate average confidence
    const diseaseGroups = {};
    
    allPredictions.forEach(prediction => {
      if (!diseaseGroups[prediction.disease]) {
        diseaseGroups[prediction.disease] = {
          disease: prediction.disease,
          diseaseId: prediction.diseaseId,
          confidenceScores: [],
          description: prediction.description,
          symptoms: prediction.symptoms,
          treatment: prediction.treatment
        };
      }
      
      diseaseGroups[prediction.disease].confidenceScores.push(prediction.confidence);
    });
    
    // Calculate average confidence and create final results
    const ensembleResults = Object.values(diseaseGroups).map(group => {
      const avgConfidence = group.confidenceScores.reduce((sum, score) => sum + score, 0) / group.confidenceScores.length;
      
      return {
        disease: group.disease,
        diseaseId: group.diseaseId,
        confidence: avgConfidence,
        description: group.description,
        symptoms: group.symptoms,
        treatment: group.treatment,
        // Add consensus level based on how many algorithms agreed
        consensus: group.confidenceScores.length / 3 // 3 algorithms total
      };
    });
    
    // Sort by confidence and return top results
    return ensembleResults
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, limit);
  }

  /**
   * Calculate overall confidence in the analysis
   * @param {Array} results - Ensemble results
   * @returns {Number} Overall confidence score
   */
  _calculateOverallConfidence(results) {
    if (results.length === 0) {
      return 0;
    }
    
    // Weight top results more heavily
    let weightedSum = 0;
    let weightSum = 0;
    
    results.forEach((result, index) => {
      const weight = 1 / (index + 1); // First result gets weight 1, second gets 1/2, etc.
      weightedSum += result.confidence * weight;
      weightSum += weight;
    });
    
    return weightedSum / weightSum;
  }

  /**
   * Get recommendations for disease prevention
   * @param {String} diseaseId - ID of the disease
   * @returns {Object} Prevention recommendations
   */
  async getPreventionRecommendations(diseaseId) {
    if (!this.initialized) {
      await this.initialize();
    }
    
    try {
      const recommendations = this.predictor.getPreventionRecommendations(diseaseId);
      
      if (!recommendations) {
        return {
          success: false,
          error: 'Disease not found'
        };
      }
      
      return {
        success: true,
        recommendations
      };
    } catch (error) {
      console.error('Error getting prevention recommendations:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Analyze patient risk factors based on symptoms and patient data
   * @param {Object} patientData - Patient demographic and health data
   * @param {Array} symptoms - Array of symptom strings
   * @returns {Object} Risk factor analysis
   */
  async analyzeRiskFactors(patientData, symptoms) {
    if (!this.initialized) {
      await this.initialize();
    }
    
    try {
      const riskAnalysis = this.predictor.analyzeRiskFactors(patientData, symptoms);
      
      return {
        success: true,
        analysis: riskAnalysis
      };
    } catch (error) {
      console.error('Error analyzing risk factors:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get all available symptoms for autocomplete functionality
   * @returns {Array} List of all symptoms
   */
  async getAllSymptoms() {
    if (!this.initialized) {
      await this.initialize();
    }
    
    try {
      const symptoms = this.dataLoader.getAllSymptoms();
      
      return {
        success: true,
        symptoms
      };
    } catch (error) {
      console.error('Error getting symptoms list:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Create singleton instance
const diseaseAnalysisService = new DiseaseAnalysisService();

module.exports = diseaseAnalysisService;
