import { Request, Response, NextFunction } from 'express';
import { TestimonialService } from '../services/testimonial.service';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// ── Multer config for testimonial photos ──
const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'testimonials');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `testimonial-${Date.now()}${ext}`);
  },
});

export const uploadPhoto = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    cb(null, allowed.test(file.mimetype));
  },
}).single('photo');

export class TestimonialController {
  static async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const onlyEnabled = req.query.enabled === 'true';
      const items = await TestimonialService.getAll(onlyEnabled);
      res.status(200).json({ success: true, data: items });
    } catch (err) { next(err); }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const item = await TestimonialService.getById(req.params.id);
      if (!item) { res.status(404).json({ success: false, message: 'Not found' }); return; }
      res.status(200).json({ success: true, data: item });
    } catch (err) { next(err); }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, review } = req.body;
      if (!name || !review) {
        res.status(400).json({ success: false, message: 'name and review are required' });
        return;
      }
      const photo = req.file
        ? `/uploads/testimonials/${req.file.filename}`
        : req.body.photo || null;
      const item = await TestimonialService.create({ ...req.body, photo });
      res.status(201).json({ success: true, data: item });
    } catch (err) { next(err); }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const photo = req.file
        ? `/uploads/testimonials/${req.file.filename}`
        : undefined;
      const updateData = { ...req.body, ...(photo ? { photo } : {}) };
      const item = await TestimonialService.update(req.params.id, updateData);
      res.status(200).json({ success: true, data: item });
    } catch (err) { next(err); }
  }

  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await TestimonialService.delete(req.params.id);
      res.status(200).json({ success: true, message: 'Testimonial deleted' });
    } catch (err) { next(err); }
  }

  static async toggleEnabled(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const item = await TestimonialService.toggleEnabled(req.params.id);
      res.status(200).json({ success: true, data: item });
    } catch (err) { next(err); }
  }

  static async reorder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orderedIds } = req.body;
      if (!Array.isArray(orderedIds)) {
        res.status(400).json({ success: false, message: 'orderedIds must be an array' });
        return;
      }
      const items = await TestimonialService.reorder(orderedIds);
      res.status(200).json({ success: true, data: items });
    } catch (err) { next(err); }
  }
}
