import { Request, Response } from 'express';
import { CareersCMSService } from '../services/careers-cms.service';

export class CareersCMSController {
  static async get(_req: Request, res: Response): Promise<void> {
    try {
      const data = await CareersCMSService.get();
      res.status(200).json({
        success: true,
        data,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch Careers CMS',
      });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const data = await CareersCMSService.update(req.body);
      res.status(200).json({
        success: true,
        message: 'Careers CMS updated successfully in PostgreSQL database',
        data,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update Careers CMS',
      });
    }
  }

  static async reset(_req: Request, res: Response): Promise<void> {
    try {
      const data = await CareersCMSService.reset();
      res.status(200).json({
        success: true,
        message: 'Careers CMS reset to default successfully',
        data,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to reset Careers CMS',
      });
    }
  }
}
