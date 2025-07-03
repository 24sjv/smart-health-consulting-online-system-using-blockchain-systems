const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Scheduled', 'Completed', 'Cancelled', 'Rescheduled'],
    default: 'Scheduled'
  },
  notes: {
    type: String
  },
  prescription: [{
    medication: String,
    dosage: String,
    frequency: String,
    duration: String
  }],
  blockchainRecordId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BlockchainRecord'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Appointment', appointmentSchema);
