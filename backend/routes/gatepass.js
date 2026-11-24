const express = require('express');
const router = express.Router();
const store = require('../data/store');

router.get('/', (req, res) => {
  try {
    const { institution, search, limit } = req.query;
    const passes = store.getGatePasses({ institution, search, limit });
    res.json({ success: true, count: passes.length, data: passes });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
