const mongoose = require('mongoose');

const FeeTransactionSchema = new mongoose.Schema({
  receiptNo: { type: String, required: true, index: true },
  studentId: { type: String, index: true },
  studentName: { type: String, required: true },
  recipientPhone: { type: String },
  amount: { type: Number, required: true },
  institution: { type: String, index: true },
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ['Paid', 'Pending', 'Overdue', 'Reminded'], default: 'Paid' },
  paymentMode: { type: String, default: 'Online Portal' },
  receiptUrl: { type: String, default: 'https://ergir.app.link/student' },
  convId: { type: String },
  wabaStatus: { type: String, default: 'Read' }
}, { timestamps: true });

FeeTransactionSchema.index({ institution: 1, date: -1 });

module.exports = mongoose.model('FeeTransaction', FeeTransactionSchema);
