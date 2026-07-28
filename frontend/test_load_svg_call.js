import * as fabric from 'fabric';

try {
  const result = fabric.loadSVGFromString("<svg><rect x='10' y='10' width='100' height='100'/></svg>");
  console.log('Result of calling loadSVGFromString without callback:', result);
  
  if (result && typeof result.then === 'function') {
    result.then(res => {
      console.log('Promise resolved:', res);
    });
  } else {
    console.log('Result is not a promise.');
  }
} catch (e) {
  console.error('Error:', e);
}
