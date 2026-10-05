import {randomBytes,createHash} from 'node:crypto';
import {writeFileSync,existsSync,readFileSync} from 'node:fs';
const path='../wishbox-admin-private.txt';
if(!existsSync(path)){const key=randomBytes(32).toString('base64url');writeFileSync(path,'匿名愿望箱管理密钥（请勿上传或分享）\n'+key+'\n\n管理入口：https://futuer-wishbox.misty-clock-3308.chatgpt.site/#admin\n');}
const key=readFileSync(path,'utf8').split('\n')[1];console.log(createHash('sha256').update(key).digest('hex'));
