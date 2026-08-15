import { Request, Response, NextFunction } from 'express';
import { PricingService } from '../services/pricing.service';

export class PricingController {
  static async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const onlyEnabled = req.query.enabled === 'true';
      const plans = await PricingService.getAll(onlyEnabled);
      res.status(200).json({ success: true, data: plans });
    } catch (err) { next(err); }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const plan = await PricingService.getById(req.params.id);
      if (!plan) { res.status(404).json({ success: false, message: 'Plan not found' }); return; }
      res.status(200).json({ success: true, data: plan });
    } catch (err) { next(err); }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, price, description } = req.body;
      if (!name || !price || !description) {
        res.status(400).json({ success: false, message: 'name, price and description are required' });
        return;
      }
      const plan = await PricingService.create(req.body);
      res.status(201).json({ success: true, data: plan });
    } catch (err) { next(err); }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const plan = await PricingService.update(req.params.id, req.body);
      res.status(200).json({ success: true, data: plan });
    } catch (err) { next(err); }
  }

  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await PricingService.delete(req.params.id);
      res.status(200).json({ success: true, message: 'Plan deleted' });
    } catch (err) { next(err); }
  }

  static async toggleEnabled(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const plan = await PricingService.toggleEnabled(req.params.id);
      res.status(200).json({ success: true, data: plan });
    } catch (err) { next(err); }
  }

  static async reorder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orderedIds } = req.body;
      if (!Array.isArray(orderedIds)) {
        res.status(400).json({ success: false, message: 'orderedIds must be an array' });
        return;
      }
      const plans = await PricingService.reorder(orderedIds);
      res.status(200).json({ success: true, data: plans });
    } catch (err) { next(err); }
  }
}
