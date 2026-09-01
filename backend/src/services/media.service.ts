import { prisma } from '../config/prisma.config';
import fs from 'fs';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.config';

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
   * PostgreSQL is the only source of truth.
   */
  static async upload(params: UploadMediaParams) {
    const { file, folder = 'General', uploadedById } = params;
    const resourceType = MediaService.determineResourceType(file.mimetype);

    let cloudUrl = '';
    let cloudinaryId = `dezoryn_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    try {
      const result = await uploadToCloudinary(getFileBuffer(file), {
        folder,
        resource_type: resourceType,
      });

      if (result && result.secure_url) {
        cloudUrl = result.secure_url;
        cloudinaryId = result.public_id || cloudinaryId;
      }
    } catch {
      // ignore cloud upload error
    }

    const localUrl = `/uploads/${file.filename || file.originalname}`;
    const finalUrl = cloudUrl || localUrl;

    const mediaData = {
      filename: file.filename || file.originalname,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      path: localUrl,
      url: finalUrl,
      folder: folder || 'General',
      cloudinaryId,
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

    if (existing.cloudinaryId) {
      await deleteFromCloudinary(existing.cloudinaryId, existing.resourceType);
    }

    const resourceType = MediaService.determineResourceType(file.mimetype);
    const folder = existing.folder || 'General';

    let cloudUrl = '';
    let cloudinaryId = `dezoryn_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    try {
      const result = await uploadToCloudinary(getFileBuffer(file), {
        folder,
        resource_type: resourceType,
      });

      if (result && result.secure_url) {
        cloudUrl = result.secure_url;
        cloudinaryId = result.public_id || cloudinaryId;
      }
    } catch {}

    const localUrl = `/uploads/${file.filename || file.originalname}`;
    const finalUrl = cloudUrl || localUrl;

    try {
      const updated = await prisma.media.update({
        where: { id },
        data: {
          filename: file.filename || file.originalname,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          path: localUrl,
          url: finalUrl,
          cloudinaryId,
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
      const existing = await MediaService.getById(id);
      if (existing?.cloudinaryId) {
        await deleteFromCloudinary(existing.cloudinaryId, existing.resourceType);
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
