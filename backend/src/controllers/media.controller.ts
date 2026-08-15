import { Request, Response } from 'express';
import { MediaService } from '../services/media.service';

export class MediaController {
  static async upload(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, message: 'No file provided for upload' });
        return;
      }

      const folder = (req.body.folder as string) || 'General';
      const uploadedById = (req as any).user?.id;

      const media = await MediaService.upload({
        file: req.file,
        folder,
        uploadedById,
      });

      res.status(201).json({
        success: true,
        message: 'File uploaded to Cloudinary successfully',
        data: media,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Media upload failed',
      });
    }
  }

  static async replace(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!req.file) {
        res.status(400).json({ success: false, message: 'No replacement file provided' });
        return;
      }

      const updated = await MediaService.replace(id, req.file);

      res.status(200).json({
        success: true,
        message: 'File replaced successfully in Cloudinary',
        data: updated,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Media replacement failed',
      });
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await MediaService.delete(id);

      res.status(200).json({
        success: true,
        message: 'Media asset deleted successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Media deletion failed',
      });
    }
  }

  static async list(req: Request, res: Response): Promise<void> {
    try {
      const { folder, search, resourceType } = req.query;

      const data = await MediaService.getAll({
        folder: folder as string,
        search: search as string,
        resourceType: resourceType as string,
      });

      res.status(200).json({
        success: true,
        data,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch media assets',
      });
    }
  }

  static async folders(req: Request, res: Response): Promise<void> {
    try {
      const folders = await MediaService.getFolders();

      res.status(200).json({
        success: true,
        data: folders,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch folders',
      });
    }
  }
}
