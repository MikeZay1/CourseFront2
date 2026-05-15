import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dist = path.resolve(__dirname, '..', 'dist');
const index = path.join(dist, 'index.html');
const fallback = path.join(dist, '404.html');

if (fs.existsSync(index)) {
  fs.copyFileSync(index, fallback);
  console.log('SPA fallback: copied index.html -> 404.html');
} else {
  console.warn('SPA fallback: dist/index.html not found, skip');
}
