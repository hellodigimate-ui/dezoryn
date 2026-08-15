import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/product.service';

export class ProductController {
  static async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        category,
        search,
        maxPrice,
        aiPowered,
        apiAvailable,
        cloudNative,
        mobileApp,
        whatsAppIntegration,
        industries,
        businessSizes,
        deployments,
        pricingTypes,
        platforms,
        features,
        languages,
        countries,
        enabled
      } = req.query;

      const filter: any = {};
      if (category) filter.category = String(category);
      if (search) filter.search = String(search);
      if (maxPrice) filter.maxPrice = Number(maxPrice);
      if (aiPowered !== undefined) filter.aiPowered = aiPowered === 'true';
      if (apiAvailable !== undefined) filter.apiAvailable = apiAvailable === 'true';
      if (cloudNative !== undefined) filter.cloudNative = cloudNative === 'true';
      if (mobileApp !== undefined) filter.mobileApp = mobileApp === 'true';
      if (whatsAppIntegration !== undefined) filter.whatsAppIntegration = whatsAppIntegration === 'true';

      if (industries) filter.industries = String(industries).split(',').filter(Boolean);
      if (businessSizes) filter.businessSizes = String(businessSizes).split(',').filter(Boolean);
      if (deployments) filter.deployments = String(deployments).split(',').filter(Boolean);
      if (pricingTypes) filter.pricingTypes = String(pricingTypes).split(',').filter(Boolean);
      if (platforms) filter.platforms = String(platforms).split(',').filter(Boolean);
      if (features) filter.features = String(features).split(',').filter(Boolean);
      if (languages) filter.languages = String(languages).split(',').filter(Boolean);
      if (countries) filter.countries = String(countries).split(',').filter(Boolean);
      if (enabled !== undefined) filter.isEnabled = enabled === 'true';

      const products = await ProductService.getAll(filter);
      res.status(200).json({ success: true, count: products.length, data: products });
    } catch (err) { next(err); }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await ProductService.getById(req.params.id);
      if (!product) { res.status(404).json({ success: false, message: 'Product not found' }); return; }
      res.status(200).json({ success: true, data: product });
    } catch (err) { next(err); }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { title, description } = req.body;
      if (!title || !description) {
        res.status(400).json({ success: false, message: 'title and description are required' });
        return;
      }
      const product = await ProductService.create(req.body);
      res.status(201).json({ success: true, data: product });
    } catch (err) { next(err); }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await ProductService.update(req.params.id, req.body);
      res.status(200).json({ success: true, data: product });
    } catch (err) { next(err); }
  }

  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await ProductService.delete(req.params.id);
      res.status(200).json({ success: true, message: 'Product deleted' });
    } catch (err) { next(err); }
  }

  static async duplicate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await ProductService.duplicate(req.params.id);
      res.status(201).json({ success: true, data: product });
    } catch (err) { next(err); }
  }

  static async toggleEnabled(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await ProductService.toggleEnabled(req.params.id);
      res.status(200).json({ success: true, data: product });
    } catch (err) { next(err); }
  }

  static async reorder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orderedIds } = req.body;
      if (!Array.isArray(orderedIds)) {
        res.status(400).json({ success: false, message: 'orderedIds must be an array' });
        return;
      }
      const products = await ProductService.reorder(orderedIds);
      res.status(200).json({ success: true, data: products });
    } catch (err) { next(err); }
  }
}
