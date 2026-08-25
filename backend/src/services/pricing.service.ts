import { prisma } from '../config/prisma.config';

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
  /**
   * GET ALL PRICING PLANS
   * PostgreSQL is the only source of truth.
   */
  static async getAll(onlyEnabled = false) {
    try {
      const where = onlyEnabled ? { isEnabled: true } : {};
      let plans = await prisma.pricingPlan.findMany({ where, orderBy: { order: 'asc' } });

      if (!plans || plans.length === 0) {
        await prisma.pricingPlan.createMany({ data: DEFAULTS });
        plans = await prisma.pricingPlan.findMany({ orderBy: { order: 'asc' } });
      }

      return plans.map(formatPlanWithPricing);
    } catch (error) {
      console.error('GET PRICING PLANS ERROR:', error);
      throw error;
    }
  }

  static async getById(id: string) {
    try {
      const plan = await prisma.pricingPlan.findUnique({ where: { id } });
      return formatPlanWithPricing(plan);
    } catch (error) {
      console.error(`GET PRICING PLAN ${id} ERROR:`, error);
      throw error;
    }
  }

  static async create(data: {
    name: string; price: string; description: string; features?: string[];
    buttonText?: string; buttonUrl?: string; isHighlight?: boolean;
    ribbon?: string; colorTheme?: string; order?: number; isEnabled?: boolean;
  }) {
    try {
      const count = await prisma.pricingPlan.count();
      const created = await prisma.pricingPlan.create({
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

      return formatPlanWithPricing(created);
    } catch (error) {
      console.error('CREATE PRICING PLAN ERROR:', error);
      throw error;
    }
  }

  static async update(id: string, data: Partial<{
    name: string; price: string; description: string; features: string[];
    buttonText: string; buttonUrl: string; isHighlight: boolean;
    ribbon: string; colorTheme: string; order: number; isEnabled: boolean;
  }>) {
    try {
      const updated = await prisma.pricingPlan.update({ where: { id }, data });
      return formatPlanWithPricing(updated);
    } catch (error) {
      console.error(`UPDATE PRICING PLAN ${id} ERROR:`, error);
      throw error;
    }
  }

  static async delete(id: string) {
    try {
      await prisma.pricingPlan.delete({ where: { id } });
      return { success: true, deletedId: id };
    } catch (error) {
      console.error(`DELETE PRICING PLAN ${id} ERROR:`, error);
      throw error;
    }
  }

  static async toggleEnabled(id: string) {
    try {
      const plan = await prisma.pricingPlan.findUnique({ where: { id } });
      if (!plan) throw new Error('Pricing plan not found');

      const updated = await prisma.pricingPlan.update({ where: { id }, data: { isEnabled: !plan.isEnabled } });
      return formatPlanWithPricing(updated);
    } catch (error) {
      console.error(`TOGGLE PRICING PLAN ${id} ERROR:`, error);
      throw error;
    }
  }

  static async reorder(orderedIds: string[]) {
    try {
      await Promise.all(
        orderedIds.map((id, index) => prisma.pricingPlan.update({ where: { id }, data: { order: index } }))
      );
      const plans = await prisma.pricingPlan.findMany({ orderBy: { order: 'asc' } });
      return plans.map(formatPlanWithPricing);
    } catch (error) {
      console.error('REORDER PRICING PLANS ERROR:', error);
      throw error;
    }
  }
}
