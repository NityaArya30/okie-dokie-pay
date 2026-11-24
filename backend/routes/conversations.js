const express = require('express');
const router = express.Router();
const store = require('../data/store');

router.get('/', (req, res) => {
  try {
    const { search, institution, status } = req.query;
    const convs = store.getConversations({ search, institution, status });
    res.json({ success: true, count: convs.length, data: convs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/:recipient', (req, res) => {
  try {
    const { recipient } = req.params;
    const thread = store.getThread(recipient);
    store.markConversationRead(recipient);
    res.json({ success: true, ...thread });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/:recipient/reply', (req, res) => {
  try {
    const { recipient } = req.params;
    const { text, agentName } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, message: 'Message text is required' });
    }

    const message = store.addReplyFromAgent(recipient, text, agentName || 'Support Agent');
    
    const io = req.app.get('io');
    if (io) {
      io.emit('new_agent_reply', { recipient, message });
      io.to(recipient).emit('chat_message', message);
    }

    res.json({ success: true, data: message });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/:recipient/simulate', (req, res) => {
  try {
    const { recipient } = req.params;
    const { text } = req.body;

    const message = store.simulateParentReply(recipient, text);

    const io = req.app.get('io');
    if (io) {
      io.emit('parent_incoming_reply', { recipient, message });
      io.to(recipient).emit('chat_message', message);
    }

    res.json({ success: true, message: 'Simulated incoming parent reply', data: message });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/:recipient/read', (req, res) => {
  try {
    const { recipient } = req.params;
    store.markConversationRead(recipient);
    res.json({ success: true, message: 'Marked as read' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
