import { prisma } from '../config/prisma.config';

export const DEFAULT_NAV_ITEMS = [
  { id: 'nav-1', label: 'Home', route: '/', order: 0, isVisible: true, isHighlight: false },
  { id: 'nav-2', label: 'Ecosystem', route: '/products', order: 1, isVisible: true, isHighlight: false },
  { id: 'nav-3', label: 'Marketplace', route: '/marketplace', order: 2, isVisible: true, isHighlight: false },
  { id: 'nav-4', label: 'Services', route: '/services', order: 3, isVisible: true, isHighlight: false },
  { id: 'nav-5', label: 'Careers', route: '/careers', order: 4, isVisible: true, isHighlight: false },
  { id: 'nav-6', label: 'Pricing', route: '/pricing', order: 5, isVisible: true, isHighlight: false },
  { id: 'nav-7', label: 'About Us', route: '/about', order: 6, isVisible: true, isHighlight: false },
  { id: 'nav-8', label: 'Contact', route: '/contact-sales', order: 7, isVisible: true, isHighlight: false },
];

export class NavService {
  /**
   * GET ALL NAV ITEMS
   * PostgreSQL is the only source of truth.
   */
  public static async getAllNavItems() {
    try {
      let dbItems = await prisma.navItem.findMany({
        orderBy: { order: 'asc' },
      });

      if (!dbItems || dbItems.length === 0) {
        await prisma.navItem.createMany({
          data: DEFAULT_NAV_ITEMS,
        });
        dbItems = await prisma.navItem.findMany({
          orderBy: { order: 'asc' },
        });
      }

      return dbItems;
    } catch (error) {
      console.error('GET NAV ITEMS ERROR:', error);
      throw error;
    }
  }

  public static async resetToDefaults() {
    try {
      await prisma.navItem.deleteMany({});
      for (const item of DEFAULT_NAV_ITEMS) {
        await prisma.navItem.create({ data: item });
      }
      return await prisma.navItem.findMany({ orderBy: { order: 'asc' } });
    } catch (error) {
      console.error('RESET NAV ITEMS ERROR:', error);
      throw error;
    }
  }

  public static async createNavItem(data: { label: string; route: string; isVisible?: boolean; isHighlight?: boolean }) {
    try {
      const current = await NavService.getAllNavItems();
      const newItem = await prisma.navItem.create({
        data: {
          label: data.label,
          route: data.route,
          order: current.length,
          isVisible: data.isVisible ?? true,
          isHighlight: data.isHighlight ?? false,
        },
      });

      return newItem;
    } catch (error) {
      console.error('CREATE NAV ITEM ERROR:', error);
      throw error;
    }
  }

  public static async updateNavItem(
    id: string,
    data: { label?: string; route?: string; isVisible?: boolean; isHighlight?: boolean; order?: number }
  ) {
    try {
      const updated = await prisma.navItem.update({
        where: { id },
        data,
      });

      return updated;
    } catch (error) {
      console.error('UPDATE NAV ITEM ERROR:', error);
      throw error;
    }
  }

  public static async deleteNavItem(id: string) {
    try {
      await prisma.navItem.delete({ where: { id } });
      return { id, success: true };
    } catch (error) {
      console.error('DELETE NAV ITEM ERROR:', error);
      throw error;
    }
  }

  public static async reorderNavItems(orderedIds: string[]) {
    try {
      const updates = orderedIds.map((id, index) =>
        prisma.navItem.update({
          where: { id },
          data: { order: index },
        })
      );
      await Promise.all(updates);

      return await prisma.navItem.findMany({ orderBy: { order: 'asc' } });
    } catch (error) {
      console.error('REORDER NAV ITEMS ERROR:', error);
      throw error;
    }
  }

  public static async toggleVisibility(id: string) {
    try {
      const currentItem = await prisma.navItem.findUnique({ where: { id } });
      if (!currentItem) throw new Error('Nav item not found');

      const updated = await prisma.navItem.update({
        where: { id },
        data: { isVisible: !currentItem.isVisible },
      });

      return updated;
    } catch (error) {
      console.error('TOGGLE NAV VISIBILITY ERROR:', error);
      throw error;
    }
  }
}
