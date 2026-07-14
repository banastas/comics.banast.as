// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { trackPageView } from './analytics';

describe('analytics page views', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/storage/CB-01?tab=collection');
    document.title = 'CB-01 Storage | comics.banast.as';
    window.dataLayer = [];
    Reflect.deleteProperty(window, 'gtag');
  });

  it('tracks canonical clean paths through gtag without a duplicate dataLayer event', () => {
    const gtag = vi.fn();
    window.gtag = gtag;

    trackPageView('/storage/CB-01?tab=collection');

    expect(gtag).toHaveBeenCalledWith('event', 'page_view', {
      page_path: '/storage/CB-01?tab=collection',
      page_title: 'CB-01 Storage | comics.banast.as',
      page_location: 'http://localhost:3000/storage/CB-01?tab=collection',
    });
    expect(window.dataLayer).toEqual([]);
  });

  it('normalizes legacy hash paths for delayed analytics bootstraps', () => {
    trackPageView('#/comic/2010-issue-1-23', '2010 #1');

    expect(window.dataLayer).toEqual([{
      event: 'page_view',
      page_path: '/comic/2010-issue-1-23',
      page_title: '2010 #1',
      page_location: 'http://localhost:3000/storage/CB-01?tab=collection',
    }]);
  });
});
