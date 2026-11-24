const mongoose = require('mongoose');

const GatePassSchema = new mongoose.Schema({
  studentName: { type: String, required: true },
  pickupPerson: { type: String, required: true },
  pickupPhone: { type: String, required: true },
  recipientPhone: { type: String },
  institution: { type: String },
  passType: { type: String, default: 'Early Exit' },
  issuedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['Generated', 'Parent_Notified', 'Security_Cleared', 'Cancelled'], default: 'Security_Cleared' },
  wabaStatus: { type: String, default: 'Delivered' }
}, { timestamps: true });

module.exports = mongoose.model('GatePass', GatePassSchema);
