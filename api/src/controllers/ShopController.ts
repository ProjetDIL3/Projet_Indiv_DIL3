import { Request, Response, NextFunction } from 'express';
import { ShopService } from '../services/ShopService';
import CustomError from '../utils/CustomError';

export class ShopController {

  //GET /shops
  static async getAllShops(req: Request, res: Response, next: NextFunction) {
    try {
      const shops = await ShopService.getAllShops();
      res.json(shops);
    } catch (error) {
      next(error);
    }
  }

  //GET /shops/:id
  static async getShopById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const shop = await ShopService.getShopById(id);
      
      if (!shop) {
        throw new CustomError(404, "Magasin non trouvé");
      }
      
      res.json(shop);
    } catch (error) {
      next(error);
    }
  }
}