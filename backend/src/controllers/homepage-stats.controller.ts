import { Request, Response, NextFunction } from 'express';
import { HomepageStatsService } from '../services/homepage-stats.service';
import { BadRequestError } from '../errors/app-error';

export class HomepageStatsController {
  public static async get(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await HomepageStatsService.get();
      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        statsEnabled,
        aiAssistantEnabled,
        aiAssistantTitle,
        aiAssistantGreeting,
        aiAssistantButtonLabel,
        aiAssistantButtonLink,
        stats,
      } = req.body;

      // Validation checks
      if (stats && Array.isArray(stats)) {
        for (const s of stats) {
          if (!s.label || !s.label.trim()) {
            throw new BadRequestError('Statistic label cannot be empty');
          }
          if (s.value === undefined || s.value === null || String(s.value).trim() === '') {
            throw new BadRequestError('Statistic value cannot be empty');
          }
        }
      }

      if (aiAssistantEnabled) {
        if (!aiAssistantTitle || !aiAssistantTitle.trim()) {
          throw new BadRequestError('AI Assistant title cannot be empty when enabled');
        }
        if (!aiAssistantGreeting || !aiAssistantGreeting.trim()) {
          throw new BadRequestError('AI Assistant greeting cannot be empty when enabled');
        }
        if (!aiAssistantButtonLabel || !aiAssistantButtonLabel.trim()) {
          throw new BadRequestError('Button label cannot be empty when enabled');
        }
      }

      const updated = await HomepageStatsService.update({
        statsEnabled,
        aiAssistantEnabled,
        aiAssistantTitle,
        aiAssistantGreeting,
        aiAssistantButtonLabel,
        aiAssistantButtonLink,
        stats,
      });

      res.status(200).json({
        success: true,
        message: 'Homepage statistics updated successfully.',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async reset(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await HomepageStatsService.reset();
      res.status(200).json({
        success: true,
        message: 'Homepage statistics reset to default values.',
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}
