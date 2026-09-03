import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { prisma } from '../config/prisma.config';
import { BadRequestError } from '../errors/app-error';
import { S3Service } from '../services/s3.service';

export class UploadController {
  public static async uploadFile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        throw new BadRequestError('No file provided for upload');
      }

      const file = req.file;
      const folder = (req.body.folder as string) || 'products';

      let fileBuffer = file.buffer;
      if (!fileBuffer && file.path && fs.existsSync(file.path)) {
        try {
          fileBuffer = fs.readFileSync(file.path);
        } catch {}
      }

      let finalUrl = `/uploads/${file.filename}`;
      let storagePath = file.path || `/uploads/${file.filename}`;
      let s3Key = file.filename;

      try {
        if (fileBuffer && fileBuffer.length > 0) {
          const s3Result = await S3Service.uploadFile({
            buffer: fileBuffer,
            originalname: file.originalname || file.filename,
            mimetype: file.mimetype,
            folder,
          });
          finalUrl = s3Result.url;
          storagePath = s3Result.key;
          s3Key = s3Result.key;
        }
      } catch (s3Err: any) {
        console.warn('[UploadController] S3 upload error, falling back to local path:', s3Err?.message || s3Err);
      }

      // Clean up local temp file on disk if created by Multer
      if (file.path && fs.existsSync(file.path) && finalUrl.startsWith('http')) {
        try {
          fs.unlinkSync(file.path);
        } catch {}
      }

      const media = await prisma.media.create({
        data: {
          filename: path.basename(storagePath),
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          path: storagePath,
          url: finalUrl,
          folder,
          cloudinaryId: s3Key,
          uploadedById: (req as any).user?.id || null,
        },
      });

      res.status(201).json({
        success: true,
        url: finalUrl,
        data: {
          url: finalUrl,
          key: s3Key,
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
