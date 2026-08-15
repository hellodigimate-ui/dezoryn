import { Request, Response, NextFunction } from 'express';
import { JobService } from '../services/job.service';

export class JobController {
  static async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { department, status, enabled, search } = req.query;
      const filter: any = {};
      if (department) filter.department = String(department);
      if (status) filter.status = String(status);
      if (enabled !== undefined) filter.isEnabled = enabled === 'true';
      if (search) filter.search = String(search);

      const jobs = await JobService.getAll(filter);
      res.status(200).json({ success: true, data: jobs });
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const job = await JobService.getById(req.params.id);
      if (!job) {
        res.status(404).json({ success: false, message: 'Job opening not found' });
        return;
      }
      res.status(200).json({ success: true, data: job });
    } catch (err) {
      next(err);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { title, department, location, description } = req.body;
      if (!title || !department || !location || !description) {
        res.status(400).json({ success: false, message: 'title, department, location, and description are required' });
        return;
      }
      const job = await JobService.create(req.body);
      res.status(201).json({ success: true, data: job });
    } catch (err) {
      next(err);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const job = await JobService.update(req.params.id, req.body);
      res.status(200).json({ success: true, data: job });
    } catch (err) {
      next(err);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await JobService.delete(req.params.id);
      res.status(200).json({ success: true, message: 'Job opening deleted' });
    } catch (err) {
      next(err);
    }
  }

  static async toggleStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const job = await JobService.toggleStatus(req.params.id);
      res.status(200).json({ success: true, data: job });
    } catch (err) {
      next(err);
    }
  }

  static async duplicate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const job = await JobService.duplicate(req.params.id);
      res.status(201).json({ success: true, data: job });
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
      const jobs = await JobService.reorder(orderedIds);
      res.status(200).json({ success: true, data: jobs });
    } catch (err) {
      next(err);
    }
  }
}
