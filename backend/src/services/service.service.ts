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

export const DEFAULT_SERVICES: Omit<ServiceItem, 'id'>[] = [
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
    imageUrl: '',
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
    imageUrl: '',
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
    imageUrl: '',
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
    imageUrl: '',
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
    imageUrl: '',
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
    imageUrl: '',
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
    imageUrl: '',
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
    imageUrl: '',
    order: 7,
    status: 'active',
    isEnabled: true
  }
];

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

      if (!items || items.length === 0) {
        await prisma.service.createMany({
          data: DEFAULT_SERVICES as any,
        });
        items = await prisma.service.findMany({
          orderBy: { order: 'asc' },
        });
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
