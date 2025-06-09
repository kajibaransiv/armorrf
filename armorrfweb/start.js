#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set production environment
process.env.NODE_ENV = 'production';

// Start the server
const serverPath = path.join(__dirname, 'dist', 'index.js');
const server = spawn('node', [serverPath], {
  stdio: 'inherit',
  env: { ...process.env }
});

server.on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

server.on('exit', (code) => {
  console.log(`Server exited with code ${code}`);
  process.exit(code);
});

// Handle process termination
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully');
  server.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully');
  server.kill('SIGINT');
});
