const PX_PER_INCH = 50;
const RATE = 1.00;
const MIN = 30;

function price(wPx, hPx) {
  const sqIn = (wPx * hPx) / (PX_PER_INCH * PX_PER_INCH);
  return Math.max(MIN, sqIn * RATE);
}

console.log('=== Pricing Formula Verification ===');
console.log('PX_PER_INCH:', PX_PER_INCH, '| RATE_PER_SQ_INCH: Rs.' + RATE, '| MIN_PER_VIEW: Rs.' + MIN);
console.log('');

const cases = [
  { label: '10in x 10in design',       wPx: 500, hPx: 500, expected: 100 },
  { label: '12in x 18in (full canvas)', wPx: 600, hPx: 900, expected: 216 },
  { label: '2in  x 2in  small logo',   wPx: 100, hPx: 100, expected: 30  },
  { label: '5in  x 5in  logo',         wPx: 250, hPx: 250, expected: 30  },
  { label: '6in  x 6in  logo',         wPx: 300, hPx: 300, expected: 36  },
  { label: '14in x 18in oversized',    wPx: 700, hPx: 900, expected: 252 },
  { label: '8in  x 4in  banner',       wPx: 400, hPx: 200, expected: 32  },
  { label: '5in  x 6in  at min edge',  wPx: 250, hPx: 300, expected: 30  },
];

let allPass = true;
cases.forEach(({ label, wPx, hPx, expected }) => {
  const sqIn = (wPx * hPx) / (PX_PER_INCH * PX_PER_INCH);
  const cost = price(wPx, hPx);
  const pass = cost === expected;
  if (!pass) allPass = false;
  const status = pass ? 'PASS' : 'FAIL';
  console.log('[' + status + '] ' + label + ': ' + wPx + 'px x ' + hPx + 'px -> ' + sqIn.toFixed(1) + ' sq-in -> Rs.' + cost + ' (expected Rs.' + expected + ')');
});

console.log('');
console.log(allPass ? 'All tests PASSED.' : 'Some tests FAILED.');
