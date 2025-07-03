const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Doctor = require('../models/doctor');
const Appointment = require('../models/appointment');
const Blockchain = require('../blockchain/Blockchain');
const blockchain = new Blockchain();

// Register a new doctor
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, specialization, qualifications, experience, availability } = req.body;

    // Check if doctor already exists
    const existingDoctor = await Doctor.findOne({ email });
    if (existingDoctor) {
      return res.status(400).json({ message: 'Doctor already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new doctor
    const doctor = new Doctor({
      name,
      email,
      password: hashedPassword,
      specialization,
      qualifications,
      experience,
      availability
    });

    // Save doctor to database
    await doctor.save();

    // Create blockchain record for doctor verification
    const doctorData = {
      id: doctor._id,
      name,
      email,
      specialization,
      qualifications,
      experience,
      registeredAt: new Date()
    };

    const blockchainRecord = await blockchain.addBlock(
      doctorData,
      'DoctorVerification',
      doctor._id,
      `Doctor ${name} registered and credentials verified`
    );

    // Update doctor with blockchain verification reference
    doctor.blockchainVerification = blockchainRecord._id;
    await doctor.save();

    // Create and return JWT token
    const token = jwt.sign(
      { id: doctor._id, email: doctor.email, role: 'doctor' },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1h' }
    );

    res.status(201).json({
      message: 'Doctor registered successfully',
      token,
      doctor: {
        id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        specialization: doctor.specialization
      }
    });
  } catch (error) {
    console.error('Error registering doctor:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login doctor
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if doctor exists
    const doctor = await Doctor.findOne({ email });
    if (!doctor) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, doctor.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create and return JWT token
    const token = jwt.sign(
      { id: doctor._id, email: doctor.email, role: 'doctor' },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1h' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      doctor: {
        id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        specialization: doctor.specialization
      }
    });
  } catch (error) {
    console.error('Error logging in doctor:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get doctor profile
router.get('/profile/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .select('-password')
      .populate('appointments');
      
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Get doctor blockchain verification record
    const blockchainVerification = await blockchain.getBlockByHash(doctor.blockchainVerification);

    res.status(200).json({
      doctor,
      blockchainVerification
    });
  } catch (error) {
    console.error('Error getting doctor profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update doctor availability
router.put('/availability/:id', async (req, res) => {
  try {
    const { availability } = req.body;
    
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    doctor.availability = availability;
    await doctor.save();

    res.status(200).json({
      message: 'Availability updated successfully',
      availability: doctor.availability
    });
  } catch (error) {
    console.error('Error updating doctor availability:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get doctor's appointments
router.get('/appointments/:id', async (req, res) => {
  try {
    const appointments = await Appointment.find({ doctor: req.params.id })
      .populate('patient', 'name email')
      .sort({ date: 1, time: 1 });

    res.status(200).json(appointments);
  } catch (error) {
    console.error('Error getting doctor appointments:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add prescription to appointment
router.post('/prescription/:appointmentId', async (req, res) => {
  try {
    const { prescription } = req.body;
    
    const appointment = await Appointment.findById(req.params.appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    appointment.prescription = prescription;
    appointment.status = 'Completed';
    await appointment.save();

    // Create blockchain record for prescription
    const prescriptionData = {
      appointmentId: appointment._id,
      patientId: appointment.patient,
      doctorId: appointment.doctor,
      date: appointment.date,
      prescription,
      issuedAt: new Date()
    };

    const blockchainRecord = await blockchain.addBlock(
      prescriptionData,
      'Prescription',
      appointment._id,
      `Prescription issued for appointment on ${new Date(appointment.date).toLocaleDateString()}`
    );

    // Update appointment with blockchain record ID
    appointment.blockchainRecordId = blockchainRecord._id;
    await appointment.save();

    res.status(200).json({
      message: 'Prescription added successfully',
      appointment
    });
  } catch (error) {
    console.error('Error adding prescription:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all doctors
router.get('/', async (req, res) => {
  try {
    const doctors = await Doctor.find().select('-password');
    res.status(200).json(doctors);
  } catch (error) {
    console.error('Error getting all doctors:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
