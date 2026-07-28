import fs from 'fs';
import path from 'path';

const mjsPath = 'c:/Users/keval khunt/Desktop/Mojilo/Mojilo/frontend/node_modules/fabric/dist/index.mjs';
if (fs.existsSync(mjsPath)) {
  const content = fs.readFileSync(mjsPath, 'utf8');
  const idx = content.indexOf('function parseSVGDocument');
  if (idx !== -1) {
    // Search for the end of the function or return statement
    const returnIdx = content.indexOf('return Promise.all', idx);
    if (returnIdx !== -1 && returnIdx < idx + 4000) {
      console.log(content.substring(returnIdx, returnIdx + 500));
    } else {
      console.log('Return statement not found directly. Printing chunk...');
      console.log(content.substring(idx + 1000, idx + 2000));
    }
  }
}
