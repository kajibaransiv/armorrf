#!/usr/bin/env node

// Railway deployment server with comprehensive error handling
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8000;

// Extensive logging for debugging
console.log('=== Railway Deployment Server ===');
console.log('Time:', new Date().toISOString());
console.log('Port:', PORT);
console.log('Environment:', process.env.NODE_ENV || 'not set');
console.log('Working Directory:', process.cwd());
console.log('Process ID:', process.pid);

// Log all environment variables for debugging
console.log('Environment Variables:');
Object.keys(process.env).forEach(key => {
  if (key.includes('PORT') || key.includes('NODE') || key.includes('RAILWAY')) {
    console.log(`  ${key}:`, process.env[key]);
  }
});

// Basic middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint - must work
app.get('/health', (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    port: PORT,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV || 'development'
  };
  console.log('Health check response:', health);
  res.json(health);
});

// API endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'api_healthy', server: 'railway' });
});

app.get('/api/products', (req, res) => {
  const products = [
    {
      id: 1,
      name: "The EMF Hoodie",
      description: "Advanced EMF protection hoodie with silver fiber technology",
      price: 299.99,
      image: "/images/emf-hoodie.jpg",
      features: [
        "99.9% EMF Protection",
        "Silver Fiber Lining", 
        "Premium Cotton Blend",
        "Comfortable Fit",
        "Machine Washable"
      ],
      inStock: true
    }
  ];
  console.log('Serving products API');
  res.json(products);
});

// Static file serving with multiple fallbacks
const staticDirectories = [
  path.join(process.cwd(), 'dist', 'public'),
  path.join(process.cwd(), 'client', 'dist'),
  path.join(process.cwd(), 'public'),
  path.join(process.cwd(), 'build'),
  path.join(process.cwd(), 'dist')
];

let staticDir = null;
console.log('Checking for static directories...');

for (const dir of staticDirectories) {
  if (fs.existsSync(dir)) {
    staticDir = dir;
    console.log(`✓ Found static directory: ${staticDir}`);
    
    // List contents for debugging
    try {
      const files = fs.readdirSync(staticDir);
      console.log(`  Contents: ${files.slice(0, 10).join(', ')}${files.length > 10 ? '...' : ''}`);
    } catch (e) {
      console.log('  Could not read directory contents');
    }
    
    app.use(express.static(staticDir, {
      maxAge: '1d',
      etag: false
    }));
    break;
  }
}

if (!staticDir) {
  console.log('⚠ No static directory found');
  console.log('Available directories in current path:');
  try {
    const dirs = fs.readdirSync(process.cwd());
    dirs.forEach(dir => {
      const stats = fs.statSync(path.join(process.cwd(), dir));
      if (stats.isDirectory()) {
        console.log(`  📁 ${dir}/`);
      }
    });
  } catch (e) {
    console.log('  Could not read current directory');
  }
}

// Catch-all route for SPA
app.get('*', (req, res) => {
  console.log(`Catch-all route for: ${req.path}`);
  
  // Try to serve index.html from static directory
  if (staticDir) {
    const indexPath = path.join(staticDir, 'index.html');
    if (fs.existsSync(indexPath)) {
      console.log(`Serving index.html: ${indexPath}`);
      return res.sendFile(indexPath);
    }
  }
  
  // Fallback HTML page
  const fallbackHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ArmorRF - EMF Protection Technology</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white; min-height: 100vh; display: flex; align-items: center; justify-content: center;
    }
    .container { text-align: center; max-width: 600px; padding: 2rem; }
    .logo { font-size: 3rem; margin-bottom: 1rem; }
    h1 { font-size: 2.5rem; margin-bottom: 0.5rem; }
    p { font-size: 1.2rem; margin-bottom: 2rem; opacity: 0.9; }
    .status { 
      background: rgba(255,255,255,0.1); 
      padding: 1.5rem; border-radius: 1rem; margin: 2rem 0;
      backdrop-filter: blur(10px);
    }
    .links { margin-top: 2rem; }
    .links a { 
      display: inline-block; margin: 0.5rem 1rem; padding: 0.75rem 1.5rem;
      background: rgba(255,255,255,0.2); color: white; text-decoration: none;
      border-radius: 0.5rem; transition: all 0.3s ease;
    }
    .links a:hover { background: rgba(255,255,255,0.3); transform: translateY(-2px); }
    .server-info { font-family: monospace; font-size: 0.9rem; opacity: 0.8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">🛡️</div>
    <h1>ArmorRF</h1>
    <p>Advanced EMF Protection Technology</p>
    
    <div class="status">
      <h3>Server Status: Online</h3>
      <div class="server-info">
        <p>Port: ${PORT}</p>
        <p>Time: ${new Date().toISOString()}</p>
        <p>Process: ${process.pid}</p>
      </div>
    </div>
    
    <div class="links">
      <a href="/health">Health Check</a>
      <a href="/api/products">Products API</a>
    </div>
    
    <p style="margin-top: 2rem; font-size: 1rem;">
      Premium EMF-protective hoodies with silver fiber technology
    </p>
  </div>
</body>
</html>`;
  
  res.send(fallbackHtml);
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Application Error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

// Start the server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('=================================');
  console.log(`✅ Railway server running on port ${PORT}`);
  console.log(`🌐 URL: https://v6jlhzzd.up.railway.app`);
  console.log(`📍 Domain: https://armorrf.com`);
  console.log('=================================');
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use`);
  } else {
    console.error('❌ Server error:', error);
  }
  process.exit(1);
});

// Graceful shutdown handling
const gracefulShutdown = (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  server.close(() => {
    console.log('✅ Server closed successfully');
    process.exit(0);
  });
  
  // Force close after 10 seconds
  setTimeout(() => {
    console.log('⚠ Forcing shutdown...');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

console.log('🚀 Server initialization complete');