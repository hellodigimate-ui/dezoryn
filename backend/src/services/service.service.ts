import { prisma } from '../config/prisma.config';

export interface ServiceItem {
  id?: string;
  category: string;
  badge: string;
  title: string;
  description: string;
  icon: string;
  services: any;
  ctaText: string;
  ctaLink: string;
  imageUrl?: string | null;
  order: number;
  status: string;
  isEnabled: boolean;
}

export class ServiceService {
  /**
   * GET ALL SERVICES
   * PostgreSQL is the only source of truth.
   */
  static async getAll(filter?: { category?: string; status?: string; isEnabled?: boolean; search?: string }) {
    try {
      let items = await prisma.service.findMany({
        orderBy: { order: 'asc' },
      });

      let filtered = [...items];
      if (filter?.isEnabled !== undefined) {
        filtered = filtered.filter(s => s.isEnabled === filter.isEnabled);
      }
      if (filter?.status && filter.status !== 'All') {
        filtered = filtered.filter(s => s.status === filter.status);
      }
      if (filter?.category && filter.category !== 'All') {
        filtered = filtered.filter(s => s.category === filter.category);
      }
      if (filter?.search) {
        const q = filter.search.toLowerCase();
        filtered = filtered.filter(s => s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q) || s.category.toLowerCase().includes(q));
      }

      return filtered;
    } catch (error) {
      console.error('GET SERVICES ERROR:', error);
      throw error;
    }
  }

  static async getById(id: string) {
    try {
      const item = await prisma.service.findUnique({ where: { id } });
      return item;
    } catch (error) {
      console.error(`GET SERVICE ${id} ERROR:`, error);
      throw error;
    }
  }

  static async create(data: Partial<ServiceItem>) {
    try {
      const current = await prisma.service.count();
      const newItem = await prisma.service.create({
        data: {
          category: data.category || 'General',
          badge: data.badge || '',
          title: data.title || 'New Service',
          description: data.description || '',
          icon: data.icon || 'Code2',
          services: data.services || [],
          ctaText: data.ctaText || 'Explore Services',
          ctaLink: data.ctaLink || '/contact-sales',
          imageUrl: data.imageUrl || '',
          order: data.order ?? current,
          status: data.status || 'active',
          isEnabled: data.isEnabled ?? true,
        },
      });

      return newItem;
    } catch (error) {
      console.error('CREATE SERVICE ERROR:', error);
      throw error;
    }
  }

  static async update(id: string, data: Partial<ServiceItem>) {
    try {
      const updateData: any = { ...data };
      delete updateData.id;

      if (data.status !== undefined && data.isEnabled === undefined) {
        updateData.isEnabled = data.status === 'active';
      }

      const updated = await prisma.service.update({
        where: { id },
        data: updateData,
      });

      return updated;
    } catch (error) {
      console.error(`UPDATE SERVICE ${id} ERROR:`, error);
      throw error;
    }
  }

  static async delete(id: string) {
    try {
      await prisma.service.delete({ where: { id } });
      return { success: true, deletedId: id };
    } catch (error) {
      console.error(`DELETE SERVICE ${id} ERROR:`, error);
      throw error;
    }
  }

  static async clearAll() {
    try {
      const count = await prisma.service.deleteMany({});
      return { success: true, count: count.count };
    } catch (error) {
      console.error('CLEAR ALL SERVICES ERROR:', error);
      throw error;
    }
  }

  static async toggleStatus(id: string) {
    try {
      const current = await prisma.service.findUnique({ where: { id } });
      if (!current) throw new Error('Service not found');

      const newStatus = current.status === 'active' ? 'inactive' : 'active';
      const updated = await prisma.service.update({
        where: { id },
        data: { status: newStatus, isEnabled: newStatus === 'active' },
      });

      return updated;
    } catch (error) {
      console.error(`TOGGLE SERVICE STATUS ${id} ERROR:`, error);
      throw error;
    }
  }

  static async duplicate(id: string) {
    try {
      const target = await prisma.service.findUnique({ where: { id } });
      if (!target) throw new Error('Service not found');

      const count = await prisma.service.count();
      const { id: _id, createdAt: _ca, updatedAt: _ua, ...rest } = target;

      const duplicated = await prisma.service.create({
        data: {
          ...rest,
          services: rest.services as any,
          title: `${rest.title} (Copy)`,
          order: count,
        },
      });

      return duplicated;
    } catch (error) {
      console.error(`DUPLICATE SERVICE ${id} ERROR:`, error);
      throw error;
    }
  }

  static async reorder(orderedIds: string[]) {
    try {
      await Promise.all(
        orderedIds.map((id, index) =>
          prisma.service.update({
            where: { id },
            data: { order: index },
          })
        )
      );

      return await prisma.service.findMany({ orderBy: { order: 'asc' } });
    } catch (error) {
      console.error('REORDER SERVICES ERROR:', error);
      throw error;
    }
  }
}
