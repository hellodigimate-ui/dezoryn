import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma.config';
import { BadRequestError } from '../errors/app-error';

export class UploadController {
  public static async uploadFile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        throw new BadRequestError('No file provided for upload');
      }

      const file = req.file;
      const fileUrl = `/uploads/${file.filename}`;

      const media = await prisma.media.create({
        data: {
          filename: file.filename,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          path: file.path,
          url: fileUrl,
          uploadedById: (req as any).user?.id || null,
        },
      });

      res.status(201).json({
        success: true,
        url: fileUrl,
        data: {
          url: fileUrl,
          media,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getMediaList(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      const skip = (page - 1) * limit;

      const [total, media] = await Promise.all([
        prisma.media.count(),
        prisma.media.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            uploadedBy: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
          },
        }),
      ]);

      res.status(200).json({
        success: true,
        data: {
          media,
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
