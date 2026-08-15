import { Request, Response } from 'express';
import { WebsiteSettingsService } from '../services/website-settings.service';

export class WebsiteSettingsController {
  static async get(req: Request, res: Response): Promise<void> {
    try {
      const data = await WebsiteSettingsService.get();
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch website settings' });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const updated = await WebsiteSettingsService.update(req.body);
      res.status(200).json({ success: true, message: 'Website settings saved successfully', data: updated });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to update website settings' });
    }
  }
}
