const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'db.json');

class Store {
  constructor() {
    this.messages = [];
    this.conversations = new Map();
    this.fees = [];
    this.gatePasses = [];
    this.campaigns = [];
    this.institutions = new Set();
    this.loaded = false;
  }

  init() {
    if (this.loaded) return;
    if (fs.existsSync(DB_FILE)) {
      try {
        console.log('[Store] Loading data from db.json...');
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        const data = JSON.parse(raw);
        this.messages = data.messages || [];
        this.fees = data.fees || [];
        this.gatePasses = data.gatePasses || [];
        this.campaigns = data.campaigns || [];
        
        if (data.conversations && Array.isArray(data.conversations)) {
          data.conversations.forEach(c => this.conversations.set(c.recipient, c));
        }

        this.institutions = new Set(data.institutions || []);
        if (this.institutions.size === 0) {
          this.messages.forEach(m => {
            if (m.institution) this.institutions.add(m.institution);
          });
        }
        this.loaded = true;
        console.log(`[Store] Loaded: ${this.messages.length} messages, ${this.conversations.size} conversations, ${this.fees.length} fee records, ${this.gatePasses.length} gate passes, ${this.institutions.size} institutions.`);
      } catch (err) {
        console.error('[Store] Error loading db.json:', err.message);
      }
    } else {
      console.log('[Store] No db.json found yet. Please run seeding script.');
    }
  }

  save() {
    try {
      const payload = {
        messages: this.messages,
        conversations: Array.from(this.conversations.values()),
        fees: this.fees,
        gatePasses: this.gatePasses,
        campaigns: this.campaigns,
        institutions: Array.from(this.institutions)
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(payload, null, 2), 'utf8');
    } catch (err) {
      console.error('[Store] Error saving db.json:', err.message);
    }
  }

