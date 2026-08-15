import { Request, Response } from 'express';
import { AnalyticsService } from '../services/analytics.service';

export class AnalyticsController {
  static async getStats(req: Request, res: Response): Promise<void> {
    try {
      const now = new Date();
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const dateFrom = (req.query.dateFrom as string) || thirtyDaysAgo.toISOString().split('T')[0];
      const dateTo = (req.query.dateTo as string) || now.toISOString().split('T')[0];

      const data = await AnalyticsService.getStats(dateFrom, dateTo);
      res.status(200).json({ success: true, data, dateFrom, dateTo });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch analytics' });
    }
  }

  static async trackEvent(req: Request, res: Response): Promise<void> {
    try {
      const result = await AnalyticsService.trackEvent(req.body);
      res.status(200).json({ success: result.success });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to track event' });
    }
  }
}
