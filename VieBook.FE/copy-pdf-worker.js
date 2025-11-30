import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Copy legacy worker file (vì đang dùng legacy build)
const workerSrc = path.join(__dirname, 'node_modules', 'pdfjs-dist', 'legacy', 'build', 'pdf.worker.min.mjs');
const workerDest = path.join(__dirname, 'public', 'pdf.worker.min.js');

try {
  // Ensure public directory exists
  const publicDir = path.join(__dirname, 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  if (fs.existsSync(workerSrc)) {
    fs.copyFileSync(workerSrc, workerDest);
    console.log('✓ Successfully copied PDF.js worker to public folder');
    console.log('  From:', workerSrc);
    console.log('  To:', workerDest);
  } else {
    console.error('✗ Worker file not found at:', workerSrc);
    process.exit(1);
  }
} catch (error) {
  console.error('✗ Error copying worker file:', error.message);
  process.exit(1);
}

