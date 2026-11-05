import { comics } from '../../utils/site-data';

export const GET = () => new Response(JSON.stringify(comics), {
  headers: { 'Content-Type': 'application/json' },
});
