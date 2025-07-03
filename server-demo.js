const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, '/')));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Demo mode message
app.use((req, res, next) => {
  console.log(`[DEMO MODE] Request to: ${req.method} ${req.url}`);
  next();
});

// Simple demo API endpoints
app.get('/api/blockchain/status', (req, res) => {
  res.json({
    isChainValid: true,
    totalBlocks: 15,
    latestBlocks: [
      {
        hash: 'a1b2c3d4e5f6g7h8i9j0',
        recordType: 'MedicalRecord',
        timestamp: new Date(),
        data: { message: 'Blockchain demo record' }
      }
    ],
    statistics: {
      medicalRecords: 7,
      prescriptions: 3,
      doctorVerifications: 2,
      patientConsents: 2,
      appointments: 1
    }
  });
});

app.post('/api/patients/login', (req, res) => {
  res.json({
    success: true,
    message: 'Login successful (DEMO MODE)',
    token: 'demo-token-patient',
    patient: {
      id: 'patient-123',
      name: 'John Smith',
      email: req.body.email || 'demo@example.com'
    }
  });
});

app.post('/api/doctors/login', (req, res) => {
  res.json({
    success: true,
    message: 'Login successful (DEMO MODE)',
    token: 'demo-token-doctor',
    doctor: {
      id: 'doctor-456',
      name: 'Dr. Emily Chen',
      email: req.body.email || 'doctor@example.com',
      specialization: 'Cardiology'
    }
  });
});

app.post('/api/admin/login', (req, res) => {
  res.json({
    success: true,
    message: 'Admin login successful (DEMO MODE)',
    token: 'demo-token-admin'
  });
});

app.get('/api/blockchain/records', (req, res) => {
  res.json([
    {
      hash: 'a1b2c3d4e5f6g7h8i9j0',
      recordType: 'MedicalRecord',
      timestamp: new Date(),
      data: { 
        name: 'John Smith',
        condition: 'Hypertension',
        medications: ['Lisinopril']
      },
      signature: 'Medical Record Signature'
    },
    {
      hash: 'b2c3d4e5f6g7h8i9j0k1',
      recordType: 'Prescription',
      timestamp: new Date(),
      data: { 
        medication: 'Amoxicillin',
        dosage: '500mg',
        frequency: 'Twice daily'
      },
      signature: 'Prescription Signature'
    },
    {
      hash: 'c3d4e5f6g7h8i9j0k1l2',
      recordType: 'DoctorVerification',
      timestamp: new Date(),
      data: { 
        name: 'Dr. Emily Chen',
        specialization: 'Cardiology',
        qualifications: 'MD, Harvard Medical School'
      },
      signature: 'Doctor Verification Signature'
    }
  ]);
});

// Serve HTML files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/index.html'));
});

app.get('/login-choice', (req, res) => {
  res.sendFile(path.join(__dirname, '/login-choice.html'));
});

app.get('/register-choice', (req, res) => {
  res.sendFile(path.join(__dirname, '/register-choice.html'));
});

app.get('/patient-login', (req, res) => {
  res.sendFile(path.join(__dirname, '/patient-login.html'));
});

app.get('/doctor-login', (req, res) => {
  res.sendFile(path.join(__dirname, '/doctor-login.html'));
});

app.get('/admin-login', (req, res) => {
  res.sendFile(path.join(__dirname, '/admin-login.html'));
});

app.get('/patient-register', (req, res) => {
  res.sendFile(path.join(__dirname, '/patient-register.html'));
});

app.get('/doctor-register', (req, res) => {
  res.sendFile(path.join(__dirname, '/doctor-register.html'));
});

app.get('/patient-dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '/patient-dashboard.html'));
});

app.get('/doctor-dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '/doctor-dashboard.html'));
});

app.get('/admin-controls', (req, res) => {
  res.sendFile(path.join(__dirname, '/admin-controls.html'));
});

app.get('/admin-view-patients', (req, res) => {
  res.sendFile(path.join(__dirname, '/admin-view-patients.html'));
});

app.get('/admin-view-doctors', (req, res) => {
  res.sendFile(path.join(__dirname, '/admin-view-doctors.html'));
});

app.get('/admin-view-appointments', (req, res) => {
  res.sendFile(path.join(__dirname, '/admin-view-appointments.html'));
});

app.get('/appointment-confirmation', (req, res) => {
  res.sendFile(path.join(__dirname, '/appointment-confirmation.html'));
});

// Handle 404
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, '/index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`
🚀 DEMO MODE: Server running on port ${PORT}
📱 Open http://localhost:${PORT} in your browser

Demo Credentials:
- Patient: Email can be anything, password can be anything
- Doctor: Email can be anything, password can be anything
- Admin: Email can be anything, password can be anything

NOTE: This is running in DEMO MODE without a MongoDB connection.
      The blockchain features will be simulated with mock data.
  `);
});
