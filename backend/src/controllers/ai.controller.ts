import { Request, Response, NextFunction } from 'express';
import { AIService } from '../services/ai.service';
import { BadRequestError } from '../errors/app-error';

export class AIController {
  public static async generateContent(req: Request, res: Response, next: NextFunction) {
    try {
      const { type, topic, tone, context, customPrompt } = req.body;
      if (!type) {
        throw new BadRequestError('Generation type is required');
      }

      const data = await AIService.generateContent({
        type,
        topic,
        tone,
        context,
        customPrompt,
      });

      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getSettings(_req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await AIService.getSettings();
      res.status(200).json({
        success: true,
        data: settings,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async updateSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const updatedSettings = await AIService.updateSettings(req.body);
      res.status(200).json({
        success: true,
        message: 'AI Assistant settings updated successfully',
        data: updatedSettings,
      });
    } catch (error) {
      next(error);
    }
  }
}
