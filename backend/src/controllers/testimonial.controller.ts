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
    const ext = path.extname(file.originalname) || '.jpg';
    const cleanName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `testimonial-${Date.now()}-${cleanName}${ext}`);
  },
});

export const uploadPhoto = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowedExts = /jpeg|jpg|png|gif|webp|svg|bmp|avif/i;
    const extname = allowedExts.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedExts.test(file.mimetype) || file.mimetype.startsWith('image/');
    if (extname || mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only image files (JPG, PNG, WebP, GIF, SVG) are allowed!'));
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
      if (!item) { res.status(404).json({ success: false, message: 'Testimonial not found' }); return; }
      res.status(200).json({ success: true, data: item });
    } catch (err) { next(err); }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, company, designation, review, rating, order, isEnabled } = req.body;
      if (!name || !String(name).trim() || !review || !String(review).trim()) {
        res.status(400).json({ success: false, message: 'Customer Name and Review are required.' });
        return;
      }

      let photo: string | null = null;
      if (req.file) {
        photo = `/uploads/testimonials/${req.file.filename}`;
      } else if (req.body.photo && typeof req.body.photo === 'string' && req.body.photo.trim()) {
        photo = req.body.photo.trim();
      }

      const parsedRating = rating !== undefined ? parseInt(String(rating), 10) : 5;
      const parsedOrder = order !== undefined && order !== '' ? parseInt(String(order), 10) : undefined;
      const parsedIsEnabled = isEnabled !== undefined ? (String(isEnabled) === 'true' || isEnabled === true) : true;

      const item = await TestimonialService.create({
        name: String(name).trim(),
        company: company ? String(company).trim() : '',
        designation: designation ? String(designation).trim() : '',
        review: String(review).trim(),
        rating: isNaN(parsedRating) ? 5 : Math.min(5, Math.max(1, parsedRating)),
        order: parsedOrder !== undefined && !isNaN(parsedOrder) ? parsedOrder : undefined,
        isEnabled: parsedIsEnabled,
        photo,
      });

      res.status(201).json({ success: true, message: 'Testimonial created successfully.', data: item });
    } catch (err) { next(err); }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, company, designation, review, rating, order, isEnabled } = req.body;

      const updateData: any = {};
      if (name !== undefined) updateData.name = String(name).trim();
      if (company !== undefined) updateData.company = String(company).trim();
      if (designation !== undefined) updateData.designation = String(designation).trim();
      if (review !== undefined) updateData.review = String(review).trim();
      
      if (rating !== undefined && rating !== '') {
        const parsedRating = parseInt(String(rating), 10);
        updateData.rating = isNaN(parsedRating) ? 5 : Math.min(5, Math.max(1, parsedRating));
      }
      
      if (order !== undefined && order !== '') {
        const parsedOrder = parseInt(String(order), 10);
        updateData.order = isNaN(parsedOrder) ? 0 : parsedOrder;
      }
      
      if (isEnabled !== undefined) {
        updateData.isEnabled = String(isEnabled) === 'true' || isEnabled === true;
      }

      if (req.file) {
        updateData.photo = `/uploads/testimonials/${req.file.filename}`;
      } else if (req.body.photo !== undefined) {
        updateData.photo = req.body.photo && String(req.body.photo).trim() ? String(req.body.photo).trim() : null;
      }

      const item = await TestimonialService.update(req.params.id, updateData);
      res.status(200).json({ success: true, message: 'Testimonial updated successfully.', data: item });
    } catch (err) { next(err); }
  }

  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await TestimonialService.delete(req.params.id);
      res.status(200).json({ success: true, message: 'Testimonial deleted successfully.' });
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
        res.status(400).json({ success: false, message: 'orderedIds must be an array of IDs.' });
        return;
      }
      const items = await TestimonialService.reorder(orderedIds);
      res.status(200).json({ success: true, message: 'Testimonials reordered successfully.', data: items });
    } catch (err) { next(err); }
  }
}

