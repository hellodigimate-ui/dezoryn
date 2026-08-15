import { Request, Response } from 'express';
import { FooterService } from '../services/footer.service';

export class FooterController {
  static async get(req: Request, res: Response): Promise<void> {
    try {
      const data = await FooterService.get();
      res.status(200).json({
        success: true,
        data,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch footer settings',
      });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const updated = await FooterService.update(req.body);
      res.status(200).json({
        success: true,
        message: 'Footer settings updated successfully',
        data: updated,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update footer settings',
      });
    }
  }
}
