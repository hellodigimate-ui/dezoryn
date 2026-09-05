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

/**
 * Helper to extract and sanitize only valid Prisma Product fields from input.
 * Prevents unknown argument validation errors in Prisma while persisting all data.
 */
function sanitizeProductPayload(data: any, isUpdate = false): Record<string, any> {
  const result: Record<string, any> = {};

  const title = data.title !== undefined ? data.title : data.name;
  if (title !== undefined) result.title = String(title).trim();

  if (data.subtitle !== undefined) result.subtitle = String(data.subtitle);

  const description = data.description !== undefined ? data.description : data.shortDesc;
  if (description !== undefined) result.description = String(description);

  if (data.icon !== undefined) result.icon = String(data.icon);
  if (data.gradient !== undefined) result.gradient = String(data.gradient);
  if (data.category !== undefined) result.category = String(data.category);
  if (data.categoryLabel !== undefined) result.categoryLabel = String(data.categoryLabel);
  if (data.industry !== undefined) result.industry = String(data.industry);
  if (data.badge !== undefined) result.badge = String(data.badge);

  const shortDesc = data.shortDesc !== undefined ? data.shortDesc : data.description;
  if (shortDesc !== undefined) result.shortDesc = String(shortDesc);

  if (data.slug !== undefined) {
    const rawSlug = String(data.slug).trim();
    result.slug = rawSlug || (result.title ? result.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') : '');
  } else if (!isUpdate && result.title) {
    result.slug = result.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }

  if (data.price !== undefined) result.price = String(data.price);
  if (data.priceValue !== undefined) result.priceValue = Number(data.priceValue) || 0;
  if (data.discount !== undefined) result.discount = Number(data.discount) || 0;
  if (data.pricingType !== undefined) result.pricingType = String(data.pricingType);

  if (data.pricingTiers !== undefined) {
    result.pricingTiers = Array.isArray(data.pricingTiers) ? data.pricingTiers : [];
  }

  const image = data.image !== undefined ? data.image : data.thumbnail;
  if (image !== undefined) {
    result.image = image ? String(image) : null;
    result.thumbnail = image ? String(image) : '';
  }
  if (data.thumbnail !== undefined && result.thumbnail === undefined) {
    result.thumbnail = String(data.thumbnail);
    if (result.image === undefined) result.image = data.thumbnail ? String(data.thumbnail) : null;
  }

  if (data.coverPhoto !== undefined) result.coverPhoto = String(data.coverPhoto);
  if (data.gallery !== undefined) result.gallery = Array.isArray(data.gallery) ? data.gallery : [];
  if (data.videoUrl !== undefined) result.videoUrl = String(data.videoUrl);
  else if (data.video !== undefined) result.videoUrl = String(data.video);

  if (data.demoUrl !== undefined) result.demoUrl = String(data.demoUrl);
  if (data.documentation !== undefined) result.documentation = String(data.documentation);

  if (data.features !== undefined) {
    result.features = Array.isArray(data.features) ? data.features : [];
  }

  if (data.specifications !== undefined) {
    result.specifications = typeof data.specifications === 'string' ? data.specifications : JSON.stringify(data.specifications);
  }

  if (data.integrations !== undefined) result.integrations = Array.isArray(data.integrations) ? data.integrations : [];
  if (data.platforms !== undefined) result.platforms = Array.isArray(data.platforms) ? data.platforms : [];

  if (data.rating !== undefined) result.rating = Number(data.rating) || 5.0;
  if (data.reviewsCount !== undefined) result.reviewsCount = Number(data.reviewsCount) || 0;
  if (data.customerReviews !== undefined) result.customerReviews = Array.isArray(data.customerReviews) ? data.customerReviews : [];

  if (data.aiPowered !== undefined) result.aiPowered = Boolean(data.aiPowered);
  if (data.apiAvailable !== undefined) result.apiAvailable = Boolean(data.apiAvailable);
  if (data.cloudNative !== undefined) result.cloudNative = Boolean(data.cloudNative);
  if (data.mobileApp !== undefined) result.mobileApp = Boolean(data.mobileApp);
  if (data.whatsAppIntegration !== undefined) result.whatsAppIntegration = Boolean(data.whatsAppIntegration);

  if (data.isFeatured !== undefined) {
    result.isFeatured = Boolean(data.isFeatured);
    if (result.isFeatured && data.status === undefined) result.status = 'featured';
  }
  if (data.isPopular !== undefined) result.isPopular = Boolean(data.isPopular);

  if (data.status !== undefined) result.status = String(data.status);
  if (data.isEnabled !== undefined) result.isEnabled = Boolean(data.isEnabled);
  if (data.order !== undefined) result.order = Number(data.order) || 0;
  else if (data.sortOrder !== undefined) result.order = Number(data.sortOrder) || 0;

  if (data.metaTitle !== undefined) result.metaTitle = String(data.metaTitle);
  if (data.metaDescription !== undefined) result.metaDescription = String(data.metaDescription);
  if (data.metaKeywords !== undefined) result.metaKeywords = String(data.metaKeywords);
  if (data.canonicalUrl !== undefined) result.canonicalUrl = String(data.canonicalUrl);

  if (data.screenshots !== undefined) result.screenshots = Array.isArray(data.screenshots) ? data.screenshots : [];
  if (data.deployment !== undefined) result.deployment = Array.isArray(data.deployment) ? data.deployment : [];
  if (data.businessSizes !== undefined) result.businessSizes = Array.isArray(data.businessSizes) ? data.businessSizes : [];
  if (data.languages !== undefined) result.languages = Array.isArray(data.languages) ? data.languages : [];
  if (data.countries !== undefined) result.countries = Array.isArray(data.countries) ? data.countries : [];

  if (data.downloadsCount !== undefined) result.downloadsCount = Number(data.downloadsCount) || 0;
  if (data.viewsCount !== undefined) result.viewsCount = Number(data.viewsCount) || 0;
  if (data.demoClicks !== undefined) result.demoClicks = Number(data.demoClicks) || 0;

  return result;
}

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

      if (filter?.search) {
        const q = filter.search.toLowerCase().trim();
        products = products.filter((p: any) =>
          (p.title && String(p.title).toLowerCase().includes(q)) ||
          (p.description && String(p.description).toLowerCase().includes(q)) ||
          (p.category && String(p.category).toLowerCase().includes(q)) ||
          (p.industry && String(p.industry).toLowerCase().includes(q)) ||
          (p.slug && String(p.slug).toLowerCase().includes(q)) ||
          (p.badge && String(p.badge).toLowerCase().includes(q))
        );
      }

      if (filter?.category && filter.category !== 'all') {
        products = products.filter((p: any) => p.category && p.category.toLowerCase() === filter.category!.toLowerCase());
      }

      if (filter?.maxPrice !== undefined && filter.maxPrice > 0) {
        products = products.filter((p: any) => (p.priceValue || 0) <= filter.maxPrice!);
      }

      if (filter?.aiPowered !== undefined) {
        products = products.filter((p: any) => Boolean(p.aiPowered) === filter.aiPowered);
      }
      if (filter?.apiAvailable !== undefined) {
        products = products.filter((p: any) => Boolean(p.apiAvailable) === filter.apiAvailable);
      }
      if (filter?.cloudNative !== undefined) {
        products = products.filter((p: any) => Boolean(p.cloudNative) === filter.cloudNative);
      }
      if (filter?.mobileApp !== undefined) {
        products = products.filter((p: any) => Boolean(p.mobileApp) === filter.mobileApp);
      }
      if (filter?.whatsAppIntegration !== undefined) {
        products = products.filter((p: any) => Boolean(p.whatsAppIntegration) === filter.whatsAppIntegration);
      }

      if (filter?.industries && filter.industries.length > 0) {
        products = products.filter((p: any) => {
          const pIndustry = (p.industry || '').toLowerCase().trim();
          const pCatLabel = (p.categoryLabel || '').toLowerCase().trim();
          return filter.industries!.some((rawInd) => {
            const ind = rawInd.toLowerCase().trim();
            if (!ind) return false;
            // 1. Direct substring match (e.g. "education" in "Education & Academics" or "Education")
            if (pIndustry && (pIndustry.includes(ind) || ind.includes(pIndustry))) return true;
            if (pCatLabel && (pCatLabel.includes(ind) || ind.includes(pCatLabel))) return true;
            // 2. Slug / alphanumeric normalized match (e.g. "real-estate" vs "Real Estate & Property")
            const cleanInd = ind.replace(/[^a-z0-9]/g, '');
            const cleanPInd = pIndustry.replace(/[^a-z0-9]/g, '');
            const cleanPCat = pCatLabel.replace(/[^a-z0-9]/g, '');
            if (cleanInd && cleanPInd && (cleanPInd.includes(cleanInd) || cleanInd.includes(cleanPInd))) return true;
            if (cleanInd && cleanPCat && (cleanPCat.includes(cleanInd) || cleanInd.includes(cleanPCat))) return true;
            return false;
          });
        });
      }

      return products;
    } catch (error) {
      console.error('GET PRODUCTS ERROR:', error);
      throw error;
    }
  }

  static async getById(id: string) {
    try {
      const cleanId = String(id).trim();
      const product = await prisma.product.findFirst({
        where: {
          OR: [
            { id: cleanId },
            { slug: cleanId },
            { slug: { mode: 'insensitive', equals: cleanId } },
            { slug: { mode: 'insensitive', startsWith: cleanId } },
          ],
        },
      });
      return product;
    } catch (error) {
      console.error(`GET PRODUCT ${id} ERROR:`, error);
      throw error;
    }
  }

  static async create(data: any) {
    try {
      const count = await prisma.product.count();
      const cleanData = sanitizeProductPayload(data, false);

      const customId = data.id && typeof data.id === 'string' && data.id.trim().length > 0
        ? data.id.trim()
        : undefined;

      const product = await prisma.product.create({
        data: {
          ...(customId ? { id: customId } : {}),
          title: cleanData.title || 'New Enterprise Product',
          subtitle: cleanData.subtitle || '',
          description: cleanData.description || '',
          icon: cleanData.icon || 'Zap',
          gradient: cleanData.gradient || 'from-blue-600 to-cyan-500',
          features: cleanData.features || [],
          image: cleanData.image || null,
          order: cleanData.order ?? count,
          status: cleanData.status || 'active',
          category: cleanData.category || 'erp',
          isEnabled: cleanData.isEnabled ?? true,
          slug: cleanData.slug || '',
          categoryLabel: cleanData.categoryLabel || '',
          industry: cleanData.industry || '',
          badge: cleanData.badge || '',
          shortDesc: cleanData.shortDesc || '',
          price: cleanData.price || '',
          priceValue: cleanData.priceValue || 0,
          discount: cleanData.discount || 0,
          pricingType: cleanData.pricingType || 'subscription',
          pricingTiers: cleanData.pricingTiers || [],
          thumbnail: cleanData.thumbnail || '',
          coverPhoto: cleanData.coverPhoto || '',
          gallery: cleanData.gallery || [],
          videoUrl: cleanData.videoUrl || '',
          demoUrl: cleanData.demoUrl || '',
          documentation: cleanData.documentation || '',
          specifications: cleanData.specifications || '',
          integrations: cleanData.integrations || [],
          platforms: cleanData.platforms || [],
          rating: cleanData.rating ?? 4.9,
          reviewsCount: cleanData.reviewsCount ?? 0,
          customerReviews: cleanData.customerReviews || [],
          aiPowered: cleanData.aiPowered ?? false,
          apiAvailable: cleanData.apiAvailable ?? false,
          cloudNative: cleanData.cloudNative ?? false,
          mobileApp: cleanData.mobileApp ?? false,
          whatsAppIntegration: cleanData.whatsAppIntegration ?? false,
          isFeatured: cleanData.isFeatured ?? false,
          isPopular: cleanData.isPopular ?? false,
          metaTitle: cleanData.metaTitle || '',
          metaDescription: cleanData.metaDescription || '',
          metaKeywords: cleanData.metaKeywords || '',
          canonicalUrl: cleanData.canonicalUrl || '',
          screenshots: cleanData.screenshots || [],
          deployment: cleanData.deployment || [],
          businessSizes: cleanData.businessSizes || [],
          languages: cleanData.languages || [],
          countries: cleanData.countries || [],
          downloadsCount: cleanData.downloadsCount || 0,
          viewsCount: cleanData.viewsCount || 0,
          demoClicks: cleanData.demoClicks || 0,
        } as any,
      });

      return product;
    } catch (error) {
      console.error('CREATE PRODUCT ERROR:', error);
      throw error;
    }
  }

  static async update(id: string, data: any) {
    try {
      const existing = await prisma.product.findUnique({ where: { id } });
      if (!existing) {
        throw new Error(`Product with ID "${id}" not found.`);
      }

      const cleanData = sanitizeProductPayload(data, true);

      const updated = await prisma.product.update({
        where: { id },
        data: cleanData as any,
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
      const { id: _id, createdAt: _ca, updatedAt: _ua, ...rest } = original as any;
      const cleanData = sanitizeProductPayload(rest, false);

      const duplicated = await prisma.product.create({
        data: {
          ...cleanData,
          title: `${cleanData.title || original.title} (Copy)`,
          slug: `${cleanData.slug || original.title.toLowerCase().replace(/\s+/g, '-')}-copy`,
          order: count,
        } as any,
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
