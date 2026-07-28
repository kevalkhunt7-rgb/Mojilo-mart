import ApparelTemplate from '../models/ApparelTemplate.js';

// Default seed data — created on first-ever GET if collection is empty
const DEFAULT_TEMPLATES = [
  { key: 'half-sleeve',    name: 'Half Sleeve T-Shirt',  basePrice: 299 },
  { key: 'long-sleeve',    name: 'Long Sleeve T-Shirt',  basePrice: 399 },
  { key: 'oversized',      name: 'Oversized T-Shirt',    basePrice: 449 },
  { key: 'hoodie',         name: 'Hoodie',               basePrice: 699 },
  { key: 'sports-jersey',  name: 'Sports Jersey',        basePrice: 499 },
];

/**
 * GET /api/admin/apparel-templates
 * Returns all apparel template configurations.
 * Seeds defaults if the collection is empty.
 */
export const getApparelTemplates = async (req, res) => {
  try {
    let templates = await ApparelTemplate.find().sort({ createdAt: 1 });

    if (templates.length === 0) {
      // Seed defaults on first run
      templates = await ApparelTemplate.insertMany(
        DEFAULT_TEMPLATES.map((t) => ({
          ...t,
          availableColors: ['#FFFFFF', '#000000', '#1E3A8A', '#DC2626'],
          sizes: [
            { size: 'S',   enabled: true,  priceAddon: 0 },
            { size: 'M',   enabled: true,  priceAddon: 0 },
            { size: 'L',   enabled: true,  priceAddon: 0 },
            { size: 'XL',  enabled: true,  priceAddon: 0 },
            { size: 'XXL', enabled: true,  priceAddon: 0 },
            { size: '3XL', enabled: false, priceAddon: 0 },
          ],
        }))
      );
    }

    res.json({ success: true, data: templates });
  } catch (err) {
    console.error('getApparelTemplates error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch apparel templates' });
  }
};

/**
 * GET /api/admin/apparel-templates/:id
 * Returns a single apparel template by MongoDB _id.
 */
export const getApparelTemplateById = async (req, res) => {
  try {
    const template = await ApparelTemplate.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }
    res.json({ success: true, data: template });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch template' });
  }
};

/**
 * PUT /api/admin/apparel-templates/:id
 * Updates basePrice, availableColors, sizes, isActive for a template.
 */
export const updateApparelTemplate = async (req, res) => {
  try {
    const { basePrice, availableColors, sizes, isActive } = req.body;

    const update = {};
    if (basePrice !== undefined)       update.basePrice       = Number(basePrice);
    if (availableColors !== undefined)  update.availableColors = availableColors;
    if (sizes !== undefined)            update.sizes           = sizes;
    if (isActive !== undefined)         update.isActive        = Boolean(isActive);

    const template = await ApparelTemplate.findByIdAndUpdate(
      req.params.id,
      { $set: update },
      { new: true, runValidators: true }
    );

    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    res.json({ success: true, data: template, message: 'Template updated successfully' });
  } catch (err) {
    console.error('updateApparelTemplate error:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to update template' });
  }
};

/**
 * GET /api/apparel-templates
 * Public endpoint — returns only active templates (used by frontend customizer).
 */
export const getPublicApparelTemplates = async (req, res) => {
  try {
    const templates = await ApparelTemplate.find({ isActive: true })
      .select('key name basePrice availableColors sizes')
      .sort({ createdAt: 1 });
    res.json({ success: true, data: templates });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch templates' });
  }
};
