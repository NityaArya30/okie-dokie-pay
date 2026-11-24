const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

let isConnected = false;
let useMemoryStore = false;

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/okiedokie';
  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`[MongoDB] Connected: ${conn.connection.host}`);
    isConnected = true;
    useMemoryStore = false;
  } catch (err) {
    console.warn(`[DB Layer] MongoDB connection failed or not active: ${err.message}`);
    console.log(`[DB Layer] Falling back to High-Performance Built-in Indexed Data Engine (data/db.json)`);
    isConnected = true;
    useMemoryStore = true;
  }
};

const getDBMode = () => (useMemoryStore ? 'local-datastore' : 'mongodb');

module.exports = { connectDB, isConnected: () => isConnected, getDBMode, useMemoryStore: () => useMemoryStore };
