// Database initialization script with sample data
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Patient = require('../models/patient');
const Doctor = require('../models/doctor');
const Appointment = require('../models/appointment');
const BlockchainRecord = require('../models/blockchainRecord');
const Blockchain = require('../blockchain/Blockchain');

const connectDB = require('./db');

// Initialize blockchain
const blockchain = new Blockchain();

// Sample data
const samplePatients = [
  {
    name: 'John Smith',
    email: 'john@example.com',
    password: 'password123',
    age: 35,
    gender: 'Male',
    medicalHistory: [
      {
        condition: 'Hypertension',
        diagnosedDate: new Date('2022-04-15'),
        medications: ['Lisinopril', 'Hydrochlorothiazide'],
        notes: 'Blood pressure well controlled with current medications'
      }
    ]
  },
  {
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    password: 'password123',
    age: 28,
    gender: 'Female',
    medicalHistory: [
      {
        condition: 'Asthma',
        diagnosedDate: new Date('2020-07-22'),
        medications: ['Albuterol', 'Fluticasone'],
        notes: 'Mild asthma, well controlled with inhalers'
      }
    ]
  }
];

const sampleDoctors = [
  {
    name: 'Dr. Emily Chen',
    email: 'dr.chen@example.com',
    password: 'password123',
    specialization: 'Cardiology',
    qualifications: [
      {
        degree: 'MD',
        institution: 'Harvard Medical School',
        year: 2010
      }
    ],
    experience: 12,
    availability: [
      { day: 'Monday', startTime: '09:00', endTime: '17:00' },
      { day: 'Wednesday', startTime: '09:00', endTime: '17:00' },
      { day: 'Friday', startTime: '09:00', endTime: '13:00' }
    ]
  },
  {
    name: 'Dr. Michael Johnson',
    email: 'dr.johnson@example.com',
    password: 'password123',
    specialization: 'Pulmonology',
    qualifications: [
      {
        degree: 'MD',
        institution: 'Johns Hopkins University',
        year: 2008
      }
    ],
    experience: 14,
    availability: [
      { day: 'Tuesday', startTime: '09:00', endTime: '17:00' },
      { day: 'Thursday', startTime: '09:00', endTime: '17:00' },
      { day: 'Saturday', startTime: '10:00', endTime: '14:00' }
    ]
  }
];

// Initialize database with sample data
const initDB = async () => {
  try {
    // Connect to database
    await connectDB();
    console.log('Connected to MongoDB for initialization');

    // Check if data already exists
    const existingPatients = await Patient.countDocuments();
    const existingDoctors = await Doctor.countDocuments();

    if (existingPatients > 0 || existingDoctors > 0) {
      console.log('Database already has data. Skipping initialization.');
      process.exit(0);
    }

    // Initialize blockchain
    await blockchain.initializeChain();
    console.log('Initialized blockchain');

    // Create patients
    const createdPatients = [];
    for (const patientData of samplePatients) {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(patientData.password, salt);
      
      // Create patient
      const patient = new Patient({
        ...patientData,
        password: hashedPassword
      });

      await patient.save();
      console.log(`Created patient: ${patient.name}`);
      
      // Add patient to blockchain
      const blockchainData = {
        id: patient._id,
        name: patient.name,
        email: patient.email,
        registeredAt: new Date()
      };

      await blockchain.addBlock(
        blockchainData,
        'PatientConsent',
        patient._id,
        `Patient ${patient.name} registered`
      );
      
      createdPatients.push(patient);
    }

    // Create doctors
    const createdDoctors = [];
    for (const doctorData of sampleDoctors) {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(doctorData.password, salt);
      
      // Create doctor
      const doctor = new Doctor({
        ...doctorData,
        password: hashedPassword
      });

      await doctor.save();
      console.log(`Created doctor: ${doctor.name}`);
      
      // Add doctor to blockchain
      const blockchainData = {
        id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        specialization: doctor.specialization,
        registeredAt: new Date()
      };

      const blockchainRecord = await blockchain.addBlock(
        blockchainData,
        'DoctorVerification',
        doctor._id,
        `Doctor ${doctor.name} registered and credentials verified`
      );
      
      // Update doctor with blockchain verification
      doctor.blockchainVerification = blockchainRecord._id;
      await doctor.save();
      
      createdDoctors.push(doctor);
    }

    // Create some appointments
    const appointmentsData = [
      {
        patient: createdPatients[0]._id,
        doctor: createdDoctors[0]._id,
        date: new Date('2025-03-15'),
        time: '10:30',
        reason: 'Annual checkup and blood pressure monitoring',
        status: 'Scheduled'
      },
      {
        patient: createdPatients[1]._id,
        doctor: createdDoctors[1]._id,
        date: new Date('2025-03-10'),
        time: '14:00',
        reason: 'Asthma follow-up',
        status: 'Scheduled'
      }
    ];

    for (const appointmentData of appointmentsData) {
      const appointment = new Appointment(appointmentData);
      await appointment.save();
      console.log(`Created appointment: ${appointment._id}`);
      
      // Add appointment to blockchain
      const blockchainData = {
        appointmentId: appointment._id,
        patientId: appointment.patient,
        doctorId: appointment.doctor,
        date: appointment.date,
        reason: appointment.reason,
        createdAt: new Date()
      };

      const blockchainRecord = await blockchain.addBlock(
        blockchainData,
        'Appointment',
        appointment._id,
        `Appointment scheduled for ${new Date(appointment.date).toLocaleDateString()}`
      );
      
      // Update appointment with blockchain record ID
      appointment.blockchainRecordId = blockchainRecord._id;
      await appointment.save();
      
      // Update patient and doctor with appointment reference
      await Patient.updateOne(
        { _id: appointment.patient },
        { $push: { appointments: appointment._id } }
      );
      
      await Doctor.updateOne(
        { _id: appointment.doctor },
        { $push: { appointments: appointment._id } }
      );
    }

    console.log('Database initialized with sample data');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
};

// Run the initialization
initDB();
