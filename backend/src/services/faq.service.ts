import { prisma } from '../config/prisma.config';

const db = prisma as any;

const DEFAULT_FAQS = [
  {
    question: 'What is Dezoryn Autonomous CRM & ERP?',
    answer: 'Dezoryn is an enterprise-grade AI operating system unifying CRM, lead scoring, workflow automation, and predictive analytics into a single high-performance platform.',
    category: 'Platform',
    order: 0,
    status: 'active',
    isEnabled: true,
  },
  {
    question: 'How fast can we integrate Dezoryn with our existing workflow?',
    answer: 'Deployment typically takes under 48 hours. Dezoryn features 100+ native connectors for Salesforce, HubSpot, SAP, WhatsApp API, and custom REST/GraphQL endpoints.',
    category: 'Integration',
    order: 1,
    status: 'active',
    isEnabled: true,
  },
  {
    question: 'Is enterprise customer data secure and compliant?',
    answer: 'Yes. Dezoryn complies with SOC 2 Type II, GDPR, CCPA, and HIPAA requirements. All data is encrypted at rest (AES-256) and in transit (TLS 1.3) with full RBAC audit logs.',
    category: 'Security',
    order: 2,
    status: 'active',
    isEnabled: true,
  },
  {
    question: 'Can we customize our subscription tier or request custom SLA?',
    answer: 'Absolutely. We offer flexible tiering from Starter to Enterprise Custom with dedicated account managers, 99.99% uptime SLAs, and custom AI model fine-tuning.',
    category: 'Pricing',
    order: 3,
    status: 'active',
    isEnabled: true,
  },
  {
    question: 'Does Dezoryn provide 24/7 technical support?',
    answer: 'Yes, all Pro and Enterprise tier plans include 24/7 dedicated support via phone, email, and live Slack/Teams channels with guaranteed response times under 15 minutes.',
    category: 'General',
    order: 4,
    status: 'active',
    isEnabled: true,
  },
  {
    question: 'Can I manage accordion ordering for FAQs dynamically?',
    answer: 'Yes! In the Dezoryn Admin Panel, you can drag and drop or reorder FAQs, adjust display order values, and toggle statuses in real time.',
    category: 'Platform',
    order: 5,
    status: 'active',
    isEnabled: true,
  },
];

let hasAttemptedFaqInitialSeed = false;

export class FaqService {
  static async getAll(filter?: { category?: string; status?: string; isEnabled?: boolean; search?: string }) {
    if (!hasAttemptedFaqInitialSeed) {
      hasAttemptedFaqInitialSeed = true;
      try {
        const totalCount = await db.faq.count();
        if (totalCount === 0) {
          await db.faq.createMany({ data: DEFAULT_FAQS });
        }
      } catch {
        // ignore initial seed error
      }
    }

    try {
      const where: any = {};
      if (filter?.category && filter.category !== 'All') {
        where.category = { equals: filter.category, mode: 'insensitive' };
      }
      if (filter?.status && filter.status !== 'All') {
        where.status = filter.status;
      }
      if (filter?.isEnabled !== undefined) {
        where.isEnabled = filter.isEnabled;
      }
      if (filter?.search) {
        where.OR = [
          { question: { contains: filter.search, mode: 'insensitive' } },
          { answer: { contains: filter.search, mode: 'insensitive' } },
          { category: { contains: filter.search, mode: 'insensitive' } },
        ];
      }

      const faqs = await db.faq.findMany({ where, orderBy: { order: 'asc' } });
      return faqs;


    } catch (err) {
      console.error('Error fetching FAQs:', err);
      return [];
    }
  }

  static async getById(id: string) {
    return db.faq.findUnique({ where: { id } });
  }

  static async create(data: {
    question: string;
    answer: string;
    category?: string;
    order?: number;
    status?: string;
    isEnabled?: boolean;
  }) {
    const count = await db.faq.count();
    return db.faq.create({
      data: {
        question: data.question,
        answer: data.answer,
        category: data.category || 'General',
        order: data.order ?? count,
        status: data.status || 'active',
        isEnabled: data.isEnabled ?? (data.status !== 'inactive'),
      },
    });
  }

  static async update(id: string, data: Partial<{
    question: string;
    answer: string;
    category: string;
    order: number;
    status: string;
    isEnabled: boolean;
  }>) {
    const updateData: any = { ...data };
    if (data.status !== undefined && data.isEnabled === undefined) {
      updateData.isEnabled = data.status === 'active';
    }
    return db.faq.update({ where: { id }, data: updateData });
  }

  static async delete(id: string) {
    return db.faq.delete({ where: { id } });
  }

  static async toggleStatus(id: string) {
    const item = await db.faq.findUnique({ where: { id } });
    if (!item) throw new Error('FAQ not found');
    const newStatus = item.status === 'active' ? 'inactive' : 'active';
    return db.faq.update({
      where: { id },
      data: { status: newStatus, isEnabled: newStatus === 'active' },
    });
  }

  static async duplicate(id: string) {
    const item = await db.faq.findUnique({ where: { id } });
    if (!item) throw new Error('FAQ not found');
    const count = await db.faq.count();
    const { id: _id, createdAt: _ca, updatedAt: _ua, ...rest } = item;
    return db.faq.create({
      data: {
        ...rest,
        question: `${rest.question} (Copy)`,
        order: count,
      },
    });
  }

  static async reorder(orderedIds: string[]) {
    await Promise.all(
      orderedIds.map((id, index) =>
        db.faq.update({
          where: { id },
          data: { order: index },
        })
      )
    );
    return db.faq.findMany({ orderBy: { order: 'asc' } });
  }
}
