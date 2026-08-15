import type { CrmPlan, EstatePlan, SchoolycoreLitePlan } from '../services/pricing/types';
import type { PricingPlan, PricingPlanFeatureItem } from '../types/pricing';

export function formatPrice(priceVal: unknown, currencyVal: string = '₹'): string {
  if (priceVal === null || priceVal === undefined || priceVal === '') {
    return 'Custom';
  }

  if (typeof priceVal === 'number') {
    return `${currencyVal}${priceVal.toLocaleString()}`;
  }

  const str = String(priceVal).trim();
  if (!str || str.toLowerCase().includes('custom') || str.toLowerCase().includes('contact')) {
    return 'Custom';
  }

  if (/^[^\d\s]/.test(str)) {
    return str;
  }

  const numericMatch = str.match(/[\d,]+(\.\d+)?/);
  if (numericMatch) {
    const rawNum = numericMatch[0].replace(/,/g, '');
    const num = parseFloat(rawNum);
    if (!Number.isNaN(num)) {
      return `${currencyVal}${num.toLocaleString()}`;
    }
  }

  return str;
}

export function normalizeCrmPlan(crm: CrmPlan): PricingPlan {
  const monthly = crm.monthlyPrice ?? crm.price;
  const yearly = crm.yearlyPrice ?? crm.annualPrice;

  return {
    id: String(crm.id || ''),
    name: crm.name || 'Unnamed Plan',
    description: crm.description || undefined,
    monthlyPrice: monthly,
    yearlyPrice: yearly,
    currency: crm.currency || '₹',
    features: Array.isArray(crm.features) ? crm.features.filter(Boolean) : [],
    isVisible: crm.isVisible ?? crm.isEnabled,
    isPopular: crm.isPopular ?? crm.isHighlight,
    ctaLabel: crm.buttonText || (monthly || yearly ? 'Start Trial' : 'Contact Sales'),
    ctaAction: monthly || yearly ? 'demo' : 'contact',
    source: 'crm',
    raw: crm,
  };
}

export function normalizeEstatePlan(estate: EstatePlan): PricingPlan {
  const monthly = estate.monthlyPrice ?? estate.price;
  const yearly = estate.annualPrice;

  return {
    id: String(estate.id || ''),
    name: estate.name || 'Unnamed Plan',
    description: estate.description || undefined,
    monthlyPrice: monthly,
    yearlyPrice: yearly,
    currency: estate.currency || '₹',
    features: Array.isArray(estate.features) ? estate.features.filter(Boolean) : [],
    type: estate.type || undefined,
    visibleOnWebsite: estate.visibleOnWebsite,
    isActive: estate.isActive,
    ctaLabel: estate.ctaText || (monthly || yearly ? 'Book Demo' : 'Contact Sales'),
    ctaAction: monthly || yearly ? 'demo' : 'contact',
    source: 'estate',
    raw: estate,
  };
}

export function normalizeSchoolycorePlan(schooly: EstatePlan): PricingPlan {
  const normalized = normalizeEstatePlan(schooly);
  return {
    ...normalized,
    source: 'schoolycore',
  };
}

export function normalizeSchoolycoreLitePlan(lite: SchoolycoreLitePlan): PricingPlan {
  const monthly = lite.monthlyPrice ?? lite.price;
  const yearly = lite.annualPrice;

  let extractedFeatures: string[] = [];
  if (Array.isArray(lite.features) && lite.features.length > 0) {
    extractedFeatures = lite.features.filter((f): f is string => typeof f === 'string' && Boolean(f));
  } else if (Array.isArray(lite.planFeatures)) {
    extractedFeatures = lite.planFeatures
      .map((pf) => {
        if (typeof pf === 'string') return pf;
        if (pf && typeof pf === 'object') {
          return pf.featureText || pf.name || pf.text || '';
        }
        return '';
      })
      .filter(Boolean);
  }

  const mappedPlanFeatures: PricingPlanFeatureItem[] | undefined = Array.isArray(lite.planFeatures)
    ? lite.planFeatures.map((pf) => {
        if (typeof pf === 'string') {
          return { text: pf, featureText: pf, name: pf };
        }
        return {
          id: pf?.id,
          name: pf?.name,
          featureText: pf?.featureText,
          text: pf?.text,
        };
      })
    : undefined;

  return {
    id: String(lite.id || ''),
    name: lite.name || 'Unnamed Plan',
    description: lite.description || undefined,
    monthlyPrice: monthly,
    yearlyPrice: yearly,
    currency: lite.currency || '₹',
    features: extractedFeatures,
    isActive: lite.isActive,
    planFeatures: mappedPlanFeatures,
    rolePermissions: Array.isArray(lite.rolePermissions) ? lite.rolePermissions : undefined,
    ctaLabel: monthly || yearly ? 'Select Plan' : 'Contact Sales',
    ctaAction: monthly || yearly ? 'demo' : 'contact',
    source: 'schoolycore-lite',
    raw: lite,
  };
}
