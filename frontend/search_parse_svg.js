import fs from 'fs';
import path from 'path';

const mjsPath = 'c:/Users/keval khunt/Desktop/Mojilo/Mojilo/frontend/node_modules/fabric/dist/index.mjs';
if (fs.existsSync(mjsPath)) {
  const content = fs.readFileSync(mjsPath, 'utf8');
  
  // Find parseSVGDocument
  const idx = content.indexOf('function parseSVGDocument');
  if (idx !== -1) {
    console.log(content.substring(idx, idx + 800));
  } else {
    console.log('Could not find function parseSVGDocument exactly.');
  }
}
