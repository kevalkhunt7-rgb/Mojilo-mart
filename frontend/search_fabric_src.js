import fs from 'fs';
import path from 'path';

const mjsPath = 'c:/Users/keval khunt/Desktop/Mojilo/Mojilo/frontend/node_modules/fabric/dist/index.mjs';
if (fs.existsSync(mjsPath)) {
  const content = fs.readFileSync(mjsPath, 'utf8');
  
  // Find loadSVGFromString
  const idx = content.indexOf('function loadSVGFromString');
  if (idx !== -1) {
    console.log(content.substring(idx, idx + 800));
  } else {
    console.log('Could not find function loadSVGFromString exactly.');
    // Let's search case insensitively or search for export const loadSVGFromString
    const idx2 = content.indexOf('loadSVGFromString');
    if (idx2 !== -1) {
      console.log(content.substring(idx2 - 100, idx2 + 800));
    }
  }
} else {
  console.log('index.mjs not found. Trying index.min.mjs');
  const minPath = 'c:/Users/keval khunt/Desktop/Mojilo/Mojilo/frontend/node_modules/fabric/dist/index.min.mjs';
  if (fs.existsSync(minPath)) {
    const content = fs.readFileSync(minPath, 'utf8');
    const idx = content.indexOf('loadSVGFromString');
    if (idx !== -1) {
      console.log(content.substring(idx - 100, idx + 800));
    }
  }
}
