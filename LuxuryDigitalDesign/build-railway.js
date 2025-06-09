#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Building for Railway deployment...');

try {
  // Build frontend
  console.log('Building frontend...');
  execSync('vite build', { stdio: 'inherit' });
  
  // Build server
  console.log('Building server...');
  execSync('esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist', { stdio: 'inherit' });
  
  // Copy static files to dist root for Railway
  const sourceDir = path.join(__dirname, 'dist', 'public');
  const targetDir = path.join(__dirname, 'dist');
  
  if (fs.existsSync(sourceDir)) {
    console.log('Preparing deployment structure...');
    
    const files = fs.readdirSync(sourceDir);
    
    files.forEach(file => {
      const sourcePath = path.join(sourceDir, file);
      const targetPath = path.join(targetDir, file);
      
      // Skip if file already exists in target
      if (fs.existsSync(targetPath)) {
        return;
      }
      
      if (fs.statSync(sourcePath).isDirectory()) {
        fs.cpSync(sourcePath, targetPath, { recursive: true });
      } else {
        fs.copyFileSync(sourcePath, targetPath);
      }
    });
    
    console.log('✓ Build complete for Railway deployment');
  }
  
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}