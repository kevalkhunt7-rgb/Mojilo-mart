import { TshirtModel } from '../components/TshirtModel';
import { LongSleeveModel } from '../components/LongSleeveModel'; 
import { HoodieModel } from '../components/HoodieModel';
import { OversizedModel } from '../components/OversizedModel'; 
import { SportsJerseyModel } from '../components/SportsJerseyModel';

// ── Canvas / Print-area sizing constants ─────────────────────────────────────
// Resolution: 50 px = 1 physical inch  →  600 px = 12"  |  900 px = 18"
// Max printable area = 12" × 18" = 216 sq-in → ₹216 at ₹1/sq-in
// Min charge per view = ₹30 (enforced in pricing engine for areas ≤ 30 sq-in)
//
// Pricing formula check:
//   10" × 10" design  →  500px × 500px  →  10 × 10 × ₹1 = ₹100  ✓
//   12" × 18" (full)  →  600px × 900px  →  12 × 18 × ₹1 = ₹216  ✓
//   2"  × 2"  (small) →  100px × 100px  →  4 sq-in → clamped to ₹30 minimum ✓

export const apparelConfig = {
  'half-sleeve': {
    id: 'half-sleeve',
    name: 'Half Sleeve T-Shirt',
    modelComponent: TshirtModel,
    basePrice: 19.99,
    supportedViews: ['front', 'back'],
    printAreas: {
      front: { width: 600, height: 900, label: "Front Print Area (12\" x 18\")" },
      back:  { width: 600, height: 900, label: "Back Print Area (12\" x 18\")" },
    }
  },
  'long-sleeve': {
    id: 'long-sleeve',
    name: 'Long Sleeve T-Shirt',
    modelComponent: LongSleeveModel, 
    basePrice: 24.99,
    supportedViews: ['front', 'back'],
    printAreas: {
      front: { width: 600, height: 900, label: "Front Print Area (12\" x 18\")" },
      back:  { width: 600, height: 900, label: "Back Print Area (12\" x 18\")" },
    }
  },
  'oversized': {
    id: 'oversized',
    name: 'Oversized T-Shirt',
    modelComponent: OversizedModel, 
    basePrice: 22.99,
    supportedViews: ['front', 'back'],
    printAreas: {
      front: { width: 700, height: 900, label: "Front Print Area (14\" x 18\")" },
      back:  { width: 700, height: 900, label: "Back Print Area (14\" x 18\")" },
    }
  },
  'hoodie': {
    id: 'hoodie',
    name: 'Hoodie',
    modelComponent: HoodieModel, 
    basePrice: 39.99,
    supportedViews: ['front', 'back'],
    printAreas: {
      front:  { width: 600, height: 900, label: "Front Print Area (12\" x 18\")" },
      back:   { width: 600, height: 900, label: "Back Print Area (12\" x 18\")" },
      pocket: { width: 500, height: 300, label: "Pocket Print Area (10\" x 6\")" },
      hood:   { width: 400, height: 400, label: "Hood Print Area (8\" x 8\")" },
    }
  },
  'sports-jersey': {
    id: 'sports-jersey',
    name: 'Sports Jersey',
    modelComponent: SportsJerseyModel, 
    basePrice: 29.99,
    supportedViews: ['front', 'back', 'left', 'right'],
    printAreas: {
      front: { width: 600, height: 900, label: "Front Print Area (12\" x 18\")" },
      back:  { width: 600, height: 900, label: "Back Print Area (12\" x 18\")" },
      left:  { width: 600, height: 900, label: "Left Sleeve Print Area (12\" x 18\")" },
      right: { width: 600, height: 900, label: "Right Sleeve Print Area (12\" x 18\")" },
    }
  }
};