import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import uploadRoutes from './upload.routes';
import heroRoutes from './hero.routes';
import navRoutes from './nav.routes';
import productRoutes from './product.routes';
import pricingRoutes from './pricing.routes';
import testimonialRoutes from './testimonial.routes';
import faqRoutes from './faq.routes';
import jobRoutes from './job.routes';
import contactRoutes from './contact.routes';
import footerRoutes from './footer.routes';
import demoRoutes from './demo.routes';
import bookingRoutes from './booking.routes';
import themeRoutes from './theme.routes';
import analyticsRoutes from './analytics.routes';
import websiteSettingsRoutes from './website-settings.routes';
import aiRoutes from './ai.routes';
import aboutRoutes from './about.routes';
import timelineRoutes from './timeline.routes';
import newsletterRoutes from './newsletter.routes';
import serviceRoutes from './service.routes';
import homepageStatsRoutes from './homepage-stats.routes';
import supportRoutes from './support.routes';
import marketplaceHeroRoutes from './marketplace-hero.routes';

const router = Router();

// Health Check Endpoint
router.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'Dezoryn CMS Backend API Foundation',
    version: '1.0.0',
  });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/uploads', uploadRoutes);
router.use('/hero', heroRoutes);
router.use('/marketplace-hero', marketplaceHeroRoutes);
router.use('/marketplace/hero', marketplaceHeroRoutes);
router.use('/nav', navRoutes);
router.use('/products', productRoutes);
router.use('/pricing', pricingRoutes);
router.use('/plans', pricingRoutes);
router.use('/pricing-plans', pricingRoutes);
router.use('/testimonials', testimonialRoutes);
router.use('/faqs', faqRoutes);
router.use('/jobs', jobRoutes);
router.use('/contact', contactRoutes);
router.use('/support', supportRoutes);
router.use('/support-tickets', supportRoutes);
router.use('/footer', footerRoutes);
router.use('/demos/booking', bookingRoutes);
router.use('/demos/bookings', bookingRoutes);
router.use('/demos', demoRoutes);
router.use('/booking', bookingRoutes);
router.use('/bookings', bookingRoutes);
router.use('/demo-booking', bookingRoutes);
router.use('/demo-bookings', bookingRoutes);
router.use('/theme', themeRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/site-settings', websiteSettingsRoutes);
router.use('/ai', aiRoutes);
router.use('/about', aboutRoutes);
router.use('/timeline', timelineRoutes);
router.use('/newsletter', newsletterRoutes);
router.use('/services', serviceRoutes);
router.use('/homepage-stats', homepageStatsRoutes);

export default router;








