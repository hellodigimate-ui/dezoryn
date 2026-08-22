import fs from 'fs';
import path from 'path';
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

const dataDir = path.resolve(process.cwd(), 'src/data');
const dataFilePath = path.join(dataDir, 'nav.json');

const ensureDataDir = () => {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

const readFileData = () => {
  try {
    ensureDataDir();
    if (fs.existsSync(dataFilePath)) {
      const raw = fs.readFileSync(dataFilePath, 'utf-8');
      const items = JSON.parse(raw);
      if (Array.isArray(items) && items.length > 0) return items;
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

export class NavService {
  public static async getAllNavItems() {
    let items = readFileData();

    if (!items) {
      try {
        const dbItems = await (prisma as any).navItem.findMany({
          orderBy: { order: 'asc' },
        });

        if (dbItems.length > 0) {
          items = dbItems;
        }
      } catch (_error) {}
    }

    if (!items || items.length === 0) {
      items = DEFAULT_NAV_ITEMS;
      writeFileData(items);
    }

    // Deduplicate by route
    const uniqueMap = new Map<string, any>();
    items.forEach((item: any) => {
      const key = (item.route || '').toLowerCase().trim();
      if (key && (!uniqueMap.has(key) || item.id.startsWith('nav-'))) {
        uniqueMap.set(key, item);
      }
    });

    const result = Array.from(uniqueMap.values()).sort((a: any, b: any) => a.order - b.order);
    return result;
  }

  public static async resetToDefaults() {
    writeFileData(DEFAULT_NAV_ITEMS);
    try {
      await (prisma as any).navItem.deleteMany({});
      for (const item of DEFAULT_NAV_ITEMS) {
        await (prisma as any).navItem.create({ data: item });
      }
    } catch (_err) {}
    return DEFAULT_NAV_ITEMS;
  }

  public static async createNavItem(data: { label: string; route: string; isVisible?: boolean; isHighlight?: boolean }) {
    const current = await NavService.getAllNavItems();
    const newItem = {
      id: `nav-${Date.now()}`,
      label: data.label,
      route: data.route,
      order: current.length,
      isVisible: data.isVisible ?? true,
      isHighlight: data.isHighlight ?? false,
    };
    const updated = [...current, newItem];
    writeFileData(updated);

    try {
      await (prisma as any).navItem.create({
        data: {
          id: newItem.id,
          label: newItem.label,
          route: newItem.route,
          order: newItem.order,
          isVisible: newItem.isVisible,
          isHighlight: newItem.isHighlight,
        },
      });
    } catch (_err) {}

    return newItem;
  }

  public static async updateNavItem(
    id: string,
    data: { label?: string; route?: string; isVisible?: boolean; isHighlight?: boolean; order?: number }
  ) {
    const current = await NavService.getAllNavItems();
    let updatedItem: any = null;
    const updatedList = current.map((item: any) => {
      if (item.id === id) {
        updatedItem = { ...item, ...data };
        return updatedItem;
      }
      return item;
    });

    writeFileData(updatedList);

    try {
      await (prisma as any).navItem.update({
        where: { id },
        data,
      });
    } catch (_err) {}

    return updatedItem || { id, ...data };
  }

  public static async deleteNavItem(id: string) {
    const current = await NavService.getAllNavItems();
    const updatedList = current.filter((item: any) => item.id !== id);
    writeFileData(updatedList);

    try {
      await (prisma as any).navItem.delete({ where: { id } });
    } catch (_err) {}

    return { id, success: true };
  }

  public static async reorderNavItems(orderedIds: string[]) {
    const current = await NavService.getAllNavItems();
    const map = new Map(current.map((item: any) => [item.id, item]));
    const updatedList = orderedIds
      .map((id, index) => {
        const item = map.get(id);
        return item ? { ...item, order: index } : null;
      })
      .filter(Boolean);

    writeFileData(updatedList);

    try {
      const updates = orderedIds.map((id, index) =>
        (prisma as any).navItem.update({
          where: { id },
          data: { order: index },
        })
      );
      await Promise.all(updates);
    } catch (_err) {}

    return updatedList;
  }

  public static async toggleVisibility(id: string) {
    const current = await NavService.getAllNavItems();
    let toggledItem: any = null;
    const updatedList = current.map((item: any) => {
      if (item.id === id) {
        toggledItem = { ...item, isVisible: !item.isVisible };
        return toggledItem;
      }
      return item;
    });

    writeFileData(updatedList);

    try {
      if (toggledItem) {
        await (prisma as any).navItem.update({
          where: { id },
          data: { isVisible: toggledItem.isVisible },
        });
      }
    } catch (_err) {}

    return toggledItem;
  }
}

