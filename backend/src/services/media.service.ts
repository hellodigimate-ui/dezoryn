import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.config';

const prisma = new PrismaClient();
const db = prisma as any;

const dataDir = path.resolve(process.cwd(), 'src/data');
const dataFilePath = path.join(dataDir, 'media.json');

const ensureDataDir = () => {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

const readFileData = (): any[] | null => {
  try {
    ensureDataDir();
    if (fs.existsSync(dataFilePath)) {
      const raw = fs.readFileSync(dataFilePath, 'utf-8');
      const items = JSON.parse(raw);
      if (Array.isArray(items)) return items;
    }
  } catch (_e) {}
  return null;
};

const writeFileData = (data: any[]) => {
  try {
    ensureDataDir();
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (_e) {}
};

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
    createdAt: new Date().toISOString(),
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
    createdAt: new Date().toISOString(),
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
    createdAt: new Date().toISOString(),
  },
];

export class MediaService {
  static determineResourceType(mimeType: string): 'image' | 'video' | 'raw' {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    return 'raw';
  }

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
    const id = `med_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    const mediaData = {
      id,
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 1. Save to disk JSON store
    const currentList = (readFileData() || DEFAULT_MEDIA_ITEMS);
    const updatedList = [mediaData, ...currentList];
    writeFileData(updatedList);

    // 2. Try DB
    try {
      if (db.media) {
        return await db.media.create({ data: mediaData });
      }
    } catch {}

    try {
      await prisma.$executeRawUnsafe(
        `INSERT INTO media (id, filename, "originalName", "mimeType", size, path, url, folder, "cloudinaryId", "resourceType", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())`,
        id, mediaData.filename, mediaData.originalName, mediaData.mimeType, mediaData.size,
        mediaData.path, mediaData.url, mediaData.folder, mediaData.cloudinaryId, mediaData.resourceType
      );
    } catch (_err) {}

    return mediaData;
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

    const updateData = {
      ...existing,
      filename: file.filename || file.originalname,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      path: localUrl,
      url: finalUrl,
      cloudinaryId,
      resourceType,
      updatedAt: new Date().toISOString(),
    };

    // 1. Write to disk JSON
    const currentList = (readFileData() || DEFAULT_MEDIA_ITEMS);
    const updatedList = currentList.map(item => item.id === id ? updateData : item);
    writeFileData(updatedList);

    // 2. Try DB
    try {
      if (db.media) {
        await db.media.update({ where: { id }, data: updateData });
      }
    } catch {}

    try {
      await prisma.$executeRawUnsafe(
        `UPDATE media SET
          filename = $1, "originalName" = $2, "mimeType" = $3, size = $4, path = $5,
          url = $6, "cloudinaryId" = $7, "resourceType" = $8, "updatedAt" = NOW()
         WHERE id = $9`,
        updateData.filename, updateData.originalName, updateData.mimeType, updateData.size,
        updateData.path, updateData.url, updateData.cloudinaryId, updateData.resourceType, id
      );
    } catch {}

    return updateData;
  }

  static async delete(id: string) {
    const existing = await MediaService.getById(id);
    if (existing?.cloudinaryId) {
      await deleteFromCloudinary(existing.cloudinaryId, existing.resourceType);
    }

    // Write to disk JSON
    const currentList = (readFileData() || DEFAULT_MEDIA_ITEMS);
    const updatedList = currentList.filter(item => item.id !== id);
    writeFileData(updatedList);

    try {
      if (db.media) {
        await db.media.delete({ where: { id } });
      }
    } catch {}

    try {
      await prisma.$executeRawUnsafe('DELETE FROM media WHERE id = $1', id);
    } catch {}

    return { success: true };
  }

  static async getById(id: string) {
    const currentList = readFileData() || DEFAULT_MEDIA_ITEMS;
    const found = currentList.find(item => item.id === id);
    if (found) return found;

    try {
      if (db.media) {
        return await db.media.findUnique({ where: { id } });
      }
    } catch {}

    try {
      const rows: any = await prisma.$queryRawUnsafe('SELECT * FROM media WHERE id = $1', id);
      return rows ? rows[0] : null;
    } catch {
      return null;
    }
  }

  static async getAll(filter?: { folder?: string; search?: string; resourceType?: string }) {
    let items = readFileData();
    if (!items) {
      try {
        if (db.media) {
          items = await db.media.findMany({ orderBy: { createdAt: 'desc' } });
        }
      } catch {}

      if (!items) {
        try {
          items = await prisma.$queryRawUnsafe('SELECT * FROM media ORDER BY "createdAt" DESC');
        } catch {}
      }

      if (!items || items.length === 0) {
        items = DEFAULT_MEDIA_ITEMS;
      }
      writeFileData(items);
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

