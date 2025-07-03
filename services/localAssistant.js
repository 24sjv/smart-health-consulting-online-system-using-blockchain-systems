/**
 * Local AI Assistant Service
 * This service provides an interface to use local AI models for the chatbot
 */

const { pipeline } = require('transformers');
let model = null;
let isInitializing = false;
let initializationError = null;

// Initialize the model
async function initializeModel() {
  if (model || isInitializing) return;
  
  isInitializing = true;
  console.log('Initializing local AI model...');
  
  try {
    // Load the model - Mistral 7B is a good balance of size and performance
    // Users can replace 'mistralai/Mistral-7B' with other models like 'meta-llama/Llama-3-8B'
    model = await pipeline('text-generation', 'mistralai/Mistral-7B');
    console.log('Local AI model initialized successfully!');
    
    // Update server status
    if (global.localAssistantReady !== undefined) {
      global.localAssistantReady = true;
    }
  } catch (error) {
    console.error('Failed to initialize local AI model:', error);
    initializationError = error.message;
    
    // Update server status
    if (global.localAssistantInitError !== undefined) {
      global.localAssistantInitError = error.message;
    }
  } finally {
    isInitializing = false;
  }
}

// Generate a response using the local model
async function generateResponse(message, role = 'user', context = {}) {
  // If model isn't initialized, try to initialize it
  if (!model && !initializationError) {
    await initializeModel();
  }
  
  // If model failed to initialize, throw an error
  if (initializationError) {
    throw new Error(`Model initialization failed: ${initializationError}`);
  }
  
  // If model still initializing, return a placeholder
  if (!model) {
    return "I'm still warming up. Please try again in a moment.";
  }
  
  try {
    // Create a prompt appropriate for the model
    let prompt = '';
    
    // Add role context
    if (role === 'patient') {
      prompt = `As a healthcare assistant helping a patient: ${message}`;
    } else if (role === 'doctor') {
      prompt = `As a healthcare assistant helping a doctor: ${message}`;
    } else {
      prompt = `User: ${message}`;
    }
    
    // Add medical context if available
    if (context.medicalHistory) {
      prompt = `Medical history: ${context.medicalHistory}\n${prompt}`;
    }
    
    // Generate response with the model
    const result = await model(prompt, {
      max_length: 200,
      do_sample: true,
      temperature: 0.7,
      top_p: 0.9,
    });
    
    // Extract and clean the response
    let response = result[0].generated_text;
    
    // Remove the prompt from the response
    response = response.replace(prompt, '').trim();
    
    // In case the model didn't generate anything useful
    if (!response) {
      return "I'm sorry, I couldn't generate a helpful response. Please try rephrasing your question.";
    }
    
    return response;
  } catch (error) {
    console.error('Error generating response with local model:', error);
    throw error;
  }
}

// Start initialization process in the background
if (process.env.USE_LOCAL_MODEL === 'true') {
  initializeModel().catch(error => {
    console.error('Background initialization failed:', error);
  });
}

module.exports = {
  generateResponse,
  getStatus: () => ({
    initialized: !!model,
    initializing: isInitializing,
    error: initializationError
  })
}; 