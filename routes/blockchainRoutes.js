const express = require('express');
const router = express.Router();
const Blockchain = require('../blockchain/Blockchain');
const blockchain = new Blockchain();
const BlockchainRecord = require('../models/blockchainRecord');

// Get all blockchain records
router.get('/records', async (req, res) => {
  try {
    const records = await BlockchainRecord.find().sort({ timestamp: -1 });
    res.status(200).json(records);
  } catch (error) {
    console.error('Error getting blockchain records:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get blockchain record by hash
router.get('/record/:hash', async (req, res) => {
  try {
    const record = await blockchain.getBlockByHash(req.params.hash);
    if (!record) {
      return res.status(404).json({ message: 'Blockchain record not found' });
    }
    res.status(200).json(record);
  } catch (error) {
    console.error('Error getting blockchain record:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get blockchain records by type
router.get('/records/type/:type', async (req, res) => {
  try {
    const records = await blockchain.getBlocksByType(req.params.type);
    res.status(200).json(records);
  } catch (error) {
    console.error('Error getting blockchain records by type:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get blockchain records for a specific entity (patient, doctor, appointment)
router.get('/records/entity/:entityId', async (req, res) => {
  try {
    const records = await blockchain.getBlocksByEntity(req.params.entityId);
    res.status(200).json(records);
  } catch (error) {
    console.error('Error getting blockchain records for entity:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Verify data integrity using blockchain
router.post('/verify', async (req, res) => {
  try {
    const { hash, data } = req.body;
    
    // Get the record from blockchain
    const record = await blockchain.getBlockByHash(hash);
    if (!record) {
      return res.status(404).json({ message: 'Blockchain record not found' });
    }
    
    // Check if stored data matches provided data
    const storedData = JSON.stringify(record.data);
    const providedData = JSON.stringify(data);
    const isDataValid = storedData === providedData;
    
    // Initialize blockchain to verify chain integrity
    await blockchain.initializeChain();
    const isChainValid = blockchain.isChainValid();
    
    res.status(200).json({
      isRecordValid: !!record,
      isDataValid,
      isChainValid,
      record
    });
  } catch (error) {
    console.error('Error verifying blockchain data:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add medical record to blockchain
router.post('/medical-record', async (req, res) => {
  try {
    const { patientId, recordData, signature } = req.body;
    
    const blockchainRecord = await blockchain.addBlock(
      recordData,
      'MedicalRecord',
      patientId,
      signature || 'Medical record added'
    );
    
    res.status(201).json({
      message: 'Medical record added to blockchain',
      blockchainRecord
    });
  } catch (error) {
    console.error('Error adding medical record to blockchain:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get blockchain status
router.get('/status', async (req, res) => {
  try {
    await blockchain.initializeChain();
    
    const isValid = blockchain.isChainValid();
    const totalBlocks = await BlockchainRecord.countDocuments();
    const latestBlocks = await BlockchainRecord.find().sort({ timestamp: -1 }).limit(5);
    
    // Get counts by record type
    const medicalRecords = await BlockchainRecord.countDocuments({ recordType: 'MedicalRecord' });
    const prescriptions = await BlockchainRecord.countDocuments({ recordType: 'Prescription' });
    const doctorVerifications = await BlockchainRecord.countDocuments({ recordType: 'DoctorVerification' });
    const patientConsents = await BlockchainRecord.countDocuments({ recordType: 'PatientConsent' });
    const appointments = await BlockchainRecord.countDocuments({ recordType: 'Appointment' });
    
    res.status(200).json({
      isChainValid: isValid,
      totalBlocks,
      latestBlocks,
      statistics: {
        medicalRecords,
        prescriptions,
        doctorVerifications,
        patientConsents,
        appointments
      }
    });
  } catch (error) {
    console.error('Error getting blockchain status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
