const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  sender: { type: String, default: '917015613714' },
  recipient: { type: String, required: true, index: true },
  acceptTime: { type: Date },
  sentTime: { type: Date, index: true },
  deliveredTime: { type: Date },
  readTime: { type: Date },
  status: { 
    type: String, 
    enum: ['Read', 'Delivered', 'Sent', 'Not Sent', 'Dropped', 'Queued'],
    default: 'Sent',
    index: true 
  },
  errorDescription: { type: String },
  channelErrorDescription: { type: String },
  contentType: { type: String, default: 'TEMPLATE' },
  text: { type: String, required: true },
  attachmentType: { type: String },
  attachmentLink: { type: String },
  templateId: { type: String, index: true },
  templateCategory: { type: String, default: 'UTILITY' },
  convId: { type: String },
  conversationCategory: { type: String, default: 'utility' },
  campaignId: { type: String },
  mid: { type: String },
  wabaPricingCategory: { type: String, default: 'utility' },
  
  // Extracted metadata
  institution: { type: String, index: true },
  studentName: { type: String },
  studentId: { type: String },
  receiptNo: { type: String },
  amount: { type: Number },
  pickupPerson: { type: String },
  pickupPhone: { type: String },
  absentDate: { type: String },
  studentClass: { type: String },
  
  // 2-Way communication fields
  direction: { type: String, enum: ['outgoing', 'incoming'], default: 'outgoing', index: true },
  senderName: { type: String },
  isQuickReply: { type: Boolean, default: false }
}, { timestamps: true });

MessageSchema.index({ sentTime: -1, institution: 1 });
MessageSchema.index({ recipient: 1, createdAt: 1 });

module.exports = mongoose.model('Message', MessageSchema);
