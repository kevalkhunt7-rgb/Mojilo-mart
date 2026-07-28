import * as fabric from 'fabric';

// Mock minimal window/document for fabric
global.window = {
  navigator: { userAgent: 'node' },
  document: {
    createElement: () => ({
      getContext: () => ({})
    })
  }
};
global.document = global.window.document;
global.navigator = global.window.navigator;

try {
  const result = fabric.loadSVGFromString("<svg><rect x='10' y='10' width='100' height='100'/></svg>");
  console.log('Result of calling loadSVGFromString:', result);
  if (result && typeof result.then === 'function') {
    console.log('It returns a Promise!');
    result.then((res) => {
      console.log('Promise resolved elements:', res);
    });
  } else {
    console.log('It does not return a Promise.');
  }
} catch (e) {
  console.error('Error during execution:', e);
}
