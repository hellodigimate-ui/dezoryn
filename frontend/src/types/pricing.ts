export type PricingSource = 'crm' | 'estate' | 'schoolycore' | 'schoolycore-lite';

export interface PricingPlanFeatureItem {
  id?: string;
  name?: string;
  featureText?: string;
  text?: string;
}

export interface PricingRolePermission {
  id?: string;
  role?: string;
  permissions?: string[];
}

export interface PricingPlan {
  id: string;
  name: string;
  description?: string;

  monthlyPrice?: number | string;
  yearlyPrice?: number | string;

  currency?: string;

  features: string[];

  isActive?: boolean;
  isVisible?: boolean;
  visibleOnWebsite?: boolean;

  type?: string;

  ctaLabel?: string;
  ctaAction?: 'demo' | 'contact';
  isPopular?: boolean;

  source: PricingSource;

  // Source-specific detail fields
  planFeatures?: PricingPlanFeatureItem[];
  rolePermissions?: PricingRolePermission[];

  raw?: unknown;
}
