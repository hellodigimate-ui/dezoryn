import { prisma } from '../config/prisma.config';

export interface BackendProductFilter {
  category?: string;
  search?: string;
  maxPrice?: number;
  aiPowered?: boolean;
  apiAvailable?: boolean;
  cloudNative?: boolean;
  mobileApp?: boolean;
  whatsAppIntegration?: boolean;
  industries?: string[];
  businessSizes?: string[];
  deployments?: string[];
  pricingTypes?: string[];
  platforms?: string[];
  features?: string[];
  languages?: string[];
  countries?: string[];
  isEnabled?: boolean;
}

const DEFAULT_PRODUCTS = [
  {
    id: 'schoolycore',
    title: 'SchoolyCore ERP',
    subtitle: 'FEATURED',
    description: 'Complete K-12 and Higher-Ed Institute Management platform with automated fee collection, exams, and parent portal.',
    icon: 'GraduationCap',
    gradient: 'from-blue-600 to-cyan-500',
    category: 'industry',
    order: 0,
    status: 'active',
    isEnabled: true,
    features: [
      'Student Lifecycle & Online Admissions',
      'Automated Fee Collection Gateway & Auto Receipts',
      'Exams, Grading & Custom Report Card Generator',
      'Parent & Student iOS / Android Mobile App'
    ],
  },
  {
    id: 'schoolycore-lite',
    title: 'SchoolyCore Lite',
    subtitle: 'LITE MODULE',
    description: 'Lightweight institute management system for core attendance, basic fee billing, parent alerts, and student records.',
    icon: 'Building',
    gradient: 'from-emerald-600 to-teal-500',
    category: 'industry',
    order: 1,
    status: 'active',
    isEnabled: true,
    features: [
      'Core Student Roster & Contact Directory',
      'Basic Fee Receipt Generator & Payment Tracking',
      'Daily Attendance Logging & SMS Parent Alerts',
      '1-Click CSV Student Data Import / Export'
    ],
  },
  {
    id: 'hms-health',
    title: 'Dezo Care HMS',
    subtitle: 'POPULAR',
    description: 'Enterprise Hospital Management System covering OPD/IPD, Electronic Health Records, Pharmacy, and Telehealth.',
    icon: 'Cross',
    gradient: 'from-emerald-600 to-teal-500',
    category: 'industry',
    order: 2,
    status: 'active',
    isEnabled: true,
    features: [
      'OPD / IPD Patient Management & Bed Allocation',
      'EHR & Digital Doctor Prescriptions Engine',
      'Pharmacy & Pathology Lab Billing Integration',
      'NABH Compliance Audit Trail Logs'
    ],
  },
  {
    id: 'dezoryn-hrms',
    title: 'Dezoryn HRMS Pulse',
    subtitle: 'ENTERPRISE',
    description: 'Automated Human Resource suite for payroll processing, biometric attendance, performance tracking, and hiring.',
    icon: 'Users2',
    gradient: 'from-purple-600 to-indigo-500',
    category: 'erp',
    order: 3,
    status: 'active',
    isEnabled: true,
    features: [
      '1-Click Multi-State Automated Payroll Run',
      'Biometric & Geo-Fenced Mobile Attendance',
      'Employee Self-Service (ESS) Leave Portal',
      'Performance Appraisals & Goal Tracking (OKRs)'
    ],
  },
  {
    id: 'inventory-pro',
    title: 'InventoryPro Matrix',
    subtitle: 'CORE',
    description: 'Multi-warehouse stock control, barcode scanner integration, automated purchase ordering, and low-stock alerts.',
    icon: 'Boxes',
    gradient: 'from-amber-600 to-orange-500',
    category: 'erp',
    order: 4,
    status: 'active',
    isEnabled: true,
    features: [
      'Multi-Location Stock Sync & Batch Tracking',
      'Barcode & QR Scanner Hardware Integration',
      'Automated Purchase Reordering & PO Generation',
      'Low Stock & Batch Expiry Real-Time Alerts'
    ],
  },
  {
    id: 'sales-ai-copilot',
    title: 'DezoAI Sales Copilot',
    subtitle: 'AI DRIVEN',
    description: 'Autonomous AI agent to score leads, generate personalized multi-channel outreach, and predict pipeline deal win rates.',
    icon: 'Zap',
    gradient: 'from-cyan-600 to-blue-500',
    category: 'ai',
    order: 5,
    status: 'active',
    isEnabled: true,
    features: [
      '50+ Real-Time Behavioral Intent Signal Scoring',
      'Multi-Channel Automated Email & WhatsApp Cadences',
      'Predictive Pipeline Deal Close Forecasting',
      'Bi-Directional CRM 1-Click Sync'
    ],
  },
  {
    id: 'dezo-crm-suite',
    title: 'Dezo CRM 360',
    subtitle: 'HIGH DEMAND',
    description: 'Unified customer relationship management with deal Kanban, omnichannel communication, custom webhooks, and SLAs.',
    icon: 'Building2',
    gradient: 'from-blue-600 to-cyan-500',
    category: 'crm',
    order: 6,
    status: 'active',
    isEnabled: true,
    features: [
      'Visual Drag-and-Drop Deal Kanban Board',
      'Unified Omnichannel Customer Inbox',
      'Custom Webhooks & REST API Integrations',
      'Sales Rep Quota Attainment Leaderboards'
    ],
  },
];

