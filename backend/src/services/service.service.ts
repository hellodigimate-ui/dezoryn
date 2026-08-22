import fs from 'fs';
import path from 'path';
import { prisma } from '../config/prisma.config';

const db = prisma as any;

const dataDir = path.resolve(process.cwd(), 'src/data');
const dataFilePath = path.join(dataDir, 'services.json');

const ensureDataDir = () => {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

const readFileData = (): ServiceItem[] | null => {
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

const writeFileData = (data: ServiceItem[]) => {
  try {
    ensureDataDir();
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (_e) {}
};

export interface ServiceItem {
  id?: string;
  category: string;
  badge: string;
  title: string;
  description: string;
  icon: string;
  services: string[];
  ctaText: string;
  ctaLink: string;
  order: number;
  status: string;
  isEnabled: boolean;
}

const DEFAULT_SERVICES: ServiceItem[] = [
  {
    category: 'Software Development',
    badge: 'ENTERPRISE ARCHITECTURE',
    title: 'Software Development',
    description: 'Custom enterprise software solutions tailored to automate complex workflows, enhance operational efficiency, and scale seamlessly with your business growth.',
    icon: 'Code2',
    services: [
      'Custom Software Development',
      'CRM Development',
      'ERP Development',
      'Business Management Software',
      'SaaS Development',
      'Software Customization'
    ],
    ctaText: 'Explore Software Services',
    ctaLink: '/contact-sales',
    order: 0,
    status: 'active',
    isEnabled: true
  },
  {
    category: 'Website Development',
    badge: 'WEB PLATFORMS',
    title: 'Website Development',
    description: 'Modern, high-performance websites and web applications built with intuitive UI/UX, ultra-fast loading speeds, and bank-grade security protocols.',
    icon: 'Globe',
    services: [
      'Business Website',
      'Corporate Website',
      'E-commerce Website',
      'Custom Web Application',
      'Landing Page',
      'Portal Development'
    ],
    ctaText: 'Explore Web Services',
    ctaLink: '/contact-sales',
    order: 1,
    status: 'active',
    isEnabled: true
  },
  {
    category: 'Mobile App Development',
    badge: 'IOS & ANDROID',
    title: 'Mobile App Development',
    description: 'Native and cross-platform mobile apps for iOS and Android delivering engaging user experiences, offline capabilities, and real-time data sync.',
    icon: 'Smartphone',
    services: [
      'Android App',
      'iOS App',
      'Cross-Platform App',
      'Customer Apps',
      'Employee Apps',
      'Admin Apps'
    ],
    ctaText: 'Explore Mobile Services',
    ctaLink: '/contact-sales',
    order: 2,
    status: 'active',
    isEnabled: true
  },
  {
    category: 'Business Management Solutions',
    badge: 'AUTOMATION SUITE',
    title: 'Business Management Solutions',
    description: 'Integrated business automation platforms covering HRMS, automated payroll, inventory management, billing, and complete operational control.',
    icon: 'Briefcase',
    services: [
      'CRM',
      'HRM & Payroll',
      'ERP',
      'Billing & Accounting',
      'Inventory Management',
      'Customer Management',
      'Employee Management',
      'Reporting & Analytics'
    ],
    ctaText: 'Explore Business Solutions',
    ctaLink: '/contact-sales',
    order: 3,
    status: 'active',
    isEnabled: true
  },
  {
    category: 'Industry-Specific Solutions',
    badge: 'TURNKEY VERTICALS',
    title: 'Industry-Specific Solutions',
    description: 'Specialized turnkey software suites customized for healthcare, education, real estate, retail, manufacturing, and logistics domains.',
    icon: 'Factory',
    services: [
      'School Management',
      'Hospital Management',
      'Property Management',
      'Society Management',
      'Restaurant Management',
      'Hotel Management',
      'Retail Management',
      'Logistics Management',
      'Real Estate Solutions',
      'Other Industry Solutions'
    ],
    ctaText: 'Explore Industry Solutions',
    ctaLink: '/contact-sales',
    order: 4,
    status: 'active',
    isEnabled: true
  },
  {
    category: 'API & Integration Services',
    badge: 'CONNECTIVITY & SYNC',
    title: 'API & Integration Services',
    description: 'Seamless RESTful & GraphQL API integration, microservices architecture, webhooks, and multi-tenant SaaS ecosystem connectivity.',
    icon: 'Layers',
    services: [
      'Meta Lead Integration',
      'WhatsApp Integration',
      'Payment Gateway',
      'Google Services',
      'CRM Integration',
      'API Development',
      'Third-Party Integration'
    ],
    ctaText: 'Explore API Services',
    ctaLink: '/contact-sales',
    order: 5,
    status: 'active',
    isEnabled: true
  },
  {
    category: 'Digital Marketing',
    badge: 'GROWTH & LEADS',
    title: 'Digital Marketing',
    description: 'Data-driven digital marketing campaigns engineered to expand brand visibility, generate high-intent enterprise leads, and maximize ROI.',
    icon: 'Megaphone',
    services: [
      'Social Media Marketing',
      'Meta Ads',
      'Google Ads',
      'Lead Generation',
      'Content Marketing',
      'Campaign Management'
    ],
    ctaText: 'Explore Digital Marketing',
    ctaLink: '/contact-sales',
    order: 6,
    status: 'active',
    isEnabled: true
  },
  {
    category: 'SEO Services',
    badge: 'ORGANIC RANKINGS',
    title: 'SEO Services',
    description: 'Comprehensive Search Engine Optimization (SEO) strategies to rank #1 on Google, capture high-converting organic search traffic, and build domain authority.',
    icon: 'TrendingUp',
    services: [
      'Website SEO',
      'Local SEO',
      'Technical SEO',
      'Keyword Research',
      'On-Page SEO',
      'SEO Audit'
    ],
    ctaText: 'Explore SEO Services',
    ctaLink: '/contact-sales',
    order: 7,
    status: 'active',
    isEnabled: true
  }
];

let memoryServicesStore: ServiceItem[] = DEFAULT_SERVICES.map((s, idx) => ({ ...s, id: `service-${idx + 1}` }));
let hasAttemptedSeed = false;

export class ServiceService {
  static async getAll(filter?: { category?: string; status?: string; isEnabled?: boolean; search?: string }) {
    let items = readFileData();

    if (!items) {
      try {
        if (db.service) {
          const dbItems = await db.service.findMany({ orderBy: { order: 'asc' } });
          if (dbItems && dbItems.length > 0) {
            items = dbItems;
          }
        }
      } catch (_err) {}

      if (!items || items.length === 0) {
        items = DEFAULT_SERVICES.map((s, idx) => ({ ...s, id: `service-${idx + 1}` }));
      }
      writeFileData(items);
    }

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
    return filtered.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }

  static async getById(id: string) {
    const items = await ServiceService.getAll();
    return items.find(s => s.id === id) || null;
  }

  static async create(data: Partial<ServiceItem>) {
    const current = await ServiceService.getAll();
    const newItem: ServiceItem = {
      id: `service-${Date.now()}`,
      category: data.category || 'General',
      badge: data.badge || '',
      title: data.title || 'New Service',
      description: data.description || '',
      icon: data.icon || 'Code2',
      services: data.services || [],
      ctaText: data.ctaText || 'Explore Services',
      ctaLink: data.ctaLink || '/contact-sales',
      order: data.order ?? current.length,
      status: data.status || 'active',
      isEnabled: data.isEnabled ?? true,
    };

    const updated = [...current, newItem];
    writeFileData(updated);

    try {
      if (db.service) {
        await db.service.create({ data: newItem });
      }
    } catch (_e) {}

    return newItem;
  }

  static async update(id: string, data: Partial<ServiceItem>) {
    const current = await ServiceService.getAll();
    let updatedItem: any = null;

    const updatedList = current.map(item => {
      if (item.id === id) {
        updatedItem = { ...item, ...data };
        if (data.status !== undefined && data.isEnabled === undefined) {
          updatedItem.isEnabled = data.status === 'active';
        }
        return updatedItem;
      }
      return item;
    });

    if (!updatedItem) {
      updatedItem = {
        id,
        category: data.category || 'General',
        badge: data.badge || '',
        title: data.title || 'Service',
        description: data.description || '',
        icon: data.icon || 'Code2',
        services: data.services || [],
        ctaText: data.ctaText || 'Explore Services',
        ctaLink: data.ctaLink || '/contact-sales',
        order: data.order ?? 0,
        status: data.status || 'active',
        isEnabled: data.isEnabled ?? true,
      };
      updatedList.push(updatedItem);
    }

    writeFileData(updatedList);

    try {
      if (db.service) {
        const updateData: any = { ...data };
        delete updateData.id;
        await db.service.upsert({
          where: { id },
          update: updateData,
          create: updatedItem,
        });
      }
    } catch (_e) {}

    return updatedItem;
  }

  static async delete(id: string) {
    const current = await ServiceService.getAll();
    const updatedList = current.filter(s => s.id !== id);
    writeFileData(updatedList);

    try {
      if (db.service) {
        await db.service.delete({ where: { id } });
      }
    } catch (_e) {}

    return { success: true, deletedId: id };
  }

  static async toggleStatus(id: string) {
    const current = await ServiceService.getAll();
    let toggled: any = null;

    const updatedList = current.map(s => {
      if (s.id === id) {
        const newStatus = s.status === 'active' ? 'inactive' : 'active';
        toggled = { ...s, status: newStatus, isEnabled: newStatus === 'active' };
        return toggled;
      }
      return s;
    });

    writeFileData(updatedList);

    try {
      if (db.service && toggled) {
        await db.service.update({
          where: { id },
          data: { status: toggled.status, isEnabled: toggled.isEnabled },
        });
      }
    } catch (_e) {}

    return toggled || { id, status: 'toggled' };
  }

  static async duplicate(id: string) {
    const current = await ServiceService.getAll();
    const target = current.find(s => s.id === id);
    if (!target) return { id: `copy-${Date.now()}` };

    const newItem: ServiceItem = {
      ...target,
      id: `service-${Date.now()}`,
      title: `${target.title} (Copy)`,
      order: current.length,
    };

    const updated = [...current, newItem];
    writeFileData(updated);

    try {
      if (db.service) {
        await db.service.create({ data: newItem });
      }
    } catch (_e) {}

    return newItem;
  }

  static async reorder(orderedIds: string[]) {
    const current = await ServiceService.getAll();
    const map = new Map(current.map(s => [s.id, s]));
    const updatedList = orderedIds
      .map((id, index) => {
        const item = map.get(id);
        return item ? { ...item, order: index } : null;
      })
      .filter(Boolean) as ServiceItem[];

    writeFileData(updatedList);

    try {
      if (db.service) {
        await Promise.all(
          orderedIds.map((id, index) =>
            db.service.update({
              where: { id },
              data: { order: index },
            })
          )
        );
      }
    } catch (_e) {}

    return updatedList;
  }
}

