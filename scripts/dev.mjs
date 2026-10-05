import http from 'node:http';
import {readFile, readdir} from 'node:fs/promises';
import {DatabaseSync} from 'node:sqlite';
import {createHash} from 'node:crypto';
import worker from '../dist/server/index.js';
const db=new DatabaseSync(':memory:');
for(const file of (await readdir('drizzle')).filter(f=>f.endsWith('.sql'))) db.exec(await readFile('drizzle/'+file,'utf8'));
const env={ADMIN_KEY_HASH:createHash('sha256').update('preview-only-key-not-for-production-123456').digest('hex'),DB:{prepare(sql){return{bind(...args){return{run:async()=>db.prepare(sql).run(...args),all:async()=>({results:db.prepare(sql).all(...args)})}}}}}};
http.createServer(async(req,res)=>{try{const chunks=[];for await(const c of req)chunks.push(c);const r=await worker.fetch(new Request('http://localhost:4173'+req.url,{method:req.method,headers:req.headers,...(['GET','HEAD'].includes(req.method)?{}:{body:Buffer.concat(chunks)})}),env);res.writeHead(r.status,Object.fromEntries(r.headers));res.end(Buffer.from(await r.arrayBuffer()));}catch{res.writeHead(500);res.end('Preview error');}}).listen(4173,'127.0.0.1',()=>console.log('Local: http://localhost:4173'));

