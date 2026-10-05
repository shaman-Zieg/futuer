import { api } from './api.js';
const page = /* EMBED_PAGE */;
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/')) return api(request, env);
    if (url.pathname === '/config.js') return new Response('window.WISHBOX_API = "";', {headers:{'content-type':'text/javascript; charset=utf-8'}});
    if ((url.pathname === '/' || url.pathname === '/admin') && request.method === 'GET') return new Response(page, {headers:{
      'content-type':'text/html; charset=utf-8', 'cache-control':'no-store',
      'referrer-policy':'no-referrer', 'x-content-type-options':'nosniff',
      'content-security-policy':"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' https://futuer-wishbox.misty-clock-3308.chatgpt.site; frame-ancestors 'self'; base-uri 'none'; form-action 'self'",
      'permissions-policy':'camera=(), microphone=(), geolocation=()'
    }});
    return new Response('Not found',{status:404});
  }
};
