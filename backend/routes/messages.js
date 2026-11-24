const express = require('express');
const router = express.Router();
const store = require('../data/store');

router.get('/', (req, res) => {
  try {
    const { page, limit, status, templateId, institution, search, dateFrom, dateTo } = req.query;
    const result = store.getMessages({ page, limit, status, templateId, institution, search, dateFrom, dateTo });
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/retry/:id', (req, res) => {
  try {
    const { id } = req.params;
    const retried = store.retryMessage(id);
    if (!retried) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }
    
    // Notify via socket if io is attached
    if (req.app.get('io')) {
      req.app.get('io').emit('message_status_updated', retried);
    }

    res.json({ success: true, message: 'Message retried and submitted to channel', data: retried });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/send', (req, res) => {
  try {
    const { recipient, text, templateId, institution, studentName } = req.body;
    if (!recipient || !text) {
      return res.status(400).json({ success: false, message: 'Recipient and text are required' });
    }

    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const newMsg = {
      _id: 'msg_new_' + Date.now(),
      sender: '917015613714',
      recipient,
      acceptTime: now,
      sentTime: now,
      deliveredTime: now,
      readTime: null,
      status: 'Delivered',
      errorDescription: 'Delivered to User',
      contentType: 'TEMPLATE',
      text,
      templateId: templateId || 'stud_notice1',
      templateCategory: 'UTILITY',
      institution: institution || 'Okie Dokie Campus',
      studentName: studentName || 'Student',
      direction: 'outgoing',
      createdAt: new Date().toISOString()
    };

    store.addMessage(newMsg);

    if (req.app.get('io')) {
      req.app.get('io').emit('new_message', newMsg);
      req.app.get('io').to(recipient).emit('chat_message', newMsg);
    }

    res.json({ success: true, data: newMsg });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
