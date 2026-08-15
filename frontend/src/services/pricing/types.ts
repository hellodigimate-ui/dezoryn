export interface PaginationMetadata {
  currentPage: number;
  perPage: number;
  total: number;
  totalPages: number;
}

// ── SOURCE 1: CRM API TYPES ──
export interface CrmPlan {
  id: string;
  name: string;
  description?: string;
  monthlyPrice?: number | string;
  yearlyPrice?: number | string;
  price?: number | string;
  annualPrice?: number | string;
  currency?: string;
  features?: string[];
  isVisible?: boolean;
  isEnabled?: boolean;
  isHighlight?: boolean;
  isPopular?: boolean;
  buttonText?: string;
  buttonUrl?: string;
  ribbon?: string;
  colorTheme?: string;
  order?: number;
}

export interface CrmPlansQuery {
  page?: number;
  perPage?: number;
  name?: string;
  isVisible?: boolean;
}

export interface CrmApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: PaginationMetadata;
}

// ── SOURCE 2: ESTATE / SCHOOLYCORE API TYPES ──
export interface EstatePlan {
  id: string;
  name: string;
  description?: string;
  price?: number | string;
  monthlyPrice?: number | string;
  annualPrice?: number | string;
  currency?: string;
  type?: 'AGENT' | 'BUILDER' | string;
  visibleOnWebsite?: boolean;
  isActive?: boolean;
  features?: string[];
  ctaText?: string;
}

export interface EstatePlansQuery {
  page?: number;
  perPage?: number;
  type?: 'AGENT' | 'BUILDER';
  visibleOnWebsite?: boolean;
}

export interface EstateApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: PaginationMetadata;
}

// ── SOURCE 3: SCHOOLYCORE LITE API TYPES ──
export interface PlanFeatureItem {
  id?: string;
  name?: string;
  featureText?: string;
  text?: string;
}

export interface RolePermissionItem {
  id?: string;
  role?: string;
  permissions?: string[];
}

export interface SchoolycoreLitePlan {
  id: string;
  name: string;
  description?: string;
  monthlyPrice?: number | string;
  annualPrice?: number | string;
  price?: number | string;
  currency?: string;
  planFeatures?: (string | PlanFeatureItem)[];
  rolePermissions?: RolePermissionItem[];
  isActive?: boolean;
  features?: string[];
}

export interface SchoolycoreLitePlansQuery {
  page?: number;
  perPage?: number;
}

export interface SchoolycoreLiteApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: PaginationMetadata;
}
