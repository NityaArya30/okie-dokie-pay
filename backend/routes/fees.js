const express = require('express');
const router = express.Router();
const store = require('../data/store');

router.get('/', (req, res) => {
  try {
    const { institution, search, page, limit } = req.query;
    const result = store.getFees({ institution, search, page, limit });
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/remind', (req, res) => {
  try {
    const { recipientPhone, studentName, studentClass, amount, institution } = req.body;
    if (!recipientPhone) {
      return res.status(400).json({ success: false, message: 'Recipient phone is required' });
    }

    const reminderText = `Dear ${studentName || 'Parent'} - (${studentClass || 'Student'}), A quick reminder that the fee of Rs. ${amount || 'Pending'} is due. Kindly make the payment at your earliest. If already paid, please ignore this message. Regards, ${institution || 'Campus Automation'} Powered by Okie Dokie`;

    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const msg = {
      _id: 'remind_' + Date.now(),
      sender: '917015613714',
      recipient: recipientPhone,
      acceptTime: now,
      sentTime: now,
      deliveredTime: now,
      readTime: null,
      status: 'Delivered',
      errorDescription: 'Delivered to User',
      contentType: 'TEMPLATE',
      text: reminderText,
      templateId: 'stud_due_alert2',
      templateCategory: 'UTILITY',
      institution: institution || 'Okie Dokie Campus',
      studentName: studentName || 'Student',
      direction: 'outgoing',
      createdAt: new Date().toISOString()
    };

    store.addMessage(msg);

    const io = req.app.get('io');
    if (io) {
      io.emit('new_message', msg);
    }

    res.json({ success: true, message: 'Fee reminder sent successfully', data: msg });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
