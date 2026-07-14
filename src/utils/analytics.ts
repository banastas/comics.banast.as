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

  const title = pageTitle || document.title;
  
  if (!window.dataLayer) {
    window.dataLayer = [];
  }

  if (typeof window.gtag === 'function') {
    window.gtag('event', 'page_view', {
      page_path: normalizedPath,
      page_title: title,
      page_location: window.location.href,
    });
    return;
  }

  // Preserve the event for a delayed analytics bootstrap without double-sending
  // when gtag is already available.
  window.dataLayer.push({
    event: 'page_view',
    page_path: normalizedPath,
    page_title: title,
    page_location: window.location.href,
  });
};

export const trackEvent = (eventName: string, eventParams?: Record<string, unknown>): void => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, eventParams);
  }
};
