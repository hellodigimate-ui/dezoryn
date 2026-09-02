import { prisma } from '../config/prisma.config';
import path from 'path';
import fs from 'fs';

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
  /**
   * GET ALL TESTIMONIALS
   * PostgreSQL is the only source of truth.
   */
  static async getAll(onlyEnabled = false) {
    try {
      const where = onlyEnabled ? { isEnabled: true } : {};
      const items = await prisma.testimonial.findMany({ where, orderBy: { order: 'asc' } });
      return items;
    } catch (error) {
      console.error('GET TESTIMONIALS ERROR:', error);
      throw error;
    }
  }

  static async getById(id: string) {
    try {
      const item = await prisma.testimonial.findUnique({ where: { id } });
      return item;
    } catch (error) {
      console.error(`GET TESTIMONIAL ${id} ERROR:`, error);
      throw error;
    }
  }

  static async create(data: {
    name: string; company?: string; designation?: string; review: string;
    rating?: number; photo?: string | null; order?: number; isEnabled?: boolean;
  }) {
    try {
      const count = await prisma.testimonial.count();
      const rating = typeof data.rating === 'number' && !isNaN(data.rating)
        ? Math.min(5, Math.max(1, data.rating))
        : 5;
      const order = typeof data.order === 'number' && !isNaN(data.order)
        ? data.order
        : count;
      const isEnabled = typeof data.isEnabled === 'boolean'
        ? data.isEnabled
        : true;

      const created = await prisma.testimonial.create({
        data: {
          name: data.name,
          company: data.company || '',
          designation: data.designation || '',
          review: data.review,
          rating,
          photo: data.photo || null,
          order,
          isEnabled,
        },
      });
      return created;
    } catch (error) {
      console.error('CREATE TESTIMONIAL ERROR:', error);
      throw error;
    }
  }

  static async update(id: string, data: Partial<{
    name: string; company: string; designation: string; review: string;
    rating: number; photo: string | null; order: number; isEnabled: boolean;
  }>) {
    try {
      if (data.photo !== undefined && data.photo !== null) {
        const existing = await prisma.testimonial.findUnique({ where: { id } });
        if (existing?.photo && existing.photo !== data.photo && existing.photo.startsWith('/uploads/')) {
          const oldPath = path.join(process.cwd(), 'public', existing.photo);
          if (fs.existsSync(oldPath)) {
            try { fs.unlinkSync(oldPath); } catch {}
          }
        }
      }

      const updatePayload: any = {};
      if (data.name !== undefined) updatePayload.name = data.name;
      if (data.company !== undefined) updatePayload.company = data.company;
      if (data.designation !== undefined) updatePayload.designation = data.designation;
      if (data.review !== undefined) updatePayload.review = data.review;
      if (data.rating !== undefined) {
        updatePayload.rating = Math.min(5, Math.max(1, data.rating));
      }
      if (data.order !== undefined) updatePayload.order = data.order;
      if (data.isEnabled !== undefined) updatePayload.isEnabled = data.isEnabled;
      if (data.photo !== undefined) updatePayload.photo = data.photo;

      const updated = await prisma.testimonial.update({
        where: { id },
        data: updatePayload,
      });
      return updated;
    } catch (error) {
      console.error(`UPDATE TESTIMONIAL ${id} ERROR:`, error);
      throw error;
    }
  }

  static async delete(id: string) {
    try {
      const item = await prisma.testimonial.findUnique({ where: { id } });
      if (item?.photo && item.photo.startsWith('/uploads/')) {
        const filePath = path.join(process.cwd(), 'public', item.photo);
        if (fs.existsSync(filePath)) {
          try { fs.unlinkSync(filePath); } catch {}
        }
      }
      await prisma.testimonial.delete({ where: { id } });
      return { success: true, deletedId: id };
    } catch (error) {
      console.error(`DELETE TESTIMONIAL ${id} ERROR:`, error);
      throw error;
    }
  }

  static async toggleEnabled(id: string) {
    try {
      const item = await prisma.testimonial.findUnique({ where: { id } });
      if (!item) throw new Error('Testimonial not found');

      const updated = await prisma.testimonial.update({ where: { id }, data: { isEnabled: !item.isEnabled } });
      return updated;
    } catch (error) {
      console.error(`TOGGLE TESTIMONIAL ENABLED ${id} ERROR:`, error);
      throw error;
    }
  }

  static async reorder(orderedIds: string[]) {
    try {
      await Promise.all(
        orderedIds.map((id, index) => prisma.testimonial.update({ where: { id }, data: { order: index } }))
      );
      return await prisma.testimonial.findMany({ orderBy: { order: 'asc' } });
    } catch (error) {
      console.error('REORDER TESTIMONIALS ERROR:', error);
      throw error;
    }
  }
}
