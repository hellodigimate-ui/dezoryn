export type AppRoute =
  | '/'
  | '/marketplace'
  | '/product-detail'
  | '/products'
  | '/book-demo'
  | '/contact-sales'
  | '/about'
  | '/pricing'
  | '/services'
  | '/careers'
  | '/admin'
  | '/admin/login'
  | '/admin/dashboard'
  | '/admin/services'
  // ── New footer routes ──
  | '/blog'
  | '/leadership'
  | '/privacy'
  | '/terms'
  | '/cookies'
  | '/help'
  | '/support'
  | '/faq'
  | '/api-docs'
  | '/status'
  | '/sitemap'
  | '/404';

export const getRouteFromPath = (path: string): AppRoute => {
  const normalizedPath = path.startsWith('/') ? path : '/' + path;
  const cleanPath = normalizedPath.toLowerCase().split('#')[0].split('?')[0].replace(/\/$/, '') || '/';
  if (cleanPath === '/admin') return '/admin';
  if (cleanPath.startsWith('/admin/login')) return '/admin/login';
  if (cleanPath === '/admin/services') return '/admin/services';
  if (cleanPath.startsWith('/admin')) return '/admin/dashboard';
  if (cleanPath === '/products' || cleanPath === '/products/ecosystem' || cleanPath === '/ecosystem') return '/products';
  if (cleanPath.startsWith('/product-detail') || cleanPath.startsWith('/product/detail') || cleanPath.startsWith('/product_detail')) return '/product-detail';
  if (cleanPath.startsWith('/marketplace')) return '/marketplace';
  if (cleanPath.startsWith('/book-demo') || cleanPath.startsWith('/demo')) return '/book-demo';
  if (cleanPath.startsWith('/contact')) return '/contact-sales';
  if (cleanPath.startsWith('/leadership')) return '/leadership';
  if (cleanPath.startsWith('/about')) return '/about';
  if (cleanPath.startsWith('/pricing') || cleanPath.startsWith('/plan')) return '/pricing';
  if (cleanPath.startsWith('/service')) return '/services';
  if (cleanPath.startsWith('/career') || cleanPath.startsWith('/job')) return '/careers';
  if (cleanPath.startsWith('/blog')) return '/blog';
  if (cleanPath.startsWith('/privacy')) return '/privacy';
  if (cleanPath.startsWith('/terms')) return '/terms';
  if (cleanPath.startsWith('/cookie')) return '/cookies';
  if (cleanPath.startsWith('/support') || cleanPath.startsWith('/help') || cleanPath.startsWith('/ticket')) return '/support';
  if (cleanPath.startsWith('/faq')) return '/faq';
  if (cleanPath.startsWith('/api-docs') || cleanPath.startsWith('/docs')) return '/api-docs';
  if (cleanPath.startsWith('/status')) return '/status';
  if (cleanPath.startsWith('/sitemap')) return '/sitemap';
  if (cleanPath === '/404') return '/404';
  return '/';
};


export const navigateToRoute = (route: string, sectionId?: string) => {
  const hash = sectionId ? `#${sectionId}` : '';
  const targetUrl = `${route}${hash}`;

  const currentFull = `${window.location.pathname}${window.location.search}`;
  if (currentFull !== route || window.location.hash !== hash) {
    window.history.pushState({}, '', targetUrl);
  }
  
  window.dispatchEvent(new Event('popstate'));

  if (sectionId) {
    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      }
    }, 150);
  } else {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }
};
