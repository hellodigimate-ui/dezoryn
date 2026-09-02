import { Request, Response, NextFunction } from 'express';
import { ServiceService } from '../services/service.service';

const countWords = (str?: string): number => {
  if (!str) return 0;
  return str.trim().split(/\s+/).filter(Boolean).length;
};

const validateServiceInput = (body: any): string | null => {
  if (body.title && countWords(body.title) > 20) {
    return 'Service title cannot exceed 20 words';
  }
  if (body.description && countWords(body.description) > 50) {
    return 'Service description cannot exceed 50 words';
  }
  if (body.order !== undefined && typeof body.order === 'number' && body.order < 0) {
    return 'Display order index cannot be a negative value';
  }
  return null;
};

export class ServiceController {
  static async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const isEnabled = req.query.enabled === 'true' ? true : req.query.enabled === 'false' ? false : undefined;
      const filter = {
        category: req.query.category as string,
        status: req.query.status as string,
        isEnabled,
        search: req.query.search as string,
      };

      const services = await ServiceService.getAll(filter);
      res.status(200).json({
        success: true,
        count: services.length,
        data: services,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const service = await ServiceService.getById(req.params.id);
      if (!service) {
        res.status(404).json({ success: false, message: 'Service not found' });
        return;
      }
      res.status(200).json({
        success: true,
        data: service,
      });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const valErr = validateServiceInput(req.body);
      if (valErr) {
        res.status(400).json({ success: false, message: valErr });
        return;
      }

      const service = await ServiceService.create(req.body);
      res.status(201).json({
        success: true,
        message: 'Service created successfully',
        data: service,
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const valErr = validateServiceInput(req.body);
      if (valErr) {
        res.status(400).json({ success: false, message: valErr });
        return;
      }

      const service = await ServiceService.update(req.params.id, req.body);
      res.status(200).json({
        success: true,
        message: 'Service updated successfully',
        data: service,
      });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await ServiceService.delete(req.params.id);
      res.status(200).json({
        success: true,
        message: 'Service deleted successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async clearAll(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await ServiceService.clearAll();
      res.status(200).json({
        success: true,
        message: 'All services permanently deleted from database',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async toggleStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const service = await ServiceService.toggleStatus(req.params.id);
      res.status(200).json({
        success: true,
        message: 'Service status toggled successfully',
        data: service,
      });
    } catch (error) {
      next(error);
    }
  }

  static async duplicate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const service = await ServiceService.duplicate(req.params.id);
      res.status(201).json({
        success: true,
        message: 'Service duplicated successfully',
        data: service,
      });
    } catch (error) {
      next(error);
    }
  }

  static async reorder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orderedIds } = req.body;
      if (!Array.isArray(orderedIds)) {
        res.status(400).json({ success: false, message: 'orderedIds must be an array' });
        return;
      }
      const services = await ServiceService.reorder(orderedIds);
      res.status(200).json({
        success: true,
        message: 'Services reordered successfully',
        data: services,
      });
    } catch (error) {
      next(error);
    }
  }
}
