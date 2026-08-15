import { prisma } from '../config/prisma.config';

const db = prisma as any;

const DEFAULTS = [
  {
    id: 'starter-plan',
    name: 'Starter',
    price: '29',
    monthlyPrice: 29,
    annualPrice: 24,
    currency: '₹',
    description: 'Essential pipeline management & basic lead scoring for small sales teams.',
    features: ['Up to 10 Sales Rep Seats', 'Basic AI Lead Scoring', 'Email & SMS Cadences', 'Kanban Deal Pipelines', '99.5% SLA Uptime'],
    buttonText: 'Start Free Trial',
    buttonUrl: '/book-demo',
    isHighlight: false,
    ribbon: null,
    colorTheme: 'slate',
    order: 0,
    isEnabled: true,
  },
  {
    id: 'professional-plan',
    name: 'Professional',
    price: '79',
    monthlyPrice: 79,
    annualPrice: 64,
    currency: '₹',
    description: 'Advanced predictive intelligence, multi-channel cadences & AI forecasting.',
    features: ['Unlimited Sales Seats', '50+ Intent Signals', 'Multi-Channel Automation', 'AI Revenue Forecasting', 'Multi-Currency Support', 'Dedicated Onboarding'],
    buttonText: 'Schedule Walkthrough',
    buttonUrl: '/book-demo',
    isHighlight: true,
    ribbon: 'Most Popular',
    colorTheme: 'blue',
    order: 1,
    isEnabled: true,
  },
  {
    id: 'enterprise-plan',
    name: 'Enterprise',
    price: 'Custom',
    monthlyPrice: undefined,
    annualPrice: undefined,
    currency: '₹',
    description: 'Dedicated cloud cluster, custom AI model training & SOC2 compliance.',
    features: ['Isolated Cloud Cluster', 'SOC2 Type II & GDPR', 'Custom AI Fine-Tuning', '24/7 Priority Support', 'Technical Account Manager', 'Custom SSO Integration'],
    buttonText: 'Contact Us',
    buttonUrl: '/contact-sales',
    isHighlight: false,
    ribbon: null,
    colorTheme: 'violet',
    order: 2,
    isEnabled: true,
  },
];

function formatPlanWithPricing(p: any) {
  if (!p) return null;

  let monthlyPrice = p.monthlyPrice;
  let annualPrice = p.annualPrice;

  if (monthlyPrice === undefined || monthlyPrice === null) {
    if (typeof p.price === 'number') {
      monthlyPrice = p.price;
      annualPrice = Math.round(p.price * 0.8);
    } else {
      const parsed = parseFloat(String(p.price || '').replace(/[^\d.]/g, ''));
      if (!isNaN(parsed) && parsed > 0) {
        monthlyPrice = parsed;
        annualPrice = Math.round(parsed * 0.8);
      }
    }
  }

  return {
    ...p,
    monthlyPrice: monthlyPrice !== undefined ? monthlyPrice : undefined,
    annualPrice: annualPrice !== undefined ? annualPrice : undefined,
    currency: p.currency || '₹',
  };
}

export class PricingService {
  static async getAll(onlyEnabled = false) {
    try {
      const where = onlyEnabled ? { isEnabled: true } : {};
      let plans = await db.pricingPlan.findMany({ where, orderBy: { order: 'asc' } });
      if (!plans || plans.length === 0) {
        try {
          await db.pricingPlan.createMany({ data: DEFAULTS });
          plans = await db.pricingPlan.findMany({ orderBy: { order: 'asc' } });
        } catch {
          plans = DEFAULTS;
        }
      }
      return (plans && plans.length > 0 ? plans : DEFAULTS).map(formatPlanWithPricing);
    } catch {
      return DEFAULTS.map(formatPlanWithPricing);
    }
  }

  static async getById(id: string) {
    try {
      const plan = await db.pricingPlan.findUnique({ where: { id } });
      if (plan) return formatPlanWithPricing(plan);
      const defaultPlan = DEFAULTS.find(d => d.name.toLowerCase() === id.toLowerCase() || d.id === id);
      return formatPlanWithPricing(defaultPlan);
    } catch {
      const defaultPlan = DEFAULTS.find(d => d.name.toLowerCase() === id.toLowerCase() || d.id === id);
      return formatPlanWithPricing(defaultPlan);
    }
  }

  static async create(data: {
    name: string; price: string; description: string; features?: string[];
    buttonText?: string; buttonUrl?: string; isHighlight?: boolean;
    ribbon?: string; colorTheme?: string; order?: number; isEnabled?: boolean;
  }) {
    const count = await db.pricingPlan.count();
    return db.pricingPlan.create({
      data: {
        name: data.name,
        price: data.price,
        description: data.description,
        features: data.features || [],
        buttonText: data.buttonText || 'Get Started',
        buttonUrl: data.buttonUrl || '/book-demo',
        isHighlight: data.isHighlight || false,
        ribbon: data.ribbon || null,
        colorTheme: data.colorTheme || 'blue',
        order: data.order ?? count,
        isEnabled: data.isEnabled ?? true,
      },
    });
  }

  static async update(id: string, data: Partial<{
    name: string; price: string; description: string; features: string[];
    buttonText: string; buttonUrl: string; isHighlight: boolean;
    ribbon: string; colorTheme: string; order: number; isEnabled: boolean;
  }>) {
    return db.pricingPlan.update({ where: { id }, data });
  }

  static async delete(id: string) {
    return db.pricingPlan.delete({ where: { id } });
  }

  static async toggleEnabled(id: string) {
    const plan = await db.pricingPlan.findUnique({ where: { id } });
    return db.pricingPlan.update({ where: { id }, data: { isEnabled: !plan.isEnabled } });
  }

  static async reorder(orderedIds: string[]) {
    await Promise.all(
      orderedIds.map((id, index) => db.pricingPlan.update({ where: { id }, data: { order: index } }))
    );
    return db.pricingPlan.findMany({ orderBy: { order: 'asc' } });
  }
}
