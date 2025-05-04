import { Router } from 'express';
import { FormatController } from '../controllers/FormatController';

const router = Router();

// Routes publiques pour accéder aux formats
router.get('/', FormatController.getAllFormats);
router.get('/:id', FormatController.getFormatById);

export default router;
