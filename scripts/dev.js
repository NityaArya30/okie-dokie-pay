const { spawn } = require('child_process');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

console.log('================================================================');
console.log('🚀 Starting Okie Dokie Pay - Full Stack Development Environment');
console.log('================================================================');

// 1. Start Backend on port 5050
const backend = spawn('node', ['server.js'], {
  cwd: path.join(rootDir, 'backend'),
  stdio: 'inherit',
  env: { ...process.env, PORT: '5050' }
});

// 2. Start Frontend on port 5173
const frontend = spawn('npx', ['vite', '--host'], {
  cwd: path.join(rootDir, 'frontend'),
  stdio: 'inherit',
  env: process.env
});

const cleanup = () => {
  console.log('\nShutting down Okie Dokie development processes...');
  backend.kill();
  frontend.kill();
  process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
