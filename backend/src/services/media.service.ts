import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.config';

const prisma = new PrismaClient();
const db = prisma as any;

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

async function seedInitialMediaRaw() {
  for (const item of DEFAULT_MEDIA_ITEMS) {
    try {
      await prisma.$executeRawUnsafe(
        `INSERT INTO media (id, filename, "originalName", "mimeType", size, path, url, folder, "cloudinaryId", "resourceType", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
         ON CONFLICT (id) DO NOTHING`,
        item.id, item.filename, item.originalName, item.mimeType, item.size, item.path,
        item.url, item.folder, item.cloudinaryId, item.resourceType
      );
    } catch {
      // ignore
    }
  }
}

let hasAttemptedMediaInitialSeed = false;

export class MediaService {
  static determineResourceType(mimeType: string): 'image' | 'video' | 'raw' {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    return 'raw';
  }

  static async upload(params: UploadMediaParams) {
    const { file, folder = 'General', uploadedById } = params;

    const resourceType = MediaService.determineResourceType(file.mimetype);

    // Upload to Cloudinary
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

    // Local fallback path / URL
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
      if (db.media) {
        return await db.media.create({ data: mediaData });
      }
    } catch {
      // Fall through to raw SQL
    }

    try {
      const id = `med_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      await prisma.$executeRawUnsafe(
        `INSERT INTO media (id, filename, "originalName", "mimeType", size, path, url, folder, "cloudinaryId", "resourceType", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())`,
        id, mediaData.filename, mediaData.originalName, mediaData.mimeType, mediaData.size,
        mediaData.path, mediaData.url, mediaData.folder, mediaData.cloudinaryId, mediaData.resourceType
      );

      const rows: any = await prisma.$queryRawUnsafe('SELECT * FROM media WHERE id = $1', id);
      return rows[0] || { id, ...mediaData };
    } catch (err) {
      console.error('Error saving media to DB:', err);
      throw err;
    }
  }

  static async replace(id: string, file: Express.Multer.File) {
    const existing = await MediaService.getById(id);
    if (!existing) throw new Error('Media asset not found');

    // Delete old asset from Cloudinary if exists
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
    } catch {
      // ignore
    }

    const localUrl = `/uploads/${file.filename || file.originalname}`;
    const finalUrl = cloudUrl || localUrl;

    const updateData = {
      filename: file.filename || file.originalname,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      path: localUrl,
      url: finalUrl,
      cloudinaryId,
      resourceType,
    };

    try {
      if (db.media) {
        return await db.media.update({
          where: { id },
          data: updateData,
        });
      }
    } catch {
      // Fall through to raw SQL
    }

    await prisma.$executeRawUnsafe(
      `UPDATE media SET
        filename = $1, "originalName" = $2, "mimeType" = $3, size = $4, path = $5,
        url = $6, "cloudinaryId" = $7, "resourceType" = $8, "updatedAt" = NOW()
       WHERE id = $9`,
      updateData.filename, updateData.originalName, updateData.mimeType, updateData.size,
      updateData.path, updateData.url, updateData.cloudinaryId, updateData.resourceType, id
    );

    const rows: any = await prisma.$queryRawUnsafe('SELECT * FROM media WHERE id = $1', id);
    return rows[0];
  }

  static async delete(id: string) {
    const existing = await MediaService.getById(id);
    if (!existing) throw new Error('Media asset not found');

    if (existing.cloudinaryId) {
      await deleteFromCloudinary(existing.cloudinaryId, existing.resourceType);
    }

    try {
      if (db.media) {
        await db.media.delete({ where: { id } });
        return { success: true };
      }
    } catch {
      // Fall through
    }

    await prisma.$executeRawUnsafe('DELETE FROM media WHERE id = $1', id);
    return { success: true };
  }

  static async getById(id: string) {
    try {
      if (db.media) {
        return await db.media.findUnique({ where: { id } });
      }
    } catch {
      // Fall through
    }

    const rows: any = await prisma.$queryRawUnsafe('SELECT * FROM media WHERE id = $1', id);
    return rows ? rows[0] : null;
  }

  static async getAll(filter?: { folder?: string; search?: string; resourceType?: string }) {
    if (!hasAttemptedMediaInitialSeed) {
      hasAttemptedMediaInitialSeed = true;
      try {
        const countRes: any = await prisma.$queryRawUnsafe('SELECT COUNT(*)::int as count FROM media');
        if (countRes[0]?.count === 0) {
          await seedInitialMediaRaw();
        }
      } catch {
        // ignore
      }
    }

    try {
      if (db.media) {
        const where: any = {};
        if (filter?.folder && filter.folder !== 'All') where.folder = filter.folder;
        if (filter?.resourceType && filter.resourceType !== 'All') where.resourceType = filter.resourceType;
        if (filter?.search) {
          where.OR = [
            { filename: { contains: filter.search, mode: 'insensitive' } },
            { originalName: { contains: filter.search, mode: 'insensitive' } },
            { folder: { contains: filter.search, mode: 'insensitive' } },
          ];
        }
        return await db.media.findMany({ where, orderBy: { createdAt: 'desc' } });
      }
    } catch {
      // Fall through
    }

    try {
      let sql = 'SELECT * FROM media WHERE 1=1';
      const params: any[] = [];
      let idx = 1;

      if (filter?.folder && filter.folder !== 'All') {
        sql += ` AND LOWER(folder) = LOWER($${idx++})`;
        params.push(filter.folder);
      }

      if (filter?.resourceType && filter.resourceType !== 'All') {
        sql += ` AND LOWER("resourceType") = LOWER($${idx++})`;
        params.push(filter.resourceType);
      }

      if (filter?.search) {
        sql += ` AND (LOWER(filename) LIKE $${idx} OR LOWER("originalName") LIKE $${idx} OR LOWER(folder) LIKE $${idx})`;
        params.push(`%${filter.search.toLowerCase()}%`);
        idx++;
      }

      sql += ' ORDER BY "createdAt" DESC';

      return await prisma.$queryRawUnsafe(sql, ...params);
    } catch {
      return DEFAULT_MEDIA_ITEMS;
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
