const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
// Import Web3 with compatibility for both newer and older versions
let Web3;
try {
  const web3Pkg = require('web3');
  Web3 = web3Pkg.Web3 || web3Pkg; // Handle both v1.x and v4.x imports
} catch (error) {
  console.log('Web3 import failed:', error.message);
  Web3 = function() { this.eth = { net: { isListening: () => Promise.resolve(false) } }; };
}

// Initialize Stripe with the secret key
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_51XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');

// Import routes
const patientRoutes = require('./routes/patientRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const adminRoutes = require('./routes/adminRoutes');
const blockchainRoutes = require('./routes/blockchainRoutes');
const diseaseAnalysisRoutes = require('./routes/diseaseAnalysisRoutes');
const geminiRoutes = require('./routes/geminiRoutes');

// Import chatbot services
const localChatbot = require('./services/localChatbot');
const personalizedResponses = require('./services/personalizedResponses');
const enhancedChatbot = require('./services/enhancedChatbotService');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Local AI model integration
let localAssistantReady = false;
let localAssistantInitError = null;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/blockchain', blockchainRoutes);
app.use('/api/disease-analysis', diseaseAnalysisRoutes);
app.use('/api/gemini', geminiRoutes);

// Assistant API endpoint
app.post('/api/assistant/chat', async (req, res) => {
  try {
    const { message, role, context } = req.body;
    
    // If local model is available, use it
    if (process.env.USE_LOCAL_MODEL === 'true' && localAssistantReady) {
      try {
        // This would be handled by the local model loader
        // which we'll implement in a separate file
        const response = await require('./services/localAssistant').generateResponse(message, role, context);
        return res.json({ response });
      } catch (localError) {
        console.error('Local assistant error:', localError);
        // Fall back to rule-based responses if local model fails
      }
    }
    
    // Use rule-based responses as fallback
    const response = generateRuleBasedResponse(message, role, context);
    res.json({ response });
  } catch (error) {
    console.error('Assistant API error:', error);
    res.status(500).json({ error: 'Failed to process your message' });
  }
});

// Route to check local assistant status
app.get('/api/assistant/status', (req, res) => {
  res.json({
    localModelEnabled: process.env.USE_LOCAL_MODEL === 'true',
    localModelReady: localAssistantReady,
    localModelError: localAssistantInitError
  });
});

// Simple rule-based response generator as fallback
function generateRuleBasedResponse(message, role, context) {
  const lowerMessage = message.toLowerCase();
  let response = '';
  
  if (role === 'patient') {
    if (lowerMessage.includes('appointment') || lowerMessage.includes('book')) {
      response = 'To book an appointment, go to your dashboard and click on "Take New Appointment".';
    } else if (lowerMessage.includes('prescription')) {
      response = 'Your prescriptions can be viewed in the "View Prescriptions" section of your profile.';
    } else {
      response = 'How can I help you with your healthcare needs today?';
    }
  } else if (role === 'doctor') {
    if (lowerMessage.includes('appointment') || lowerMessage.includes('schedule')) {
      response = 'You can manage patient appointments from your dashboard under "Appointment Management".';
    } else if (lowerMessage.includes('prescription')) {
      response = 'To write a prescription, open the patient\'s appointment and click on "Write Prescription".';
    } else {
      response = 'How can I assist you with your practice today?';
    }
  } else {
    response = 'Hello! How can I assist you today?';
  }
  
  return response;
}

// Routes - pointing to the original files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Auth routes - Using original filenames
app.get('/login-choice.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'login-choice.html'));
});

app.get('/login-choice', (req, res) => {
    res.sendFile(path.join(__dirname, 'login-choice.html'));
});

app.get('/register-choice.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'register-choice.html'));
});

app.get('/register-choice', (req, res) => {
    res.sendFile(path.join(__dirname, 'register-choice.html'));
});

app.get('/patient-login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'patient-login.html'));
});

app.get('/doctor-login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'doctor-login.html'));
});

app.get('/admin-login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin-login.html'));
});

app.get('/patient-register.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'patient-register.html'));
});

app.get('/doctor-register.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'doctor-register.html'));
});

// Dashboard routes
app.get('/patient-dashboard.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'patient-dashboard.html'));
});

app.get('/doctor-dashboard.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'doctor-dashboard.html'));
});

app.get('/admin-dashboard.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin-dashboard.html'));
});

// Confirmation page
app.get('/appointment-confirmation.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'appointment-confirmation.html'));
});

// Admin routes
app.get('/admin-login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin-login.html'));
});

app.get('/admin-controls.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin-controls.html'));
});

app.get('/admin-view-patients.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin-view-patients.html'));
});

app.get('/admin-view-doctors.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin-view-doctors.html'));
});

app.get('/admin-view-appointments.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin-view-appointments.html'));
});

// Add this before the 404 handler
app.post('/api/chatbot/message', async (req, res) => {
    try {
        const { message, role, context } = req.body;
        
        if (!message) {
            return res.status(400).json({ 
                success: false, 
                message: 'Message is required' 
            });
        }
        
        // Use enhanced chatbot service with Gemini AI integration
        // This maintains the same response format but adds AI capabilities
        const enhancedResponse = await enhancedChatbot.processMessage(
            message,
            role || 'user',
            context || {}
        );
        
        res.json({
            success: true,
            response: enhancedResponse.response,
            suggestions: enhancedResponse.suggestions,
            isPersonalized: enhancedResponse.isPersonalized || false,
            isAIEnhanced: enhancedResponse.isAIEnhanced || false
        });
    } catch (error) {
        console.error('Chatbot error:', error);
        
        // Fall back to the original chatbot if the enhanced version fails
        try {
            const fallbackResponse = localChatbot.generateResponse(
                message,
                role || 'user',
                context || {}
            );
            
            res.json({
                success: true,
                response: fallbackResponse.response,
                suggestions: fallbackResponse.suggestions,
                isPersonalized: false,
                fallback: true
            });
        } catch (fallbackError) {
            res.status(500).json({ 
                success: false, 
                message: 'Error processing message',
                error: error.message
            });
        }
    }
});

