import { Request, Response, NextFunction } from 'express';
import { AboutService } from '../services/about.service';

export class AboutController {
  public static async getAboutSection(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AboutService.getAboutSection();
      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async updateAboutSection(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AboutService.updateAboutSection(req.body);
      res.json({
        success: true,
        message: 'About section updated successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async updateMedia(req: Request, res: Response, next: NextFunction) {
    try {
      const { mediaUrl, mediaType, mediaId } = req.body;
      const data = await AboutService.updateMedia(mediaUrl, mediaType, mediaId);
      res.json({
        success: true,
        message: 'About section media updated successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async removeMedia(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AboutService.removeMedia();
      res.json({
        success: true,
        message: 'About section media removed successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}
