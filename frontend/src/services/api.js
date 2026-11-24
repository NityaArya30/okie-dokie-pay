const BASE_URL = '/api';

export const api = {
  // Analytics
  getAnalytics: async (institution) => {
    const params = institution && institution !== 'All' ? `?institution=${encodeURIComponent(institution)}` : '';
    const res = await fetch(`${BASE_URL}/analytics${params}`);
    return res.json();
  },

  getInstitutions: async () => {
    const res = await fetch(`${BASE_URL}/analytics/institutions`);
    return res.json();
  },

  // Messages
  getMessages: async (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '' && v !== 'All') {
        query.append(k, v);
      }
    });
    const res = await fetch(`${BASE_URL}/messages?${query.toString()}`);
    return res.json();
  },

  retryMessage: async (id) => {
    const res = await fetch(`${BASE_URL}/messages/retry/${id}`, { method: 'POST' });
    return res.json();
  },

  sendMessage: async (data) => {
    const res = await fetch(`${BASE_URL}/messages/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Conversations (2-Way Chat)
  getConversations: async (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '' && v !== 'All') {
        query.append(k, v);
      }
    });
    const res = await fetch(`${BASE_URL}/conversations?${query.toString()}`);
    return res.json();
  },

  getThread: async (recipient) => {
    const res = await fetch(`${BASE_URL}/conversations/${recipient}`);
    return res.json();
  },

  sendAgentReply: async (recipient, text, agentName = 'Campus Support') => {
    const res = await fetch(`${BASE_URL}/conversations/${recipient}/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, agentName })
    });
    return res.json();
  },

  simulateParentReply: async (recipient, text) => {
    const res = await fetch(`${BASE_URL}/conversations/${recipient}/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    return res.json();
  },

  markConversationRead: async (recipient) => {
    const res = await fetch(`${BASE_URL}/conversations/${recipient}/read`, { method: 'POST' });
    return res.json();
  },

  // Fee Payments
  getFees: async (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '' && v !== 'All') {
        query.append(k, v);
      }
    });
    const res = await fetch(`${BASE_URL}/fees?${query.toString()}`);
    return res.json();
  },

  sendFeeReminder: async (data) => {
    const res = await fetch(`${BASE_URL}/fees/remind`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Gate Passes
  getGatePasses: async (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '' && v !== 'All') {
        query.append(k, v);
      }
    });
    const res = await fetch(`${BASE_URL}/gatepass?${query.toString()}`);
    return res.json();
  },

  // Campaigns
  getCampaigns: async () => {
    const res = await fetch(`${BASE_URL}/campaigns`);
    return res.json();
  },

  createCampaign: async (data) => {
    const res = await fetch(`${BASE_URL}/campaigns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // AI Suggestions
  getAiSuggestions: async (data) => {
    const res = await fetch(`${BASE_URL}/ai/suggest-reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  }
};
