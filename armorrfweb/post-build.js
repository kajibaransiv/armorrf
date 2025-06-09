#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure proper structure for Railway deployment
const publicDir = path.join(__dirname, 'dist', 'public');
const serverFile = path.join(__dirname, 'dist', 'index.js');

if (fs.existsSync(publicDir) && fs.existsSync(serverFile)) {
  console.log('✓ Deployment structure ready');
  console.log('✓ Static files available in dist/public/');
  console.log('✓ Server bundle available at dist/index.js');
  
  // Verify index.html exists
  const indexHtml = path.join(publicDir, 'index.html');
  if (fs.existsSync(indexHtml)) {
    console.log('✓ index.html found in dist/public/');
  } else {
    console.log('⚠ Warning: index.html not found in dist/public/');
  }
} else {
  if (!fs.existsSync(publicDir)) {
    console.log('❌ Error: dist/public directory not found');
  }
  if (!fs.existsSync(serverFile)) {
    console.log('❌ Error: dist/index.js not found');
  }
  process.exit(1);
}
