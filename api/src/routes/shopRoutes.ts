import { Router } from 'express';
import { ShopController } from '../controllers/ShopController';

const router = Router();

// Routes publiques pour accéder aux magasins
router.get('/', ShopController.getAllShops);
router.get('/:id', ShopController.getShopById);

export default router;