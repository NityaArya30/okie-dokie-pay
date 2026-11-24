const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
  recipient: { type: String, required: true, unique: true, index: true },
  studentName: { type: String, default: 'Student / Parent' },
  studentId: { type: String },
  studentClass: { type: String },
  institution: { type: String, default: 'General Campus' },
  lastMessage: { type: String },
  lastMessageTime: { type: Date, default: Date.now, index: true },
  lastDirection: { type: String, enum: ['outgoing', 'incoming'], default: 'outgoing' },
  unreadCount: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'resolved', 'pending_reply'], default: 'active' },
  totalMessages: { type: Number, default: 1 },
  tags: [{ type: String }],
  notes: { type: String }
}, { timestamps: true });

ConversationSchema.index({ lastMessageTime: -1 });

module.exports = mongoose.model('Conversation', ConversationSchema);
