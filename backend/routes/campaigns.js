const express = require('express');
const router = express.Router();
const store = require('../data/store');

router.get('/', (req, res) => {
  try {
    const campaigns = store.getCampaigns();
    res.json({ success: true, data: campaigns });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/', (req, res) => {
  try {
    const { name, templateId, institution, targetAudience, totalRecipients } = req.body;
    if (!name || !templateId) {
      return res.status(400).json({ success: false, message: 'Campaign name and template are required' });
    }

    const campaign = store.createCampaign({
      name,
      templateId,
      institution: institution || 'All Institutions',
      targetAudience: targetAudience || 'Parents & Students',
      totalRecipients: Number(totalRecipients) || 1200
    });

    const io = req.app.get('io');
    if (io) {
      io.emit('campaign_created', campaign);
    }

    res.json({ success: true, message: 'Broadcast campaign initiated successfully', data: campaign });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
