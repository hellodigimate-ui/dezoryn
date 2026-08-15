import { API_CONFIG } from '../../config/api.config';
import type { EstateApiResponse, EstatePlan, EstatePlansQuery } from './types';

export const estatePricingApi = {
  async getPlans(
    params: EstatePlansQuery = {},
    options?: { signal?: AbortSignal }
  ): Promise<EstateApiResponse<EstatePlan[]>> {
    const query = new URLSearchParams();
    if (params.page !== undefined) query.set('page', params.page.toString());
    if (params.perPage !== undefined) query.set('perPage', params.perPage.toString());
    query.set('type', params.type || 'AGENT');
    if (params.visibleOnWebsite !== undefined) query.set('visibleOnWebsite', params.visibleOnWebsite.toString());

    const url = `${API_CONFIG.estateApiUrl}/api/v1/plans?${query.toString()}`;
    const response = await fetch(url, {
      signal: options?.signal,
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Real Estate Pricing API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  },

  async getPlanById(
    id: string,
    options?: { signal?: AbortSignal }
  ): Promise<EstateApiResponse<EstatePlan>> {
    const url = `${API_CONFIG.estateApiUrl}/api/v1/plans/${encodeURIComponent(id)}`;
    const response = await fetch(url, {
      signal: options?.signal,
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Real Estate Pricing Detail API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  },
};
