import { prisma } from '../config/prisma.config';
import fs from 'fs';
import path from 'path';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.config';
import { S3Service } from './s3.service';

function getFileBuffer(file: Express.Multer.File): Buffer {
  if (file.buffer && file.buffer.length > 0) return file.buffer;
  if (file.path && fs.existsSync(file.path)) {
    try {
      return fs.readFileSync(file.path);
    } catch {
      return Buffer.from('');
    }
  }
  return Buffer.from('');
}

export interface UploadMediaParams {
  file: Express.Multer.File;
  folder?: string;
  uploadedById?: string;
}

const DEFAULT_MEDIA_ITEMS = [
  {
    id: 'med-seed-1',
    filename: 'dezoryn-enterprise-banner.png',
    originalName: 'dezoryn-enterprise-banner.png',
    mimeType: 'image/png',
    size: 245000,
    path: '/uploads/dezoryn-enterprise-banner.png',
    url: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=1200&auto=format&fit=crop',
    folder: 'Banners',
    cloudinaryId: 'dezoryn/banners/enterprise-banner',
    resourceType: 'image',
  },
  {
    id: 'med-seed-2',
    filename: 'ai-sales-copilot-demo.mp4',
    originalName: 'ai-sales-copilot-demo.mp4',
    mimeType: 'video/mp4',
    size: 15400000,
    path: '/uploads/ai-sales-copilot-demo.mp4',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    folder: 'Videos',
    cloudinaryId: 'dezoryn/videos/copilot-demo',
    resourceType: 'video',
  },
  {
    id: 'med-seed-3',
    filename: 'dezoryn-product-brochure-2026.pdf',
    originalName: 'dezoryn-product-brochure-2026.pdf',
    mimeType: 'application/pdf',
    size: 1250000,
    path: '/uploads/dezoryn-product-brochure-2026.pdf',
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    folder: 'Documents',
    cloudinaryId: 'dezoryn/documents/brochure-2026',
    resourceType: 'raw',
  },
];

export class MediaService {
  static determineResourceType(mimeType: string): 'image' | 'video' | 'raw' {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    return 'raw';
  }

  /**
   * UPLOAD MEDIA
   * Uploads file to AWS S3 and creates Media record in PostgreSQL.
   */
  static async upload(params: UploadMediaParams) {
    const { file, folder = 'General', uploadedById } = params;
    const resourceType = MediaService.determineResourceType(file.mimetype);

    const buffer = getFileBuffer(file);
    if (!buffer || buffer.length === 0) {
      if (file.path && fs.existsSync(file.path)) {
        try { fs.unlinkSync(file.path); } catch {}
      }
      throw new Error('File buffer is empty or could not be read.');
    }

    let finalUrl = '';
    let storagePath = '';
    let objectKey = '';

    try {
      const s3Result = await S3Service.uploadFile({
        buffer,
        originalname: file.originalname || file.filename,
        mimetype: file.mimetype,
        folder,
      });
      finalUrl = s3Result.url;
      storagePath = s3Result.key;
      objectKey = s3Result.key;
    } catch (s3Err: any) {
      console.error('[MediaService] S3 upload failed:', s3Err?.message || s3Err);
      if (file.path && fs.existsSync(file.path)) {
        try { fs.unlinkSync(file.path); } catch {}
      }
      throw new Error(`Image upload failed: ${s3Err?.message || 'Unable to store asset in S3'}`);
    }

    // Clean up temporary local upload file on disk after successful upload to S3
    if (file.path && fs.existsSync(file.path)) {
      try {
        fs.unlinkSync(file.path);
      } catch {}
    }

    const mediaData = {
      filename: file.filename || file.originalname,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      path: storagePath,
      url: finalUrl,
      folder: folder || 'General',
      cloudinaryId: objectKey,
      resourceType,
      uploadedById: uploadedById || null,
    };

    try {
      const created = await prisma.media.create({
        data: mediaData,
      });
      return created;
    } catch (error) {
      console.error('UPLOAD MEDIA ERROR:', error);
      throw error;
    }
  }

