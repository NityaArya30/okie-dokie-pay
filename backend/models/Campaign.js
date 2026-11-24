const mongoose = require('mongoose');

const CampaignSchema = new mongoose.Schema({
  name: { type: String, required: true },
  templateId: { type: String, required: true },
  templateCategory: { type: String, default: 'UTILITY' },
  targetAudience: { type: String, default: 'All Registered Parents' },
  institution: { type: String, default: 'All Institutions' },
  totalRecipients: { type: Number, default: 0 },
  sentCount: { type: Number, default: 0 },
  deliveredCount: { type: Number, default: 0 },
  readCount: { type: Number, default: 0 },
  failedCount: { type: Number, default: 0 },
  status: { type: String, enum: ['Draft', 'In Progress', 'Completed', 'Scheduled'], default: 'Completed' },
  scheduledAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Campaign', CampaignSchema);
