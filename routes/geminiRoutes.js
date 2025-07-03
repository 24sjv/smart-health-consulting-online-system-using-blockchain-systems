const express = require('express');
const router = express.Router();
const geminiService = require('../services/geminiService');

/**
 * @route   POST /api/gemini/analyze-symptoms
 * @desc    Analyze symptoms using Gemini AI
 * @access  Public
 */
router.post('/analyze-symptoms', async (req, res) => {
  try {
    const { symptoms } = req.body;
    
    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Please provide a valid array of symptoms' 
      });
    }
    
    const analysis = await geminiService.analyzeSymptoms(symptoms);
    res.json(analysis);
  } catch (error) {
    console.error('Error in symptom analysis route:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Error processing your request' 
    });
  }
});

/**
 * @route   POST /api/gemini/health-recommendations
 * @desc    Get personalized health recommendations
 * @access  Public
 */
router.post('/health-recommendations', async (req, res) => {
  try {
    const patientData = req.body;
    
    if (!patientData || !patientData.age || !patientData.gender) {
      return res.status(400).json({ 
        success: false, 
        error: 'Please provide valid patient data including age and gender' 
      });
    }
    
    const recommendations = await geminiService.getHealthRecommendations(patientData);
    res.json(recommendations);
  } catch (error) {
    console.error('Error in health recommendations route:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Error processing your request' 
    });
  }
});

/**
 * @route   POST /api/gemini/chat
 * @desc    Chat with the medical assistant
 * @access  Public
 */
router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ 
        success: false, 
        error: 'Please provide a valid message' 
      });
    }
    
    const response = await geminiService.chatWithAssistant(message);
    res.json(response);
  } catch (error) {
    console.error('Error in chat route:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Error processing your request' 
    });
  }
});

/**
 * @route   GET /api/gemini/medication-info/:medication
 * @desc    Get information about a medication
 * @access  Public
 */
router.get('/medication-info/:medication', async (req, res) => {
  try {
    const { medication } = req.params;
    
    if (!medication) {
      return res.status(400).json({ 
        success: false, 
        error: 'Please provide a valid medication name' 
      });
    }
    
    const medicationInfo = await geminiService.getMedicationInfo(medication);
    res.json(medicationInfo);
  } catch (error) {
    console.error('Error in medication info route:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Error processing your request' 
    });
  }
});

/**
 * @route   POST /api/gemini/find-hospitals
 * @desc    Find nearby hospitals based on location
 * @access  Public
 */
router.post('/find-hospitals', async (req, res) => {
  try {
    const { location } = req.body;
    
    if (!location || typeof location !== 'string' || location.trim() === '') {
      return res.status(400).json({ 
        success: false, 
        error: 'Please provide a valid location' 
      });
    }
    
    const hospitalsData = await geminiService.findNearbyHospitals(location);
    res.json(hospitalsData);
  } catch (error) {
    console.error('Error in find hospitals route:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Error processing your request' 
    });
  }
});

module.exports = router;