  static async replace(id: string, file: Express.Multer.File) {
    const existing = await MediaService.getById(id);
    if (!existing) throw new Error('Media asset not found');

    // Delete existing asset from S3 / Cloudinary
    if (existing.path && !existing.path.startsWith('/uploads/')) {
      await S3Service.deleteFile(existing.path);
    } else if (existing.cloudinaryId) {
      try {
        await deleteFromCloudinary(existing.cloudinaryId, existing.resourceType);
      } catch {
        await S3Service.deleteFile(existing.cloudinaryId);
      }
    }

    const resourceType = MediaService.determineResourceType(file.mimetype);
    const folder = existing.folder || 'General';

    const buffer = getFileBuffer(file);
    if (!buffer || buffer.length === 0) {
      if (file.path && fs.existsSync(file.path)) {
        try { fs.unlinkSync(file.path); } catch {}
      }
      throw new Error('Replacement file buffer is empty or could not be read.');
    }

    let finalUrl = '';
    let storagePath = '';
    let objectKey = '';

    try {
      const s3Result = await S3Service.uploadFile({
        buffer,
        originalname: file.originalname || file.filename,
        mimetype: file.mimetype,
        folder,
      });
      finalUrl = s3Result.url;
      storagePath = s3Result.key;
      objectKey = s3Result.key;
    } catch (s3Err: any) {
      console.error('[MediaService] S3 replace failed:', s3Err?.message || s3Err);
      if (file.path && fs.existsSync(file.path)) {
        try { fs.unlinkSync(file.path); } catch {}
      }
      throw new Error(`Media replacement failed: ${s3Err?.message || 'Unable to store asset in S3'}`);
    }

    // Clean up temporary local upload file on disk
    if (file.path && fs.existsSync(file.path)) {
      try {
        fs.unlinkSync(file.path);
      } catch {}
    }

    try {
      const updated = await prisma.media.update({
        where: { id },
        data: {
          filename: file.filename || file.originalname,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          path: storagePath,
          url: finalUrl,
          cloudinaryId: objectKey,
          resourceType,
        },
      });

      return updated;
    } catch (error) {
      console.error(`REPLACE MEDIA ${id} ERROR:`, error);
      throw error;
    }
  }

  static async delete(id: string) {
    try {
      const existing = await prisma.media.findUnique({ where: { id } });
      if (!existing) {
        return { success: true };
      }

      // Delete from S3
      if (existing.path && !existing.path.startsWith('/uploads/')) {
        await S3Service.deleteFile(existing.path);
      } else if (existing.cloudinaryId) {
        try {
          await deleteFromCloudinary(existing.cloudinaryId, existing.resourceType);
        } catch {
          await S3Service.deleteFile(existing.cloudinaryId);
        }
      }

      if (existing.path && existing.path.startsWith('/uploads/')) {
        const cleanPath = existing.path.replace(/^\/+/, '');
        const localPath = path.resolve(process.cwd(), cleanPath);
        if (fs.existsSync(localPath)) {
          try {
            fs.unlinkSync(localPath);
          } catch {}
        }
      }

      await prisma.media.delete({ where: { id } });
      return { success: true };
    } catch (error) {
      console.error(`DELETE MEDIA ${id} ERROR:`, error);
      throw error;
    }
  }

  static async getById(id: string) {
    try {
      const item = await prisma.media.findUnique({ where: { id } });
      return item;
    } catch (error) {
      console.error(`GET MEDIA ${id} ERROR:`, error);
      throw error;
    }
  }

  static async getAll(filter?: { folder?: string; search?: string; resourceType?: string }) {
    try {
      let items = await prisma.media.findMany({ orderBy: { createdAt: 'desc' } });

      if (!items || items.length === 0) {
        await prisma.media.createMany({
          data: DEFAULT_MEDIA_ITEMS,
        });
        items = await prisma.media.findMany({ orderBy: { createdAt: 'desc' } });
      }

      let result = [...items];
      if (filter?.folder && filter.folder !== 'All') {
        result = result.filter(item => item.folder?.toLowerCase() === filter.folder!.toLowerCase());
      }
      if (filter?.resourceType && filter.resourceType !== 'All') {
        result = result.filter(item => item.resourceType?.toLowerCase() === filter.resourceType!.toLowerCase());
      }
      if (filter?.search) {
        const q = filter.search.toLowerCase();
        result = result.filter(item =>
          item.filename?.toLowerCase().includes(q) ||
          item.originalName?.toLowerCase().includes(q) ||
          item.folder?.toLowerCase().includes(q)
        );
      }

      return result;
    } catch (error) {
      console.error('GET ALL MEDIA ERROR:', error);
      throw error;
    }
  }

  static async getFolders() {
    try {
      const items = await MediaService.getAll();
      const folderSet = new Set(['All', 'General', 'Images', 'Videos', 'Documents', 'Banners', 'Products', 'Testimonials']);
      items.forEach((item: any) => {
        if (item.folder) folderSet.add(item.folder);
      });
      return Array.from(folderSet);
    } catch {
      return ['All', 'General', 'Images', 'Videos', 'Documents', 'Banners', 'Products', 'Testimonials'];
    }
  }
}
