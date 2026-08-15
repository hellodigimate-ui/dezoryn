import { API_CONFIG } from '../../config/api.config';
import type { CrmApiResponse, CrmPlan, CrmPlansQuery } from './types';

export const crmPricingApi = {
  async getPlans(
    params: CrmPlansQuery = {},
    options?: { signal?: AbortSignal }
  ): Promise<CrmApiResponse<CrmPlan[]>> {
    const query = new URLSearchParams();
    if (params.page !== undefined) query.set('page', params.page.toString());
    if (params.perPage !== undefined) query.set('perPage', params.perPage.toString());
    if (params.name) query.set('name', params.name);
    if (params.isVisible !== undefined) query.set('isVisible', params.isVisible.toString());

    const url = `${API_CONFIG.crmApiUrl}/api/v1/plans${query.toString() ? `?${query.toString()}` : ''}`;
    const response = await fetch(url, {
      signal: options?.signal,
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`CRM Pricing API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  },

  async getPlanById(
    id: string,
    options?: { signal?: AbortSignal }
  ): Promise<CrmApiResponse<CrmPlan>> {
    const url = `${API_CONFIG.crmApiUrl}/api/v1/plans/${encodeURIComponent(id)}`;
    const response = await fetch(url, {
      signal: options?.signal,
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`CRM Pricing Detail API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  },
};
