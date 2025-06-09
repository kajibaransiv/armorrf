#!/usr/bin/env node

// Simple start script for Railway deployment
const port = process.env.PORT || 8080;

console.log(`Starting server on port ${port}...`);

// Import and run the server
import('./dist/index.js').catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});