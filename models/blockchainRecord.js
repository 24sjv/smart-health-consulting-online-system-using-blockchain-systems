const mongoose = require('mongoose');

const blockchainRecordSchema = new mongoose.Schema({
  hash: {
    type: String,
    required: true,
    unique: true
  },
  previousHash: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  data: {
    type: Object,
    required: true
  },
  nonce: {
    type: Number,
    required: true
  },
  recordType: {
    type: String,
    enum: ['MedicalRecord', 'Prescription', 'DoctorVerification', 'PatientConsent', 'Appointment'],
    required: true
  },
  relatedEntityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  signature: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('BlockchainRecord', blockchainRecordSchema);
