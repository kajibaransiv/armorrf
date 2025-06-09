#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.join(__dirname, 'dist');
const publicDir = path.join(__dirname, 'dist', 'public');
const serverFile = path.join(__dirname, 'dist', 'index.js');

// Create public directory if it doesn't exist
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Move static files from dist/ to dist/public/
const filesToMove = ['index.html', 'assets'];

filesToMove.forEach(item => {
  const sourcePath = path.join(distDir, item);
  const targetPath = path.join(publicDir, item);
  
  if (fs.existsSync(sourcePath)) {
    if (fs.statSync(sourcePath).isDirectory()) {
      // Move directory
      if (fs.existsSync(targetPath)) {
        fs.rmSync(targetPath, { recursive: true });
      }
      fs.renameSync(sourcePath, targetPath);
    } else {
      // Move file
      if (fs.existsSync(targetPath)) {
        fs.unlinkSync(targetPath);
      }
      fs.renameSync(sourcePath, targetPath);
    }
    console.log(`✓ Moved ${item} to dist/public/`);
  }
});

// Verify final structure
if (fs.existsSync(serverFile) && fs.existsSync(path.join(publicDir, 'index.html'))) {
  console.log('✓ Deployment structure ready');
  console.log('✓ Static files available in dist/public/');
  console.log('✓ Server bundle available at dist/index.js');
} else {
  console.log('❌ Error: Deployment structure incomplete');
  process.exit(1);
}
