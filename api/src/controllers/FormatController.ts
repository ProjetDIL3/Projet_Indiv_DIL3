import { Request, Response, NextFunction } from 'express';
import { FormatService } from '../services/FormatService';
import CustomError from '../utils/CustomError';

export class FormatController {

    // GET /formats
    static async getAllFormats(req: Request, res: Response, next: NextFunction) {
        try {
            const formats = await FormatService.getAllFormats();
            res.json(formats);
        } catch (error) {
            next(error);
        }
    }

    // GET /formats/:id
    static async getFormatById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const format = await FormatService.getFormatById(id);
            
            if (!format) {
                throw new CustomError(404, "Format non trouvé");
            }
            
            res.json(format);
        } catch (error) {
            next(error);
        }
    }
}
