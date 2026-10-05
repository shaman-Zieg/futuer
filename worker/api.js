const encoder = new TextEncoder();
async function authorized(request, env) {
  const key = request.headers.get('authorization')?.replace(/^Bearer /, '') || '';
  if (!env.ADMIN_KEY_HASH || key.length < 32 || key.length > 200) return false;
  const digest = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(key))), b => b.toString(16).padStart(2, '0')).join('');
  let difference = digest.length ^ env.ADMIN_KEY_HASH.length;
  for (let i = 0; i < digest.length; i++) difference |= digest.charCodeAt(i) ^ (env.ADMIN_KEY_HASH.charCodeAt(i) || 0);
  return difference === 0;
}
export async function api(request, env) {
  const url = new URL(request.url);
  const origin = request.headers.get('origin');
  const allowed = !origin || origin === url.origin || origin === 'https://shaman-zieg.github.io';
  const headers = { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff', 'vary': 'Origin' };
  if (allowed && origin) headers['access-control-allow-origin'] = origin;
  const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers });
  if (!allowed) return json({ error: '不允许的访问来源。' }, 403);
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: {...headers, 'access-control-allow-methods': 'GET, POST, OPTIONS', 'access-control-allow-headers': 'Content-Type, Authorization', 'access-control-max-age': '600'} });
  try {
    if (url.pathname === '/api/wishes' && request.method === 'POST') {
      if (!request.headers.get('content-type')?.startsWith('application/json')) return json({error:'请求格式错误。'},415);
      if (Number(request.headers.get('content-length') || 0) > 12000) return json({error:'愿望太长了。'},413);
      const reader = request.body?.getReader();
      if (!reader) return json({error:'请先写下愿望。'},400);
      const chunks=[]; let size=0;
      while (true) { const {done,value}=await reader.read(); if(done) break; size+=value.byteLength; if(size>12000) {await reader.cancel();return json({error:'愿望太长了。'},413);} chunks.push(value); }
      const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
      let body; try {body=JSON.parse(new TextDecoder().decode(bytes));} catch {return json({error:'请求格式错误。'},400);}
      if (!body || typeof body !== 'object' || Array.isArray(body)) return json({error:'请求格式错误。'},400);
      const content = typeof body.content === 'string' ? body.content.trim() : '';
      if (!content || content.length > 1000) return json({error:'请填写 1–1000 字的愿望。'},400);
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.requestId || '')) return json({error:'请刷新页面后重试。'},400);
      if (body.website) return json({error:'提交未通过检查，请刷新后重试。'},400);
      // This random ID deduplicates a retry and does not identify a visitor.
      await env.DB.prepare('INSERT INTO wishes (request_id, content, day) VALUES (?, ?, ?) ON CONFLICT(request_id) DO NOTHING').bind(body.requestId, content, new Date().toISOString().slice(0,10)).run();
      return json({ok:true},201);
    }
    if (url.pathname === '/api/admin/wishes' && request.method === 'GET') {
      if (!await authorized(request, env)) return json({error:'管理密钥不正确。'},401);
      const before = Number(url.searchParams.get('before') || Number.MAX_SAFE_INTEGER);
      if (!Number.isSafeInteger(before) || before < 1) return json({error:'无效的分页。'},400);
      const {results} = await env.DB.prepare('SELECT id, content, day FROM wishes WHERE id < ? ORDER BY id DESC LIMIT 51').bind(before).all();
      const hasMore = results.length > 50;
      return json({wishes:results.slice(0,50), next:hasMore ? results[49].id : null});
    }
    return json({error:'没有这个页面。'},404);
  } catch { return json({error:'暂时连接不上愿望箱，请稍后重试。'},503); }
}
