import { prisma } from '../config/prisma.config';
import path from 'path';
import fs from 'fs';

const db = prisma as any;

const DEFAULTS = [
  {
    name: 'James Whitfield',
    company: 'NovaTech Solutions',
    designation: 'VP of Sales',
    review: 'Dezoryn completely transformed how our sales team operates. Lead scoring accuracy jumped to 94% and we closed 3.4x more deals within the first quarter.',
    rating: 5,
    photo: null,
    order: 0,
    isEnabled: true,
  },
  {
    name: 'Priya Mehta',
    company: 'Horizon Retail Group',
    designation: 'Chief Revenue Officer',
    review: 'The automated cadence engine saved each rep 18 hours per week. Our reply rates went from 4% to 19% in 6 weeks. I wish we had switched sooner.',
    rating: 5,
    photo: null,
    order: 1,
    isEnabled: true,
  },
  {
    name: 'Oliver Strauss',
    company: 'Alpine Manufacturing GmbH',
    designation: 'Head of Business Development',
    review: 'Pipeline visibility is incredible. Real-time revenue forecasting with 91% accuracy means our board presentations are now data-driven instead of gut-feel.',
    rating: 5,
    photo: null,
    order: 2,
    isEnabled: true,
  },
];

export class TestimonialService {
  static async getAll(onlyEnabled = false) {
    try {
      const where = onlyEnabled ? { isEnabled: true } : {};
      const items = await db.testimonial.findMany({ where, orderBy: { order: 'asc' } });
      if (items.length === 0) {
        await db.testimonial.createMany({ data: DEFAULTS });
        return db.testimonial.findMany({ orderBy: { order: 'asc' } });
      }
      return items;
    } catch { return []; }
  }

  static async getById(id: string) {
    return db.testimonial.findUnique({ where: { id } });
  }

  static async create(data: {
    name: string; company?: string; designation?: string; review: string;
    rating?: number; photo?: string; order?: number; isEnabled?: boolean;
  }) {
    const count = await db.testimonial.count();
    return db.testimonial.create({
      data: {
        name: data.name,
        company: data.company || '',
        designation: data.designation || '',
        review: data.review,
        rating: Math.min(5, Math.max(1, data.rating ?? 5)),
        photo: data.photo || null,
        order: data.order ?? count,
        isEnabled: data.isEnabled ?? true,
      },
    });
  }

  static async update(id: string, data: Partial<{
    name: string; company: string; designation: string; review: string;
    rating: number; photo: string; order: number; isEnabled: boolean;
  }>) {
    return db.testimonial.update({ where: { id }, data });
  }

  static async delete(id: string) {
    // Delete associated photo file if local
    const item = await db.testimonial.findUnique({ where: { id } });
    if (item?.photo && item.photo.startsWith('/uploads/')) {
      const filePath = path.join(process.cwd(), 'public', item.photo);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    return db.testimonial.delete({ where: { id } });
  }

  static async toggleEnabled(id: string) {
    const item = await db.testimonial.findUnique({ where: { id } });
    return db.testimonial.update({ where: { id }, data: { isEnabled: !item.isEnabled } });
  }

  static async reorder(orderedIds: string[]) {
    await Promise.all(
      orderedIds.map((id, index) => db.testimonial.update({ where: { id }, data: { order: index } }))
    );
    return db.testimonial.findMany({ orderBy: { order: 'asc' } });
  }
}
