import { prisma } from '../config/prisma.config';

export const DEFAULT_NAV_ITEMS = [
  { label: 'Home', route: '/', order: 0, isVisible: true, isHighlight: false },
  { label: 'Ecosystem', route: '/products', order: 1, isVisible: true, isHighlight: false },
  { label: 'Marketplace', route: '/marketplace', order: 2, isVisible: true, isHighlight: false },
  { label: 'Services', route: '/services', order: 3, isVisible: true, isHighlight: false },
  { label: 'Careers', route: '/careers', order: 4, isVisible: true, isHighlight: false },
  { label: 'Pricing', route: '/pricing', order: 5, isVisible: true, isHighlight: false },
  { label: 'About Us', route: '/about', order: 6, isVisible: true, isHighlight: false },
  { label: 'Contact', route: '/contact-sales', order: 7, isVisible: true, isHighlight: false },
];

export class NavService {
  public static async getAllNavItems() {
    try {
      const items = await (prisma as any).navItem.findMany({
        orderBy: { order: 'asc' },
      });

      if (items.length === 0) {
        // Seed defaults if table is empty
        await (prisma as any).navItem.createMany({
          data: DEFAULT_NAV_ITEMS,
        });
        const fresh = await (prisma as any).navItem.findMany({ orderBy: { order: 'asc' } });
        return fresh.map((i: any) => i.label === 'Contact Sales' ? { ...i, label: 'Contact' } : i);
      }

      // Deduplicate items by route
      const uniqueMap = new Map<string, any>();
      for (const item of items) {
        const key = item.route.toLowerCase();
        if (!uniqueMap.has(key)) {
          uniqueMap.set(key, item);
        }
      }
      if (!uniqueMap.has('/products')) {
        uniqueMap.set('/products', { id: 'products-nav', label: 'Ecosystem', route: '/products', order: 1, isVisible: true, isHighlight: false });
      }
      if (!uniqueMap.has('/services')) {
        uniqueMap.set('/services', { id: 'services-nav', label: 'Services', route: '/services', order: 3, isVisible: true, isHighlight: false });
      }
      const uniqueItems = Array.from(uniqueMap.values());

      return uniqueItems
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((i: any) => i.label === 'Contact Sales' || i.label === 'Contact Sales Team' ? { ...i, label: 'Contact' } : i);
    } catch (_error) {
      return DEFAULT_NAV_ITEMS.map((item, idx) => ({ id: String(idx), ...item }));
    }
  }

  public static async createNavItem(data: { label: string; route: string; isVisible?: boolean; isHighlight?: boolean }) {
    const count = await (prisma as any).navItem.count();
    return (prisma as any).navItem.create({
      data: {
        label: data.label,
        route: data.route,
        order: count,
        isVisible: data.isVisible ?? true,
        isHighlight: data.isHighlight ?? false,
      },
    });
  }

  public static async updateNavItem(
    id: string,
    data: { label?: string; route?: string; isVisible?: boolean; isHighlight?: boolean; order?: number }
  ) {
    return (prisma as any).navItem.update({
      where: { id },
      data,
    });
  }

  public static async deleteNavItem(id: string) {
    return (prisma as any).navItem.delete({ where: { id } });
  }

  public static async reorderNavItems(orderedIds: string[]) {
    const updates = orderedIds.map((id, index) =>
      (prisma as any).navItem.update({
        where: { id },
        data: { order: index },
      })
    );
    await Promise.all(updates);
    return (prisma as any).navItem.findMany({ orderBy: { order: 'asc' } });
  }

  public static async toggleVisibility(id: string) {
    const item = await (prisma as any).navItem.findUnique({ where: { id } });
    return (prisma as any).navItem.update({
      where: { id },
      data: { isVisible: !item.isVisible },
    });
  }
}
