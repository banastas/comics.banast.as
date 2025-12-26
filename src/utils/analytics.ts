declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

export const trackPageView = (pagePath: string, pageTitle?: string): void => {
  let normalizedPath = pagePath;
  if (normalizedPath.startsWith('#')) {
    normalizedPath = normalizedPath.slice(1);
  }
  if (!normalizedPath.startsWith('/')) {
    normalizedPath = '/' + normalizedPath;
  }
  
  const fullPath = '#' + normalizedPath;
  
  if (!window.dataLayer) {
    window.dataLayer = [];
  }
  
  window.dataLayer.push({
    event: 'page_view',
    page_path: fullPath,
    page_title: pageTitle || document.title,
  });
  
  if (typeof window.gtag === 'function') {
    window.gtag('config', 'G-ZDMFMRZTBZ', {
      page_path: fullPath,
      page_title: pageTitle || document.title,
    });
  }
};

export const trackEvent = (eventName: string, eventParams?: Record<string, unknown>): void => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, eventParams);
  }
};

