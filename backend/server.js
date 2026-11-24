const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const { connectDB, getDBMode } = require('./config/db');
const store = require('./data/store');

const app = express();
const server = http.createServer(app);

// Initialize Socket.io with CORS
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// App configuration
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Attach io to app so routes can broadcast events
app.set('io', io);

// Initialize Data Store & Database
connectDB();
store.init();

// Socket.io Real-Time connection management
io.on('connection', (socket) => {
  console.log(`[Socket.io] Client connected: ${socket.id}`);

  socket.on('join_chat', (recipient) => {
    socket.join(recipient);
    console.log(`[Socket.io] Client ${socket.id} joined chat room: ${recipient}`);
  });

  socket.on('leave_chat', (recipient) => {
    socket.leave(recipient);
  });

  socket.on('agent_typing', ({ recipient, isTyping }) => {
    socket.to(recipient).emit('agent_typing', { isTyping });
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.io] Client disconnected: ${socket.id}`);
  });
});

// API Routes
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/conversations', require('./routes/conversations'));
app.use('/api/fees', require('./routes/fees'));
app.use('/api/gatepass', require('./routes/gatepass'));
app.use('/api/campaigns', require('./routes/campaigns'));
app.use('/api/ai', require('./routes/ai'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Okie Dokie Pay WABA & Campus Automation Gateway',
    timestamp: new Date().toISOString(),
    dbMode: getDBMode(),
    totalMessages: store.messages.length,
    activeConversations: store.conversations.size,
    institutions: store.getInstitutions().length
  });
});

// Serve frontend in production if built
const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(frontendDist));
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  const indexHtml = path.join(frontendDist, 'index.html');
  const fs = require('fs');
  if (fs.existsSync(indexHtml)) {
    return res.sendFile(indexHtml);
  }
  next();
});

const PORT = process.env.PORT || 5050;
server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Okie Dokie Pay Backend running on port ${PORT}`);
  console.log(`📡 WebSocket Gateway ready on ws://localhost:${PORT}`);
  console.log(`🗄️  Database Engine: ${getDBMode()}`);
  console.log(`📊 Loaded: ${store.messages.length} messages, ${store.conversations.size} conversations`);
  console.log(`====================================================`);
});
