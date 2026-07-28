import express from 'express';
import {
  getApparelTemplates,
  getApparelTemplateById,
  updateApparelTemplate,
  getPublicApparelTemplates,
} from '../controllers/apparelTemplateController.js';

const router = express.Router();

// Admin routes (protected — add your auth middleware here if needed)
router.get('/',     getApparelTemplates);
router.get('/:id',  getApparelTemplateById);
router.put('/:id',  updateApparelTemplate);

export default router;

// ── Public router ─────────────────────────────────────────────────────────────
import { Router } from 'express';
export const publicApparelRouter = Router();
publicApparelRouter.get('/', getPublicApparelTemplates);