  getAnalytics(institution = 'All') {
    let target = this.messages;
    if (institution && institution !== 'All') {
      target = target.filter(m => m.institution === institution);
    }

    const total = target.length;
    let readCount = 0;
    let deliveredCount = 0;
    let sentCount = 0;
    let failedCount = 0;
    let droppedCount = 0;
    let queuedCount = 0;

    const templates = {};
    const dailyMap = {};
    const errorMap = {};
    const hourlyMap = {};

    for (let i = 0; i < 24; i++) {
      hourlyMap[`${i.toString().padStart(2, '0')}:00`] = 0;
    }

    target.forEach(m => {
      const st = m.status;
      if (st === 'Read') readCount++;
      else if (st === 'Delivered') deliveredCount++;
      else if (st === 'Sent') sentCount++;
      else if (st === 'Not Sent' || st === 'Failed') failedCount++;
      else if (st === 'Dropped') droppedCount++;
      else if (st === 'Queued') queuedCount++;

      const tid = m.templateId || 'other';
      templates[tid] = (templates[tid] || 0) + 1;

      const dateStr = (m.sentTime || m.acceptTime || '').substring(0, 10);
      if (dateStr) {
        if (!dailyMap[dateStr]) {
          dailyMap[dateStr] = { date: dateStr, sent: 0, delivered: 0, read: 0, failed: 0 };
        }
        dailyMap[dateStr].sent++;
        if (st === 'Read') dailyMap[dateStr].read++;
        if (st === 'Delivered' || st === 'Read') dailyMap[dateStr].delivered++;
        if (st === 'Not Sent' || st === 'Dropped' || st === 'Failed') dailyMap[dateStr].failed++;
      }

      const timeStr = m.sentTime || m.acceptTime || '';
      if (timeStr.length >= 13) {
        const hour = timeStr.substring(11, 13) + ':00';
        if (hourlyMap[hour] !== undefined) hourlyMap[hour]++;
      }

      if (m.errorDescription && st !== 'Read' && st !== 'Delivered' && st !== 'Sent') {
        errorMap[m.errorDescription] = (errorMap[m.errorDescription] || 0) + 1;
      }
    });

    const dailyTrends = Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));

    // Fee collections calculation
    let feeTarget = this.fees;
    if (institution && institution !== 'All') {
      feeTarget = feeTarget.filter(f => f.institution === institution);
    }
    const totalFeeAmount = feeTarget.reduce((acc, curr) => acc + (curr.amount || 0), 0);
    const totalReceipts = feeTarget.length;

    // Delivery rate & Read rate
    const deliveredTotal = deliveredCount + readCount;
    const deliveryRate = total > 0 ? ((deliveredTotal / total) * 100).toFixed(1) : 0;
    const readRate = deliveredTotal > 0 ? ((readCount / deliveredTotal) * 100).toFixed(1) : 0;
    const failureRate = total > 0 ? (((failedCount + droppedCount) / total) * 100).toFixed(1) : 0;

    // Estimated WABA Cost (Average utility conversation rate in India ~ ₹0.12 - ₹0.15)
    const estimatedCost = (total * 0.125).toFixed(2);

    return {
      totalMessages: total,
      readCount,
      deliveredCount,
      sentCount,
      failedCount,
      droppedCount,
      queuedCount,
      deliveryRate: Number(deliveryRate),
      readRate: Number(readRate),
      failureRate: Number(failureRate),
      totalFeeAmount,
      totalReceipts,
      estimatedCost: Number(estimatedCost),
      activeInstitutions: this.institutions.size,
      activeConversations: this.conversations.size,
      templates,
      dailyTrends,
      hourlyTraffic: Object.entries(hourlyMap).map(([hour, count]) => ({ hour, count })),
      errorDistribution: Object.entries(errorMap).map(([reason, count]) => ({ reason, count }))
    };
  }

  getMessages({ page = 1, limit = 50, status, templateId, institution, search, dateFrom, dateTo }) {
    let result = this.messages;

    if (institution && institution !== 'All') {
      result = result.filter(m => m.institution === institution);
    }
    if (status && status !== 'All') {
      result = result.filter(m => m.status === status);
    }
    if (templateId && templateId !== 'All') {
      result = result.filter(m => m.templateId === templateId);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(m => 
        (m.recipient && m.recipient.includes(q)) ||
        (m.text && m.text.toLowerCase().includes(q)) ||
        (m.studentName && m.studentName.toLowerCase().includes(q)) ||
        (m.receiptNo && m.receiptNo.includes(q)) ||
        (m.mid && m.mid.includes(q))
      );
    }
    if (dateFrom) {
      result = result.filter(m => (m.sentTime || m.acceptTime) >= dateFrom);
    }
    if (dateTo) {
      result = result.filter(m => (m.sentTime || m.acceptTime) <= dateTo + ' 23:59:59');
    }

    const total = result.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + Number(limit);
    const paginated = result.slice(startIndex, endIndex);

    return {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
      messages: paginated
    };
  }

  getConversations({ search, institution, status }) {
    let convs = Array.from(this.conversations.values());

    if (institution && institution !== 'All') {
      convs = convs.filter(c => c.institution === institution);
    }
    if (status && status !== 'All') {
      convs = convs.filter(c => c.status === status);
    }
    if (search) {
      const q = search.toLowerCase();
      convs = convs.filter(c => 
        (c.recipient && c.recipient.includes(q)) ||
        (c.studentName && c.studentName.toLowerCase().includes(q)) ||
        (c.lastMessage && c.lastMessage.toLowerCase().includes(q))
      );
    }

    // Sort by recent activity
    convs.sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));
    return convs;
  }

  getThread(recipient) {
    const thread = this.messages.filter(m => m.recipient === recipient || m.sender === recipient);
    thread.sort((a, b) => new Date(a.sentTime || a.acceptTime || a.createdAt) - new Date(b.sentTime || b.acceptTime || b.createdAt));
    const conversation = this.conversations.get(recipient) || {
      recipient,
      studentName: 'Student Parent',
      institution: 'Okie Dokie Campus'
    };
    return { conversation, messages: thread };
  }

  addMessage(msg) {
    this.messages.unshift(msg);
    // Update or create conversation
    const rec = msg.recipient;
    let conv = this.conversations.get(rec);
    if (!conv) {
      conv = {
        recipient: rec,
        studentName: msg.studentName || 'Student / Parent',
        studentId: msg.studentId || '',
        studentClass: msg.studentClass || '',
        institution: msg.institution || 'Okie Dokie Campus',
        lastMessage: msg.text,
        lastMessageTime: msg.sentTime || new Date().toISOString(),
        lastDirection: msg.direction || 'outgoing',
        unreadCount: msg.direction === 'incoming' ? 1 : 0,
        status: 'active',
        totalMessages: 1
      };
      this.conversations.set(rec, conv);
    } else {
      conv.lastMessage = msg.text;
      conv.lastMessageTime = msg.sentTime || new Date().toISOString();
      conv.lastDirection = msg.direction || 'outgoing';
      conv.totalMessages = (conv.totalMessages || 1) + 1;
      if (msg.direction === 'incoming') {
        conv.unreadCount = (conv.unreadCount || 0) + 1;
      }
      if (msg.studentName && conv.studentName === 'Student / Parent') {
        conv.studentName = msg.studentName;
      }
    }

    if (msg.institution) {
      this.institutions.add(msg.institution);
    }
    return msg;
  }

  markConversationRead(recipient) {
    const conv = this.conversations.get(recipient);
    if (conv) {
      conv.unreadCount = 0;
    }
  }

  addReplyFromAgent(recipient, text, agentName = 'Support Admin') {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const conv = this.conversations.get(recipient) || {};
    
    const newMsg = {
      _id: 'reply_' + Date.now(),
      sender: '917015613714',
      recipient,
      acceptTime: now,
      sentTime: now,
      deliveredTime: now,
      readTime: now,
      status: 'Read',
      errorDescription: 'Read by the user',
      contentType: 'TEXT',
      text,
      templateId: 'agent_reply',
      direction: 'outgoing',
      senderName: agentName,
      institution: conv.institution || 'Okie Dokie Campus',
      studentName: conv.studentName || 'Parent',
      createdAt: new Date().toISOString()
    };

    this.addMessage(newMsg);
    if (conv) conv.unreadCount = 0;
    return newMsg;
  }

  simulateParentReply(recipient, customText) {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const conv = this.conversations.get(recipient) || {
      recipient,
      studentName: 'Parent',
      institution: 'Okie Dokie Campus'
    };

    const realisticReplies = [
      "Thank you for the update! I have paid the pending fee via UPI ref #UPI837482. Please confirm.",
      "Sir, my child was sick yesterday with high fever. Doctor's prescription is attached. Kindly update attendance.",
      "Can you please resend the fee receipt link? It says expired on my phone.",
      "Noted. Gurnoor will attend extra classes this Saturday. Thanks for informing.",
      "I have authorized Mr. Gurpej Singh for today's pickup pass. Thank you.",
      "Dear Admin, what is the syllabus for the upcoming half-yearly exams mentioned in notice?"
    ];

    const replyText = customText || realisticReplies[Math.floor(Math.random() * realisticReplies.length)];

    const newMsg = {
      _id: 'in_' + Date.now(),
      sender: recipient,
      recipient: '917015613714',
      acceptTime: now,
      sentTime: now,
      deliveredTime: now,
      readTime: now,
      status: 'Read',
      errorDescription: 'Received from Client/Parent',
      contentType: 'TEXT',
      text: replyText,
      templateId: 'parent_reply',
      direction: 'incoming',
      senderName: conv.studentName ? `Parent of ${conv.studentName}` : 'Parent',
      institution: conv.institution || 'Okie Dokie Campus',
      studentName: conv.studentName || 'Parent',
      createdAt: new Date().toISOString()
    };

    this.addMessage(newMsg);
    return newMsg;
  }

  retryMessage(messageId) {
    const msg = this.messages.find(m => m._id === messageId || m.mid === messageId);
    if (msg) {
      msg.status = 'Sent';
      msg.errorDescription = 'Submitted to channel (Retried)';
      msg.sentTime = new Date().toISOString().replace('T', ' ').substring(0, 19);
      return msg;
    }
    return null;
  }

  getFees({ institution, search, page = 1, limit = 50 }) {
    let list = this.fees;
    if (institution && institution !== 'All') {
      list = list.filter(f => f.institution === institution);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(f => 
        (f.studentName && f.studentName.toLowerCase().includes(q)) ||
        (f.receiptNo && f.receiptNo.includes(q)) ||
        (f.studentId && f.studentId.includes(q)) ||
        (f.recipientPhone && f.recipientPhone.includes(q))
      );
    }
    const total = list.length;
    const startIndex = (page - 1) * limit;
    const paginated = list.slice(startIndex, startIndex + Number(limit));

    const totalCollected = list.reduce((s, c) => s + (c.amount || 0), 0);

    return {
      total,
      totalCollected,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
      fees: paginated
    };
  }

  getGatePasses({ institution, search, limit = 50 }) {
    let list = this.gatePasses;
    if (institution && institution !== 'All') {
      list = list.filter(g => g.institution === institution);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(g => 
        (g.studentName && g.studentName.toLowerCase().includes(q)) ||
        (g.pickupPerson && g.pickupPerson.toLowerCase().includes(q)) ||
        (g.pickupPhone && g.pickupPhone.includes(q))
      );
    }
    return list.slice(0, Number(limit));
  }

  getInstitutions() {
    return Array.from(this.institutions);
  }

  getCampaigns() {
    return this.campaigns;
  }

  createCampaign(campaign) {
    const newCamp = {
      _id: 'camp_' + Date.now(),
      name: campaign.name,
      templateId: campaign.templateId,
      institution: campaign.institution || 'All Institutions',
      targetAudience: campaign.targetAudience || 'Parents & Students',
      totalRecipients: campaign.totalRecipients || 1500,
      sentCount: campaign.totalRecipients || 1500,
      deliveredCount: Math.round((campaign.totalRecipients || 1500) * 0.92),
      readCount: Math.round((campaign.totalRecipients || 1500) * 0.81),
      failedCount: Math.round((campaign.totalRecipients || 1500) * 0.08),
      status: 'Completed',
      createdAt: new Date().toISOString()
    };
    this.campaigns.unshift(newCamp);
    this.save();
    return newCamp;
  }
}

const store = new Store();
module.exports = store;
