#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Copy files from dist/public to dist for deployment
const sourceDir = path.join(__dirname, 'dist', 'public');
const targetDir = path.join(__dirname, 'dist');

if (fs.existsSync(sourceDir)) {
  console.log('Preparing deployment structure...');
  
  // Copy all files from dist/public to dist
  const files = fs.readdirSync(sourceDir);
  
  files.forEach(file => {
    const sourcePath = path.join(sourceDir, file);
    const targetPath = path.join(targetDir, file);
    
    // Skip if file already exists in target (avoid overwriting server files)
    if (fs.existsSync(targetPath)) {
      return;
    }
    
    if (fs.statSync(sourcePath).isDirectory()) {
      // Copy directory recursively
      fs.cpSync(sourcePath, targetPath, { recursive: true });
    } else {
      // Copy file
      fs.copyFileSync(sourcePath, targetPath);
    }
  });
  
  console.log('✓ Deployment structure ready');
  console.log('✓ Static files available in dist/');
  console.log('✓ Server bundle available at dist/index.js');
} else {
  console.log('No dist/public directory found, skipping static file copy');
}