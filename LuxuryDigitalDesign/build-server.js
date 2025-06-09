#!/usr/bin/env node

import { build } from 'esbuild';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

try {
  await build({
    entryPoints: ['server/index.ts'],
    bundle: true,
    platform: 'node',
    format: 'esm',
    packages: 'external',
    outdir: 'dist',
    define: {
      'import.meta.dirname': '__dirname'
    },
    banner: {
      js: `import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);`
    }
  });
  
  console.log('✓ Server build completed successfully');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}