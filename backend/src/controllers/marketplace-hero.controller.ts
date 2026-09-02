import { Request, Response, NextFunction } from 'express';
import { MarketplaceHeroService } from '../services/marketplace-hero.service';

export class MarketplaceHeroController {
  public static async get(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await MarketplaceHeroService.get();
      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await MarketplaceHeroService.update(req.body);
      res.status(200).json({
        success: true,
        message: 'Marketplace hero configuration saved to PostgreSQL database.',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async reset(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await MarketplaceHeroService.reset();
      res.status(200).json({
        success: true,
        message: 'Marketplace hero reset to clean default settings.',
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}
