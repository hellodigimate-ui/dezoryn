import { Request, Response, NextFunction } from 'express';
import { HeroService } from '../services/hero.service';

export class HeroController {
  public static async getHero(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await HeroService.getHeroSection();
      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async updateHero(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await HeroService.updateHeroSection(req.body);
      res.status(200).json({
        success: true,
        message: 'Hero section updated successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async resetHero(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await HeroService.resetHeroSection();
      res.status(200).json({
        success: true,
        message: 'Hero section content reset to default settings',
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}