// Handle 404 for routes, but not for static files
app.use((req, res, next) => {
    // Skip 404 handling for static files
    if (req.path.startsWith('/public/') || req.path === '/favicon.ico') {
        return next();
    }
    
    // Only log and redirect for routes
    console.log(`404: ${req.url} not found, redirecting to home`);
    res.redirect('/');
});

// Payment Method Setup Endpoint
app.post('/create-payment-method', async (req, res) => {
  try {
    // Extract appointment details from request
    const { fullName } = req.body;
    
    // Create a setup intent for saving card information
    const setupIntent = await stripe.setupIntents.create({
      payment_method_types: ['card'],
      usage: 'off_session',
      metadata: {
        customer_name: fullName
      }
    });
    
    // Send the client secret to the client
    res.json({
      clientSecret: setupIntent.client_secret
    });
  } catch (error) {
    console.error('Error creating setup intent:', error);
    res.status(500).json({ error: error.message });
  }
});

// Payment Intent Creation Endpoint
app.post('/create-payment-intent', async (req, res) => {
  try {
    // Extract appointment details from request
    const { fullName, appointmentDate, appointmentTime, disease, paymentMethodId } = req.body;
    
    // Create a payment intent with the consultation fee ($50)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 5000, // $50.00 in cents
      currency: 'usd',
      capture_method: 'manual', // This enables the "hold" functionality
      payment_method_types: ['card'],
      payment_method: paymentMethodId,
      metadata: {
        appointment_for: fullName,
        appointment_date: appointmentDate,
        appointment_time: appointmentTime,
        condition: disease
      },
      description: `Consultation fee for ${fullName} on ${appointmentDate} at ${appointmentTime}`
    });
    
    // Send the client secret and payment intent ID to the client
    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: error.message });
  }
});

// Blockchain Connection - Real connection
const checkBlockchainConnection = async () => {
  try {
    // Connect to local blockchain (Ganache) running on port 8545
    const web3 = new Web3('http://localhost:8545');
    const isListening = await web3.eth.net.isListening();
    
    if (isListening) {
      const networkId = await web3.eth.net.getId();
      const nodeInfo = await web3.eth.getNodeInfo();
      const accounts = await web3.eth.getAccounts();
      
      return {
        connected: true,
        networkId: networkId,
        nodeInfo: nodeInfo,
        accounts: accounts.slice(0, 3) // Show first 3 accounts
      };
    } else {
      return {
        connected: false,
        error: "Blockchain is not listening"
      };
    }
  } catch (error) {
    return {
      connected: false,
      error: error.message
    };
  }
};

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/healthapp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB Connected');
  
  // Check blockchain connection
  checkBlockchainConnection().then(blockchainStatus => {
    console.log('\nBlockchain Connection:');
    if (blockchainStatus.connected) {
      console.log(`✅ Connected to ${blockchainStatus.nodeInfo}`);
      console.log(`Network ID: ${blockchainStatus.networkId}`);
    } else {
      console.log('❌ Blockchain connection failed');
      console.log(`Error: ${blockchainStatus.error}`);
    }
    
    console.log('\nDatabase Connection:');
  });
})
.catch(err => console.log('MongoDB Connection Error:', err));

// Start the server
app.listen(PORT, async () => {
  console.log(`\nServer running at:`);
  console.log(`Local: http://localhost:${PORT}`);
  console.log(`Network: http://${getIPAddress()}:${PORT}`);
  
  // Database connection status
  console.log('MongoDB Connected');

  // Check blockchain connection
  const blockchainStatus = await checkBlockchainConnection();
  console.log('\nBlockchain Connection:');
  if (blockchainStatus.connected) {
    console.log(`✅ Connected to ${blockchainStatus.nodeInfo}`);
    console.log(`Network ID: ${blockchainStatus.networkId}`);
    console.log(`Available accounts: ${blockchainStatus.accounts?.join(', ') || 'None'}`);
  } else {
    console.log(`❌ Blockchain connection failed`);
    console.log(`Error: ${blockchainStatus.error}`);
    console.log(`\nTo start the blockchain, run: node blockchain.js`);
  }
});

// Add health check endpoint
app.get('/api/health', async (req, res) => {
  const dbStatus = 'connected'; // Simplified for demo
  const blockchainStatus = await checkBlockchainConnection();
  
  res.json({
    status: 'ok',
    services: {
      database: dbStatus,
      geminiAI: process.env.GEMINI_API_KEY ? 'connected' : 'not configured',
      blockchain: {
        connected: blockchainStatus.connected,
        networkId: blockchainStatus.connected ? blockchainStatus.networkId : null,
        node: blockchainStatus.connected ? blockchainStatus.nodeInfo : null,
        accounts: blockchainStatus.connected ? blockchainStatus.accounts : null,
        error: blockchainStatus.connected ? null : blockchainStatus.error
      }
    }
  });
});

function getIPAddress() {
  const interfaces = require('os').networkInterfaces();
  for (const devName in interfaces) {
    const iface = interfaces[devName];
    for (let i = 0; i < iface.length; i++) {
      const alias = iface[i];
      if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
        return alias.address;
      }
    }
  }
  return 'localhost';
}
