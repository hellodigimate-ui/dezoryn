import { Request, Response, NextFunction } from 'express';
import { NavService } from '../services/nav.service';

export class NavController {
  public static async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const items = await NavService.getAllNavItems();
      res.status(200).json({ success: true, data: items });
    } catch (error) {
      next(error);
    }
  }

  public static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { label, route, isVisible, isHighlight } = req.body;
      if (!label || !route) {
        res.status(400).json({ success: false, message: 'label and route are required' });
        return;
      }
      const item = await NavService.createNavItem({ label, route, isVisible, isHighlight });
      res.status(201).json({ success: true, data: item });
    } catch (error) {
      next(error);
    }
  }

  public static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const item = await NavService.updateNavItem(id, req.body);
      res.status(200).json({ success: true, data: item });
    } catch (error) {
      next(error);
    }
  }

  public static async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await NavService.deleteNavItem(id);
      res.status(200).json({ success: true, message: 'Nav item deleted' });
    } catch (error) {
      next(error);
    }
  }

  public static async reorder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orderedIds } = req.body;
      if (!Array.isArray(orderedIds)) {
        res.status(400).json({ success: false, message: 'orderedIds must be an array' });
        return;
      }
      const items = await NavService.reorderNavItems(orderedIds);
      res.status(200).json({ success: true, data: items });
    } catch (error) {
      next(error);
    }
  }

  public static async toggleVisibility(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const item = await NavService.toggleVisibility(id);
      res.status(200).json({ success: true, data: item });
    } catch (error) {
      next(error);
    }
  }

  public static async reset(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const items = await NavService.resetToDefaults();
      res.status(200).json({ success: true, message: 'Navigation reset to defaults', data: items });
    } catch (error) {
      next(error);
    }
  }
}
