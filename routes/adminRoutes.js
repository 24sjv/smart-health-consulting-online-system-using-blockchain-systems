const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Patient = require('../models/patient');
const Doctor = require('../models/doctor');
const Appointment = require('../models/appointment');
const Blockchain = require('../blockchain/Blockchain');
const blockchain = new Blockchain();

// Admin model (simple for demo purposes)
const adminCredentials = {
  email: 'admin@healthapp.com',
  password: 'admin123', // In production, this would be hashed and stored in a database
};

// Admin login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if credentials match
    if (email !== adminCredentials.email || password !== adminCredentials.password) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create and return JWT token
    const token = jwt.sign(
      { email: adminCredentials.email, role: 'admin' },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1h' }
    );

    res.status(200).json({
      message: 'Admin login successful',
      token
    });
  } catch (error) {
    console.error('Error logging in admin:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get statistics for dashboard
router.get('/statistics', async (req, res) => {
  try {
    const patientCount = await Patient.countDocuments();
    const doctorCount = await Doctor.countDocuments();
    const appointmentCount = await Appointment.countDocuments();
    const completedAppointments = await Appointment.countDocuments({ status: 'Completed' });
    const pendingAppointments = await Appointment.countDocuments({ status: 'Scheduled' });

    // Get blockchain statistics
    const recordsCount = await blockchain.getBlocksByType('MedicalRecord').then(records => records.length);
    const prescriptionsCount = await blockchain.getBlocksByType('Prescription').then(records => records.length);
    const doctorVerificationsCount = await blockchain.getBlocksByType('DoctorVerification').then(records => records.length);

    res.status(200).json({
      patientCount,
      doctorCount,
      appointmentCount,
      completedAppointments,
      pendingAppointments,
      blockchain: {
        recordsCount,
        prescriptionsCount,
        doctorVerificationsCount,
        totalRecords: recordsCount + prescriptionsCount + doctorVerificationsCount
      }
    });
  } catch (error) {
    console.error('Error getting admin statistics:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all patients
router.get('/patients', async (req, res) => {
  try {
    const patients = await Patient.find().select('-password');
    res.status(200).json(patients);
  } catch (error) {
    console.error('Error getting all patients:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all doctors
router.get('/doctors', async (req, res) => {
  try {
    const doctors = await Doctor.find().select('-password');
    res.status(200).json(doctors);
  } catch (error) {
    console.error('Error getting all doctors:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all appointments
router.get('/appointments', async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('patient', 'name email')
      .populate('doctor', 'name specialization')
      .sort({ date: -1 });
      
    res.status(200).json(appointments);
  } catch (error) {
    console.error('Error getting all appointments:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Verify doctor credentials on blockchain
router.post('/verify-doctor/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Check if doctor is already verified
    if (doctor.blockchainVerification) {
      return res.status(400).json({ message: 'Doctor already verified' });
    }

    // Create blockchain record for doctor verification
    const doctorData = {
      id: doctor._id,
      name: doctor.name,
      email: doctor.email,
      specialization: doctor.specialization,
      qualifications: doctor.qualifications,
      experience: doctor.experience,
      verifiedAt: new Date()
    };

    const blockchainRecord = await blockchain.addBlock(
      doctorData,
      'DoctorVerification',
      doctor._id,
      `Doctor ${doctor.name} credentials verified by admin`
    );

    // Update doctor with blockchain verification reference
    doctor.blockchainVerification = blockchainRecord._id;
    await doctor.save();

    res.status(200).json({
      message: 'Doctor verified successfully',
      blockchainRecord
    });
  } catch (error) {
    console.error('Error verifying doctor:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get blockchain records
router.get('/blockchain-records', async (req, res) => {
  try {
    const { type } = req.query;
    let records;

    if (type) {
      records = await blockchain.getBlocksByType(type);
    } else {
      // Get all records from the blockchain database
      const BlockchainRecord = require('../models/blockchainRecord');
      records = await BlockchainRecord.find().sort({ timestamp: -1 });
    }

    res.status(200).json(records);
  } catch (error) {
    console.error('Error getting blockchain records:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
