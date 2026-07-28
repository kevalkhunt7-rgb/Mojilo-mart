import { body } from 'express-validator';

export const customizationRules = [
  body('printAreaId').isMongoId().withMessage('Print area ID is required'),
  body('backgroundColor').optional().isHexColor().withMessage('Invalid background color'),
  body('textLayers').optional().isArray().withMessage('Text layers must be passed as an array'),
  body('imageLayers').optional().isArray().withMessage('Image layers must be passed as an array')
];
