/**
 * Disease Analysis Routes
 * API endpoints for disease prediction and analysis
 */
const express = require('express');
const router = express.Router();
const diseaseAnalysisService = require('../services/ml/diseaseAnalysisService');

// Initialize the disease analysis service when routes are first loaded
diseaseAnalysisService.initialize().then(success => {
  if (success) {
    console.log('✅ Disease Analysis Engine initialized successfully');
  } else {
    console.error('❌ Failed to initialize Disease Analysis Engine');
  }
});

/**
 * @route   POST /api/disease-analysis/predict
 * @desc    Analyze symptoms and predict possible diseases
 * @access  Public
 */
router.post('/predict', async (req, res) => {
  try {
    const { symptoms, limit } = req.body;
    
    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide an array of symptoms' 
      });
    }
    
    const result = await diseaseAnalysisService.analyzeSymptoms(symptoms, limit || 5);
    res.json(result);
  } catch (error) {
    console.error('Error in disease prediction endpoint:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error processing disease prediction',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/disease-analysis/symptoms
 * @desc    Get all available symptoms for autocomplete
 * @access  Public
 */
router.get('/symptoms', async (req, res) => {
  try {
    const result = await diseaseAnalysisService.getAllSymptoms();
    res.json(result);
  } catch (error) {
    console.error('Error fetching symptoms:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching symptoms list',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/disease-analysis/prevention/:diseaseId
 * @desc    Get prevention recommendations for a specific disease
 * @access  Public
 */
router.get('/prevention/:diseaseId', async (req, res) => {
  try {
    const { diseaseId } = req.params;
    
    if (!diseaseId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide a disease ID' 
      });
    }
    
    const result = await diseaseAnalysisService.getPreventionRecommendations(diseaseId);
    res.json(result);
  } catch (error) {
    console.error('Error fetching prevention recommendations:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching prevention recommendations',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/disease-analysis/risk-factors
 * @desc    Analyze patient risk factors based on symptoms and patient data
 * @access  Private
 */
router.post('/risk-factors', async (req, res) => {
  try {
    const { patientData, symptoms } = req.body;
    
    if (!patientData || !symptoms || !Array.isArray(symptoms)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide patient data and an array of symptoms' 
      });
    }
    
    const result = await diseaseAnalysisService.analyzeRiskFactors(patientData, symptoms);
    res.json(result);
  } catch (error) {
    console.error('Error analyzing risk factors:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error analyzing risk factors',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/disease-analysis/status
 * @desc    Check the status of the disease analysis service
 * @access  Public
 */
router.get('/status', async (req, res) => {
  try {
    const initialized = await diseaseAnalysisService.initialized;
    
    res.json({
      success: true,
      status: {
        initialized,
        ready: initialized,
        algorithms: initialized ? ['naiveBayes', 'weightedSymptoms', 'similarityBased'] : []
      }
    });
  } catch (error) {
    console.error('Error checking disease analysis status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error checking disease analysis status',
      error: error.message
    });
  }
});

module.exports = router;
