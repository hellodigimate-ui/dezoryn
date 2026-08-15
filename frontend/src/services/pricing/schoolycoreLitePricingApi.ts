import { API_CONFIG } from '../../config/api.config';
import type { SchoolycoreLiteApiResponse, SchoolycoreLitePlan, SchoolycoreLitePlansQuery } from './types';

export const schoolycoreLitePricingApi = {
  async getPlans(
    params: SchoolycoreLitePlansQuery = {},
    options?: { signal?: AbortSignal }
  ): Promise<SchoolycoreLiteApiResponse<SchoolycoreLitePlan[]>> {
    const query = new URLSearchParams();
    if (params.page !== undefined) query.set('page', params.page.toString());
    if (params.perPage !== undefined) query.set('perPage', params.perPage.toString());

    const url = `${API_CONFIG.schoolycoreLiteApiUrl}/api/v1/pricing-plans${query.toString() ? `?${query.toString()}` : ''}`;
    const response = await fetch(url, {
      signal: options?.signal,
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`SchoolyCore Lite Pricing API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  },

  async getPlanById(
    id: string,
    options?: { signal?: AbortSignal }
  ): Promise<SchoolycoreLiteApiResponse<SchoolycoreLitePlan>> {
    const url = `${API_CONFIG.schoolycoreLiteApiUrl}/api/v1/pricing-plans/${encodeURIComponent(id)}`;
    const response = await fetch(url, {
      signal: options?.signal,
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`SchoolyCore Lite Pricing Detail API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  },
};
