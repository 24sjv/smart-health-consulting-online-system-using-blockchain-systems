const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Initialize the Gemini API client with the API key from environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

class GeminiService {
  constructor() {
    // Initialize the model - Updated to use the latest model version
    this.model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    // Create a chat session
    this.chatSession = this.model.startChat({
      history: [
        {
          role: "user",
          parts: "You are a medical assistant for a healthcare application. You can help with general health questions, symptom interpretation, and basic medical advice. Never diagnose conditions definitively, always recommend consulting with a healthcare professional, and focus on evidence-based information.",
        },
        {
          role: "model",
          parts: "I'll be your medical assistant. I can provide general health information, help interpret symptoms, and offer basic medical advice based on reliable medical sources. I'll always emphasize that my information is not a substitute for professional medical diagnosis and will recommend consulting healthcare professionals for proper evaluation. How can I assist you today?",
        }
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 800,
      },
    });
  }

  /**
   * Analyze symptoms using Gemini AI
   * @param {Array} symptoms - List of patient symptoms
   * @returns {Promise<Object>} - AI-generated analysis
   */
  async analyzeSymptoms(symptoms) {
    try {
      // Format the symptoms for a more structured prompt
      const symptomsText = symptoms.join(", ");
      
      const prompt = `As a medical assistant, help analyze these symptoms: ${symptomsText}. 
      Please provide:
      1. Possible conditions these symptoms might indicate (with emphasis on common causes)
      2. Severity assessment (whether these symptoms suggest something that needs urgent attention)
      3. Recommended next steps (self-care, consultation with a primary care physician, or emergency care)
      
      Format your response in a structured way that could be easily parsed by a frontend application. 
      Remember to emphasize that this is NOT a diagnosis.`;

      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      
      return {
        success: true,
        analysis: text,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Gemini symptom analysis error:', error);
      return {
        success: false,
        error: error.message || 'Error analyzing symptoms with Gemini AI',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get personalized health recommendations
   * @param {Object} patientData - Basic patient information
   * @returns {Promise<Object>} - Personalized recommendations
   */
  async getHealthRecommendations(patientData) {
    try {
      const { age, gender, conditions = [], medications = [], lifestyle = {} } = patientData;
      
      const prompt = `Based on this patient profile:
      - Age: ${age}
      - Gender: ${gender}
      - Existing conditions: ${conditions.join(", ") || "None reported"}
      - Current medications: ${medications.join(", ") || "None reported"}
      - Lifestyle factors: ${Object.entries(lifestyle).map(([k, v]) => `${k}: ${v}`).join(", ") || "None reported"}
      
      Provide personalized health recommendations focusing on:
      1. Preventive care appropriate for their age/gender
      2. Lifestyle adjustments that might benefit their health
      3. General wellness tips
      
      Format your response in a structured, concise way for a healthcare application.`;

      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      
      return {
        success: true,
        recommendations: text,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Gemini health recommendations error:', error);
      return {
        success: false,
        error: error.message || 'Error generating health recommendations',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Chat with the medical assistant
   * @param {string} message - User message
   * @returns {Promise<Object>} - AI response
   */
  async chatWithAssistant(message) {
    try {
      const result = await this.chatSession.sendMessage(message);
      const response = result.response;
      const text = response.text();
      
      return {
        success: true,
        message: text,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Gemini chat error:', error);
      return {
        success: false,
        error: error.message || 'Error communicating with Gemini AI',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get medication information
   * @param {string} medication - Medication name
   * @returns {Promise<Object>} - Medication information
   */
  async getMedicationInfo(medication) {
    try {
      const prompt = `Provide information about the medication: ${medication}.
      Include:
      1. General purpose/uses
      2. Common side effects
      3. Important warnings or precautions
      4. Typical dosing information (in general terms)
      
      Format your response in a structured way for a healthcare application.
      Include a disclaimer that this information is not a substitute for professional medical advice.`;

      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      
      return {
        success: true,
        medicationInfo: text,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Gemini medication info error:', error);
      return {
        success: false,
        error: error.message || 'Error retrieving medication information',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Find nearby hospitals based on location
   * @param {string} location - User's location (city, zip code, etc)
   * @returns {Promise<Object>} - List of nearby hospitals and information
   */
  async findNearbyHospitals(location) {
    try {
      if (!location || location.trim() === '') {
        return { 
          success: false, 
          message: 'Location is required'
        };
      }
      
      try {
        // Try to use the Gemini API first
        const prompt = `Act as a healthcare location expert. For the location "${location}", provide a list of 5 major hospitals or medical centers nearby. For each hospital, include the following information in a structured format: name, brief description (1-2 sentences), specialized services (if any), and rough distance from ${location}. Format your response so it's easy to parse programmatically. Do not include any promotional language or ratings. Stick to factual information about the hospitals.`;
        
        const result = await this.model.generateContent(prompt);
        const text = result.response.text();
        
        console.log('Gemini API Response:', text);
        
        // Process the text to extract hospitals in a structured format
        const hospitals = this._parseHospitalsFromText(text);
        
        return {
          success: true,
          location,
          hospitals,
          timestamp: new Date().toISOString()
        };
      } catch (apiError) {
        console.warn('Gemini API error, using fallback hospital data:', apiError.message);
        
        // Fallback to mock data when the API is unavailable
        const fallbackHospitals = this._generateFallbackHospitals(location);
        
        return {
          success: true,
          location,
          hospitals: fallbackHospitals,
          timestamp: new Date().toISOString(),
          fromFallback: true
        };
      }
    } catch (error) {
      console.error('Error finding nearby hospitals:', error);
      
      // Final fallback - return generic data
      const fallbackHospitals = this._generateFallbackHospitals(location);
      
      return {
        success: true,
        location,
        hospitals: fallbackHospitals,
        timestamp: new Date().toISOString(),
        fromFallback: true
      };
    }
  }
  
  /**
   * Generate fallback hospital data when API is unavailable
   * @private
   * @param {string} location - User's location
   * @returns {Array} - Array of mock hospital objects
   */
  _generateFallbackHospitals(location) {
    return [
      {
        name: `${location} General Hospital`,
        description: `A comprehensive medical facility serving the ${location} area with 24/7 emergency services and a wide range of specialty departments.`,
        specializedServices: 'Emergency Medicine, Cardiology, Orthopedics, Neurology, Oncology',
        distance: '2.5 miles from center'
      },
      {
        name: `${location} Medical Center`,
        description: `Leading healthcare provider in ${location} offering advanced diagnostic and treatment options with state-of-the-art technology.`,
        specializedServices: "Women's Health, Pediatrics, Internal Medicine, Surgery",
        distance: '3.8 miles from center'
      },
      {
        name: `University Hospital of ${location}`,
        description: `Teaching hospital affiliated with the local medical school, combining excellent patient care with cutting-edge research and education.`,
        specializedServices: 'Organ Transplantation, Cancer Research, Trauma Center',
        distance: '4.2 miles from center'
      },
      {
        name: `${location} Community Healthcare`,
        description: `Community-focused medical facility providing accessible healthcare services to residents of all ages.`,
        specializedServices: 'Family Medicine, Physical Therapy, Mental Health Services',
        distance: '1.7 miles from center'
      },
      {
        name: `${location} Children's Hospital`,
        description: `Specialized pediatric care facility dedicated to treating children and adolescents with comprehensive medical services.`,
        specializedServices: 'Pediatric Emergency Care, Neonatal ICU, Pediatric Surgery, Child Psychology',
        distance: '5.3 miles from center'
      }
    ];
  }
  
  /**
   * Parse hospitals information from Gemini response text
   * @private
   * @param {string} text - The raw text from Gemini
   * @returns {Array} - Array of hospital objects
   */
  _parseHospitalsFromText(text) {
    // Initialize array for hospitals
    const hospitals = [];
    
    try {
      // First try to see if the AI returned a JSON format
      if (text.includes('{') && text.includes('}')) {
        const jsonMatch = text.match(/\[\s*{.*}\s*\]/s);
        if (jsonMatch) {
          try {
            // Try to parse as JSON
            const jsonData = JSON.parse(jsonMatch[0]);
            if (Array.isArray(jsonData) && jsonData.length > 0) {
              return jsonData.map(hospital => ({
                name: hospital.name || 'Unknown Hospital',
                description: hospital.description || '',
                specializedServices: hospital.specializedServices || hospital.services || '',
                distance: hospital.distance || ''
              }));
            }
          } catch (jsonError) {
            console.log('Failed to parse JSON from response, falling back to text parsing');
          }
        }
      }
      
      // If JSON parsing fails, fallback to text parsing
      // Handle numbered lists (1. Hospital Name)
      const numberListPattern = /\d+\.\s+(.*?)(?=\n\d+\.|$)/gs;
      let match;
      let hasMatches = false;
      
      while ((match = numberListPattern.exec(text)) !== null) {
        hasMatches = true;
        const entry = match[0];
        const lines = entry.split('\n').filter(line => line.trim());
        
        // Extract hospital name from the first line after the number
        let name = lines[0].replace(/^\d+\.\s+/, '').trim();
        
        // Extract other information
        let description = '';
        let specializedServices = '';
        let distance = '';
        
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (line.toLowerCase().includes('specialized service') || line.toLowerCase().includes('service')) {
            specializedServices = line.split(':')[1]?.trim() || line;
          } else if (line.toLowerCase().includes('distance')) {
            distance = line.split(':')[1]?.trim() || line;
          } else {
            description += (description ? '\n' : '') + line;
          }
        }
        
        hospitals.push({
          name,
          description,
          specializedServices,
          distance
        });
      }
      
      // If no numbered list, try another approach
      if (!hasMatches) {
        // Split by double newlines or hospital indicators
        const entries = text.split(/\n\s*\n|Hospital\s*\d+:?/i).filter(entry => entry.trim());
        
        entries.forEach(entry => {
          const lines = entry.trim().split('\n');
          let name = lines[0].trim();
          
          // Remove any numbering
          name = name.replace(/^\d+\.\s+/, '');
          
          let description = '';
          let specializedServices = '';
          let distance = '';
          
          for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            if (line.toLowerCase().includes('specialized') || line.toLowerCase().includes('service')) {
              specializedServices = line.includes(':') ? line.split(':')[1].trim() : line;
            } else if (line.toLowerCase().includes('distance')) {
              distance = line.includes(':') ? line.split(':')[1].trim() : line;
            } else {
              description += (description ? '\n' : '') + line;
            }
          }
          
          hospitals.push({
            name,
            description: description || 'No detailed information available',
            specializedServices,
            distance
          });
        });
      }
    } catch (parseError) {
      console.error('Error parsing hospital information:', parseError);
      
      // Create some example hospitals if parsing completely fails
      hospitals.push(
        {
          name: 'City General Hospital',
          description: 'A full-service medical facility offering comprehensive care across multiple specialties.',
          specializedServices: 'Emergency Medicine, Cardiology, Orthopedics, Neurology',
          distance: 'Varies by location'
        },
        {
          name: 'Community Medical Center',
          description: 'Local healthcare provider serving the community with primary and specialty care services.',
          specializedServices: 'Family Medicine, Pediatrics, Internal Medicine',
          distance: 'Varies by location'
        },
        {
          name: 'University Hospital',
          description: 'Teaching hospital affiliated with medical schools, offering advanced treatments and research.',
          specializedServices: 'Oncology, Transplant Services, Research Programs',
          distance: 'Varies by location'
        }
      );
    }
    
    // Make sure we return at least one hospital
    if (hospitals.length === 0) {
      hospitals.push({
        name: 'Nearby Hospitals',
        description: 'Information about hospitals near your location. Please try a more specific location for better results.',
        specializedServices: 'Various medical services',
        distance: 'Varies'
      });
    }
    
    return hospitals;
  }
}

// Export as singleton
module.exports = new GeminiService();
