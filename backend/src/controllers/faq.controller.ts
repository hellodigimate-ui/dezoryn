import { Request, Response, NextFunction } from 'express';
import { FaqService } from '../services/faq.service';

export class FaqController {
  static async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { category, status, enabled, search } = req.query;
      const filter: any = {};
      if (category) filter.category = String(category);
      if (status) filter.status = String(status);
      if (enabled !== undefined) filter.isEnabled = enabled === 'true';
      if (search) filter.search = String(search);

      const faqs = await FaqService.getAll(filter);
      res.status(200).json({ success: true, data: faqs });
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const faq = await FaqService.getById(req.params.id);
      if (!faq) {
        res.status(404).json({ success: false, message: 'FAQ not found' });
        return;
      }
      res.status(200).json({ success: true, data: faq });
    } catch (err) {
      next(err);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { question, answer } = req.body;
      if (!question || !answer) {
        res.status(400).json({ success: false, message: 'question and answer are required' });
        return;
      }
      const faq = await FaqService.create(req.body);
      res.status(201).json({ success: true, data: faq });
    } catch (err) {
      next(err);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const faq = await FaqService.update(req.params.id, req.body);
      res.status(200).json({ success: true, data: faq });
    } catch (err) {
      next(err);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await FaqService.delete(req.params.id);
      res.status(200).json({ success: true, message: 'FAQ deleted' });
    } catch (err) {
      next(err);
    }
  }

  static async toggleStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const faq = await FaqService.toggleStatus(req.params.id);
      res.status(200).json({ success: true, data: faq });
    } catch (err) {
      next(err);
    }
  }

  static async duplicate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const faq = await FaqService.duplicate(req.params.id);
      res.status(201).json({ success: true, data: faq });
    } catch (err) {
      next(err);
    }
  }

  static async reorder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orderedIds } = req.body;
      if (!Array.isArray(orderedIds)) {
        res.status(400).json({ success: false, message: 'orderedIds must be an array of IDs' });
        return;
      }
      const faqs = await FaqService.reorder(orderedIds);
      res.status(200).json({ success: true, data: faqs });
    } catch (err) {
      next(err);
    }
  }
}