export class ProductService {
  /**
   * GET ALL PRODUCTS
   * PostgreSQL is the only source of truth.
   */
  static async getAll(filter?: BackendProductFilter) {
    try {
      const where: any = {};
      if (filter?.isEnabled !== undefined) where.isEnabled = filter.isEnabled;

      let products = await prisma.product.findMany({
        where,
        orderBy: { order: 'asc' },
      });

      if (!products || products.length === 0) {
        await prisma.product.createMany({
          data: DEFAULT_PRODUCTS as any,
        });
        products = await prisma.product.findMany({
          where,
          orderBy: { order: 'asc' },
        });
      }

      if (filter?.search) {
        const q = filter.search.toLowerCase().trim();
        products = products.filter(
          (p) =>
            p.title.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q)
        );
      }

      if (filter?.category && filter.category !== 'all') {
        products = products.filter((p) => p.category.toLowerCase() === filter.category!.toLowerCase());
      }

      return products;
    } catch (error) {
      console.error('GET PRODUCTS ERROR:', error);
      throw error;
    }
  }

  static async getById(id: string) {
    try {
      const product = await prisma.product.findUnique({ where: { id } });
      return product;
    } catch (error) {
      console.error(`GET PRODUCT ${id} ERROR:`, error);
      throw error;
    }
  }

  static async create(data: any) {
    try {
      const count = await prisma.product.count();
      const product = await prisma.product.create({
        data: {
          title: data.title,
          subtitle: data.subtitle || '',
          description: data.description || '',
          icon: data.icon || 'Zap',
          gradient: data.gradient || 'from-blue-600 to-cyan-500',
          features: data.features || [],
          image: data.image || null,
          order: data.order ?? count,
          status: data.status || 'active',
          category: data.category || 'core',
          isEnabled: data.isEnabled ?? true,
        },
      });

      return product;
    } catch (error) {
      console.error('CREATE PRODUCT ERROR:', error);
      throw error;
    }
  }

  static async update(id: string, data: any) {
    try {
      const updateData: any = { ...data };
      delete updateData.id;

      const updated = await prisma.product.update({
        where: { id },
        data: updateData,
      });

      return updated;
    } catch (error) {
      console.error(`UPDATE PRODUCT ${id} ERROR:`, error);
      throw error;
    }
  }

  static async delete(id: string) {
    try {
      await prisma.product.delete({ where: { id } });
      return { success: true, deletedId: id };
    } catch (error) {
      console.error(`DELETE PRODUCT ${id} ERROR:`, error);
      throw error;
    }
  }

  static async duplicate(id: string) {
    try {
      const original = await prisma.product.findUnique({ where: { id } });
      if (!original) throw new Error('Product not found');

      const count = await prisma.product.count();
      const { id: _id, createdAt: _ca, updatedAt: _ua, ...rest } = original;

      const duplicated = await prisma.product.create({
        data: {
          ...rest,
          features: rest.features as any,
          title: `${rest.title} (Copy)`,
          order: count,
        },
      });

      return duplicated;
    } catch (error) {
      console.error(`DUPLICATE PRODUCT ${id} ERROR:`, error);
      throw error;
    }
  }

  static async toggleEnabled(id: string) {
    try {
      const product = await prisma.product.findUnique({ where: { id } });
      if (!product) throw new Error('Product not found');

      const updated = await prisma.product.update({
        where: { id },
        data: { isEnabled: !product.isEnabled },
      });

      return updated;
    } catch (error) {
      console.error(`TOGGLE PRODUCT ENABLED ${id} ERROR:`, error);
      throw error;
    }
  }

  static async reorder(orderedIds: string[]) {
    try {
      await Promise.all(
        orderedIds.map((id, index) =>
          prisma.product.update({
            where: { id },
            data: { order: index },
          })
        )
      );

      return await prisma.product.findMany({ orderBy: { order: 'asc' } });
    } catch (error) {
      console.error('REORDER PRODUCTS ERROR:', error);
      throw error;
    }
  }
}
