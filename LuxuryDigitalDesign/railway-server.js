#!/usr/bin/env node

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 8080;

console.log('🚀 Starting Railway server...');
console.log('Environment:', process.env.NODE_ENV);
console.log('Port:', port);
console.log('Directory:', __dirname);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Health check first
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    port: port,
    env: process.env.NODE_ENV 
  });
});

// Try multiple static file locations
const staticPaths = [
  path.join(__dirname, 'dist', 'public'),
  path.join(__dirname, 'client', 'dist'),
  path.join(__dirname, 'public'),
  path.join(__dirname, 'build')
];

let staticPath = null;
for (const testPath of staticPaths) {
  if (fs.existsSync(testPath)) {
    staticPath = testPath;
    console.log(`✓ Found static files at: ${staticPath}`);
    break;
  }
}

if (staticPath) {
  app.use(express.static(staticPath));
} else {
  console.log('⚠ No static files found, checking available directories...');
  try {
    const dirs = fs.readdirSync(__dirname);
    console.log('Available directories:', dirs);
  } catch (err) {
    console.log('Error reading directory:', err.message);
  }
}

// Basic API endpoint
app.get('/api/products', (req, res) => {
  res.json([{
    id: 1,
    name: "The EMF Hoodie",
    description: "Advanced EMF protection with silver fiber technology",
    price: 299.99,
    features: ["99.9% EMF Protection", "Silver Fiber Lining", "Premium Cotton"]
  }]);
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', server: 'railway' });
});

// Catch-all handler for SPA routing
app.get('*', (req, res) => {
  if (staticPath) {
    const indexPath = path.join(staticPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
      return;
    }
  }
  
  // Fallback response
  res.status(200).send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>ArmorRF - EMF Protection</title>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
    </head>
    <body>
      <div style="text-align: center; padding: 50px; font-family: Arial, sans-serif;">
        <h1>🛡️ ArmorRF</h1>
        <p>EMF Protection Technology</p>
        <p>Server is running on port ${port}</p>
        <p><a href="/health">Health Check</a> | <a href="/api/products">Products API</a></p>
      </div>
    </body>
    </html>
  `);
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`✅ Railway server running on port ${port}`);
  console.log(`🌐 URL: https://v6jlhzzd.up.railway.app`);
}).on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});