import { buildSitemapXml } from '../utils/site-data';

export const GET = () => new Response(buildSitemapXml(), {
  headers: { 'Content-Type': 'application/xml; charset=utf-8' },
});
