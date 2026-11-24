const express = require('express');
const router = express.Router();
const store = require('../data/store');

router.get('/', (req, res) => {
  try {
    const { institution } = req.query;
    const analytics = store.getAnalytics(institution);
    res.json({ success: true, data: analytics });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/institutions', (req, res) => {
  try {
    const institutions = store.getInstitutions();
    res.json({ success: true, data: institutions });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
