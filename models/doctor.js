const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  specialization: {
    type: String,
    required: true
  },
  qualifications: [{
    degree: String,
    institution: String,
    year: Number
  }],
  experience: {
    type: Number,
    required: true
  },
  availability: [{
    day: String,
    startTime: String,
    endTime: String
  }],
  appointments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  }],
  blockchainVerification: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BlockchainRecord'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Doctor', doctorSchema);
