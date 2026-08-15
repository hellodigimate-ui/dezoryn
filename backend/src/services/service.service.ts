import { prisma } from '../config/prisma.config';

const db = prisma as any;

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
    if (!hasAttemptedSeed) {
      hasAttemptedSeed = true;
      try {
        if (db.service) {
          const totalCount = await db.service.count();
          if (totalCount === 0) {
            await db.service.createMany({ data: DEFAULT_SERVICES });
          }
        }
      } catch (_e) {
        // ignore seed error
      }
    }

    try {
      if (db.service) {
        const where: any = {};
        if (filter?.isEnabled !== undefined) {
          where.isEnabled = filter.isEnabled;
        }
        if (filter?.status && filter.status !== 'All') {
          where.status = filter.status;
        }
        if (filter?.category) {
          where.category = filter.category;
        }
        if (filter?.search) {
          where.OR = [
            { title: { contains: filter.search, mode: 'insensitive' } },
            { description: { contains: filter.search, mode: 'insensitive' } },
            { category: { contains: filter.search, mode: 'insensitive' } },
          ];
        }

        const items = await db.service.findMany({ where, orderBy: { order: 'asc' } });
        if (items && items.length > 0) {
          return items;
        }
      }
    } catch (_err) {
      console.error('Database query for services failed, using memory store:', _err);
    }

    // Fallback in-memory dataset
    let filtered = [...memoryServicesStore];
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
    return filtered.sort((a, b) => a.order - b.order);
  }

  static async getById(id: string) {
    try {
      if (db.service) {
        const item = await db.service.findUnique({ where: { id } });
        if (item) return item;
      }
    } catch (_e) {
      // fallback
    }
    return memoryServicesStore.find(s => s.id === id) || null;
  }

  static async create(data: Partial<ServiceItem>) {
    let createdItem: any = null;
    try {
      if (db.service) {
        const count = await db.service.count();
        createdItem = await db.service.create({
          data: {
            category: data.category || 'General',
            badge: data.badge || '',
            title: data.title || 'New Service',
            description: data.description || '',
            icon: data.icon || 'Code2',
            services: data.services || [],
            ctaText: data.ctaText || 'Explore Services',
            ctaLink: data.ctaLink || '/contact-sales',
            order: data.order ?? count,
            status: data.status || 'active',
            isEnabled: data.isEnabled ?? true,
          }
        });
      }
    } catch (_e) {
      // fallback
    }

    const newItem: ServiceItem = createdItem || {
      id: `service-${Date.now()}`,
      category: data.category || 'General',
      badge: data.badge || '',
      title: data.title || 'New Service',
      description: data.description || '',
      icon: data.icon || 'Code2',
      services: data.services || [],
      ctaText: data.ctaText || 'Explore Services',
      ctaLink: data.ctaLink || '/contact-sales',
      order: data.order ?? memoryServicesStore.length,
      status: data.status || 'active',
      isEnabled: data.isEnabled ?? true,
    };

    if (!createdItem) {
      memoryServicesStore.push(newItem);
    } else {
      // sync in memory store too
      memoryServicesStore.push(createdItem);
    }

    return newItem;
  }

  static async update(id: string, data: Partial<ServiceItem>) {
    let updatedItem: any = null;
    try {
      if (db.service) {
        const updateData: any = { ...data };
        delete updateData.id;
        if (data.status !== undefined && data.isEnabled === undefined) {
          updateData.isEnabled = data.status === 'active';
        }
        const existing = await db.service.findUnique({ where: { id } }).catch(() => null);
        if (existing) {
          updatedItem = await db.service.update({ where: { id }, data: updateData });
        } else {
          updatedItem = await db.service.create({
            data: {
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
            }
          });
        }
      }
    } catch (_e) {
      console.warn('Service update notice:', _e);
    }

    memoryServicesStore = memoryServicesStore.map(s => {
      if (s.id === id) {
        return { ...s, ...data };
      }
      return s;
    });

    return updatedItem || memoryServicesStore.find(s => s.id === id) || { id, ...data };
  }

  static async delete(id: string) {
    try {
      if (db.service) {
        const existing = await db.service.findUnique({ where: { id } }).catch(() => null);
        if (existing) {
          await db.service.delete({ where: { id } });
        }
      }
    } catch (_e) {
      // fallback
    }
    memoryServicesStore = memoryServicesStore.filter(s => s.id !== id);
    return { success: true, deletedId: id };
  }

  static async toggleStatus(id: string) {
    let toggled: any = null;
    try {
      if (db.service) {
        const item = await db.service.findUnique({ where: { id } }).catch(() => null);
        if (item) {
          const newStatus = item.status === 'active' ? 'inactive' : 'active';
          toggled = await db.service.update({
            where: { id },
            data: { status: newStatus, isEnabled: newStatus === 'active' },
          });
        }
      }
    } catch (_e) {
      // fallback
    }

    memoryServicesStore = memoryServicesStore.map(s => {
      if (s.id === id) {
        const newStatus = s.status === 'active' ? 'inactive' : 'active';
        return { ...s, status: newStatus, isEnabled: newStatus === 'active' };
      }
      return s;
    });

    return toggled || memoryServicesStore.find(s => s.id === id) || { id, status: 'toggled' };
  }

  static async duplicate(id: string) {
    try {
      if (db.service) {
        const item = await db.service.findUnique({ where: { id } });
        if (item) {
          const count = await db.service.count();
          const { id: _id, createdAt: _ca, updatedAt: _ua, ...rest } = item;
          return await db.service.create({
            data: {
              ...rest,
              title: `${rest.title} (Copy)`,
              order: count,
            },
          });
        }
      }
    } catch (_e) {
      // fallback
    }
    return { id: `copy-${Date.now()}` };
  }

  static async reorder(orderedIds: string[]) {
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
        return await db.service.findMany({ orderBy: { order: 'asc' } });
      }
    } catch (_e) {
      // fallback
    }
    return DEFAULT_SERVICES;
  }
}
