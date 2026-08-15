import { Request, Response } from 'express';
import { ThemeService } from '../services/theme.service';

export class ThemeController {
  static async get(req: Request, res: Response): Promise<void> {
    try {
      const data = await ThemeService.get();
      res.status(200).json({
        success: true,
        data,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch theme settings',
      });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const updated = await ThemeService.update(req.body);
      res.status(200).json({
        success: true,
        message: 'Theme settings updated successfully',
        data: updated,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update theme settings',
      });
    }
  }
}
