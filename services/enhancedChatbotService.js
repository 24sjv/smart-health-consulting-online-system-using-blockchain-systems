/**
 * Enhanced Chatbot Service
 * Integrates Gemini AI with the existing rule-based chatbot
 */

const localChatbot = require('./localChatbot');
const geminiService = require('./geminiService');
const personalizedResponses = require('./personalizedResponses');

class EnhancedChatbotService {
  constructor() {
    this.isGeminiAvailable = false;
    // Check if Gemini API is available
    this._checkGeminiAvailability();
  }

  /**
   * Check if Gemini API is available
   * @private
   */
  async _checkGeminiAvailability() {
    if (process.env.GEMINI_API_KEY) {
      try {
        // Test with a simple query
        const testResponse = await geminiService.chatWithAssistant("Hello");
        this.isGeminiAvailable = testResponse.success;
        console.log("Gemini AI integration enabled for chatbot");
      } catch (error) {
        console.error("Gemini AI not available for chatbot:", error.message);
        this.isGeminiAvailable = false;
      }
    } else {
      this.isGeminiAvailable = false;
      console.log("Gemini AI not configured for chatbot (API key missing)");
    }
  }

  /**
   * Process a user message and generate a response
   * This method enhances the existing chatbot with Gemini AI capabilities
   * @param {string} message - User's message
   * @param {string} role - User role (patient or doctor)
   * @param {Object} context - Additional context information
   * @returns {Promise<Object>} Enhanced response
   */
  async processMessage(message, role = 'user', context = {}) {
    // First, generate the traditional rule-based response
    const traditionalResponse = localChatbot.generateResponse(message, role, context);
    
    let finalResponse = {
      success: true,
      response: traditionalResponse.response,
      suggestions: traditionalResponse.suggestions,
      isPersonalized: false,
      isAIEnhanced: false
    };

    try {
      // Try to enhance with personalized data first
      if (context && (role === 'patient' || role === 'doctor')) {
        try {
          const personalizedResponse = personalizedResponses.enhanceResponseWithPersonalData(
            traditionalResponse.response, 
            role, 
            message, 
            context
          );
          
          // If we got a personalized response that's different from the original, use it
          if (personalizedResponse !== traditionalResponse.response) {
            finalResponse.response = personalizedResponse;
            finalResponse.isPersonalized = true;
          }
        } catch (personalError) {
          console.error('Error generating personalized response:', personalError);
          // Continue with non-personalized response if there's an error
        }
      }

      // Now try to enhance with Gemini AI if available
      if (this.isGeminiAvailable) {
        try {
          // Check if the message is suitable for Gemini AI enhancement
          if (this._shouldUseGeminiAI(message)) {
            // Include context and previous response for better AI response
            const geminiPrompt = this._buildGeminiPrompt(message, role, context, finalResponse.response);
            
            // Call Gemini
            const geminiResponse = await geminiService.chatWithAssistant(geminiPrompt);
            
            if (geminiResponse.success) {
              // Replace the response with Gemini-enhanced response
              finalResponse.response = geminiResponse.message;
              finalResponse.isAIEnhanced = true;
              
              // Keep the original suggestions, as they're typically more actionable in the UI
            }
          }
        } catch (aiError) {
          console.error('Error enhancing with Gemini AI:', aiError);
          // Fall back to the personalized or traditional response
        }
      }
    } catch (error) {
      console.error('Error in enhanced chatbot:', error);
      // Fall back to traditional response if any errors occur
    }

    return finalResponse;
  }

  /**
   * Check if a message should use Gemini AI enhancement
   * @param {string} message - The user message
   * @returns {boolean} Whether to use Gemini AI
   * @private
   */
  _shouldUseGeminiAI(message) {
    const lowerMessage = message.toLowerCase();
    
    // Skip AI for very simple or system-related queries
    if (message.length < 5) return false;
    if (lowerMessage.includes('hello') && message.length < 10) return false;
    if (lowerMessage.includes('hi') && message.length < 5) return false;
    if (lowerMessage.includes('logout') || lowerMessage.includes('login')) return false;
    if (lowerMessage.includes('dashboard') || lowerMessage.includes('profile')) return false;
    
    // Use AI for medical queries, complex questions, and unique queries
    return true;
  }

  /**
   * Build a prompt for Gemini that includes context
   * @param {string} message - User message
   * @param {string} role - User role
   * @param {Object} context - Additional context
   * @param {string} traditionalResponse - Response from rule-based system
   * @returns {string} Enhanced prompt for Gemini
   * @private
   */
  _buildGeminiPrompt(message, role, context, traditionalResponse) {
    let prompt = `You are a medical assistant in a healthcare application chatbot. `;
    
    // Add role context
    if (role === 'patient') {
      prompt += `You're speaking to a patient. `;
      if (context.patientName) {
        prompt += `The patient's name is ${context.patientName}. `;
      }
      if (context.medicalHistory) {
        prompt += `Their medical history includes: ${context.medicalHistory}. `;
      }
    } else if (role === 'doctor') {
      prompt += `You're speaking to a doctor. `;
      if (context.doctorName) {
        prompt += `The doctor's name is ${context.doctorName}. `;
      }
      if (context.specialization) {
        prompt += `Their specialization is ${context.specialization}. `;
      }
    }
    
    // Include the traditional response for context
    prompt += `\n\nThe rule-based system generated this response: "${traditionalResponse}"\n\n`;
    
    // Add the user's query
    prompt += `Please provide a more detailed, medically accurate, and helpful response to this query: "${message}".`;
    
    // Add constraints
    prompt += `\nKeep your response concise (under 200 words), accurate, and helpful. Always recommend consulting a healthcare professional for personal medical advice. Do not add disclaimers at the end of every response, this is implied.`;
    
    return prompt;
  }
}

// Export as singleton
module.exports = new EnhancedChatbotService();
