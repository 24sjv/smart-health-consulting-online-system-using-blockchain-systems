const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Patient = require('../models/patient');
const Blockchain = require('../blockchain/Blockchain');
const blockchain = new Blockchain();

// Initialize blockchain
router.use(async (req, res, next) => {
  if (!req.app.locals.blockchainInitialized) {
    await blockchain.initializeChain();
    req.app.locals.blockchainInitialized = true;
  }
  next();
});

// Register a new patient
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, age, gender } = req.body;

    // Check if patient already exists
    const existingPatient = await Patient.findOne({ email });
    if (existingPatient) {
      return res.status(400).json({ message: 'Patient already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new patient
    const patient = new Patient({
      name,
      email,
      password: hashedPassword,
      age,
      gender
    });

    // Save patient to database
    await patient.save();

    // Create blockchain record for patient registration
    const patientData = {
      id: patient._id,
      name,
      email,
      age,
      gender,
      registeredAt: new Date()
    };

    await blockchain.addBlock(
      patientData,
      'PatientConsent',
      patient._id,
      `Patient ${name} registered`
    );

    // Create and return JWT token
    const token = jwt.sign(
      { id: patient._id, email: patient.email, role: 'patient' },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1h' }
    );

    res.status(201).json({
      message: 'Patient registered successfully',
      token,
      patient: {
        id: patient._id,
        name: patient.name,
        email: patient.email
      }
    });
  } catch (error) {
    console.error('Error registering patient:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login patient
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if patient exists
    const patient = await Patient.findOne({ email });
    if (!patient) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, patient.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create and return JWT token
    const token = jwt.sign(
      { id: patient._id, email: patient.email, role: 'patient' },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1h' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      patient: {
        id: patient._id,
        name: patient.name,
        email: patient.email
      }
    });
  } catch (error) {
    console.error('Error logging in patient:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get patient profile
router.get('/profile/:id', async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id).select('-password');
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Get patient blockchain records
    const blockchainRecords = await blockchain.getBlocksByEntity(patient._id);

    res.status(200).json({
      patient,
      blockchainRecords
    });
  } catch (error) {
    console.error('Error getting patient profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update patient medical history
router.post('/medical-history/:id', async (req, res) => {
  try {
    const { condition, diagnosedDate, medications, notes } = req.body;
    
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const newMedicalHistory = {
      condition,
      diagnosedDate: new Date(diagnosedDate),
      medications,
      notes
    };

    patient.medicalHistory.push(newMedicalHistory);
    await patient.save();

    // Create blockchain record for medical history update
    await blockchain.addBlock(
      newMedicalHistory,
      'MedicalRecord',
      patient._id,
      `Medical record added for patient ${patient.name}`
    );

    res.status(200).json({
      message: 'Medical history updated successfully',
      medicalHistory: patient.medicalHistory
    });
  } catch (error) {
    console.error('Error updating medical history:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all patients (for admin)
router.get('/', async (req, res) => {
  try {
    const patients = await Patient.find().select('-password');
    res.status(200).json(patients);
  } catch (error) {
    console.error('Error getting all patients:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
