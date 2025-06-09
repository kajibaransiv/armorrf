const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 8000;

console.log('Railway Minimal Server Starting...');
console.log('Port:', port);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PWD:', process.cwd());

// Basic middleware
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  console.log('Health check requested');
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    port: port,
    pid: process.pid
  });
});

// API endpoint
app.get('/api/products', (req, res) => {
  console.log('Products API requested');
  res.json([{
    id: 1,
    name: "The EMF Hoodie",
    description: "Advanced EMF protection hoodie with silver fiber technology",
    price: 299.99,
    image: "/images/emf-hoodie.jpg",
    features: ["99.9% EMF Protection", "Silver Fiber Lining", "Premium Cotton Blend"]
  }]);
});

// Try to serve static files
const possibleStaticDirs = [
  'dist/public',
  'client/dist', 
  'public',
  'build'
];

let staticDir = null;
for (const dir of possibleStaticDirs) {
  const fullPath = path.join(process.cwd(), dir);
  if (fs.existsSync(fullPath)) {
    staticDir = fullPath;
    console.log('Found static directory:', staticDir);
    app.use(express.static(staticDir));
    break;
  }
}

if (!staticDir) {
  console.log('No static directory found. Available files:');
  try {
    console.log(fs.readdirSync(process.cwd()));
  } catch (e) {
    console.log('Cannot read directory');
  }
}

// Fallback for all routes
app.get('*', (req, res) => {
  console.log('Catch-all route hit for:', req.path);
  
  // Try to serve index.html if static directory exists
  if (staticDir) {
    const indexPath = path.join(staticDir, 'index.html');
    if (fs.existsSync(indexPath)) {
      console.log('Serving index.html from:', indexPath);
      return res.sendFile(indexPath);
    }
  }
  
  // Fallback HTML response
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>ArmorRF - EMF Protection</title>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
        .container { max-width: 600px; margin: 0 auto; }
        .status { background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; }
        a { color: #007bff; text-decoration: none; margin: 0 10px; }
        a:hover { text-decoration: underline; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🛡️ ArmorRF</h1>
        <h2>EMF Protection Technology</h2>
        <div class="status">
          <p><strong>Server Status:</strong> Running on port ${port}</p>
          <p><strong>Time:</strong> ${new Date().toISOString()}</p>
        </div>
        <p>
          <a href="/health">Health Check</a>
          <a href="/api/products">Products API</a>
        </p>
        <p>Premium EMF-protective hoodies with advanced silver fiber technology</p>
      </div>
    </body>
    </html>
  `);
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Start server
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`✅ Railway server running on port ${port}`);
  console.log(`🌐 Access at: https://v6jlhzzd.up.railway.app`);
});

server.on('error', (err) => {
  console.error('Server failed to start:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});