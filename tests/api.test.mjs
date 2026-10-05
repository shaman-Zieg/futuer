import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {api} from '../worker/api.js';
test('wish storage, deduplication and admin access',async()=>{
const db=new DatabaseSync(':memory:');for(const f of readdirSync('drizzle').filter(f=>f.endsWith('.sql')))db.exec(readFileSync('drizzle/'+f,'utf8'));
const key='test-only-key-12345678901234567890123456789';const env={ADMIN_KEY_HASH:createHash('sha256').update(key).digest('hex'),DB:{prepare(sql){return{bind(...args){return{run:async()=>db.prepare(sql).run(...args),all:async()=>({results:db.prepare(sql).all(...args)})}}}}}};
const post=body=>api(new Request('https://test/api/wishes',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)}),env);
const body={content:'愿明天更好 <script>alert(1)</script>',requestId:crypto.randomUUID()};
assert.equal((await post(body)).status,201);assert.equal((await post(body)).status,201);
assert.equal((await post({...body,content:' '})).status,400);assert.equal((await post({...body,content:'x'.repeat(1001)})).status,400);
assert.equal((await api(new Request('https://test/api/admin/wishes'),env)).status,401);
assert.equal((await api(new Request('https://test/api/admin/wishes',{headers:{Authorization:'Bearer wrong'}}),env)).status,401);
const result=await (await api(new Request('https://test/api/admin/wishes',{headers:{Authorization:'Bearer '+key}}),env)).json();
assert.equal(result.wishes.length,1);assert.equal(result.wishes[0].content,body.content);assert.deepEqual(Object.keys(result.wishes[0]).sort(),['content','day','id']);
const cors=await api(new Request('https://test/api/wishes',{method:'OPTIONS',headers:{Origin:'https://shaman-zieg.github.io'}}),env);assert.equal(cors.headers.get('access-control-allow-origin'),'https://shaman-zieg.github.io');
assert.equal((await api(new Request('https://test/api/wishes',{method:'OPTIONS',headers:{Origin:'https://evil.example'}}),env)).status,403);db.close();
});

