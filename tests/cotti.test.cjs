const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const crypto = require('node:crypto');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname,'../scripts/cotti/cotti.js'),'utf8');
const plugin = fs.readFileSync(path.join(__dirname,'../plugins/cotti-clean.plugin'),'utf8');
const url = 'https://gateway.cotticoffee.com/cotti-capi/customer/position/list';
const key = Buffer.from('376a69336b6a66793670316a64376636','hex');
const iv = Buffer.from('396637686b733633686a343964376236','hex');
let count = 0;
function encrypt(value) {
  const cipher = crypto.createCipheriv('aes-128-cbc',key,iv);
  return Buffer.concat([cipher.update(JSON.stringify(value),'utf8'),cipher.final()]).toString('base64');
}
function run(body, requestUrl = url) {
  const request = {url:requestUrl,method:'POST',headers:{Authorization:'synthetic-test'},body};
  const snapshot = JSON.stringify(request);
  const calls = [];
  vm.runInNewContext(source, {$request:request,$done:result=>calls.push(result)}, {timeout:1000});
  assert.equal(calls.length,1,'exactly one completion');
  assert.equal(JSON.stringify(request),snapshot,'original request remains intact');
  assert.ok(calls[0] && typeof calls[0] === 'object','never use bare $done() for normal requests');
  count++;
  return JSON.parse(JSON.stringify(calls[0]));
}
for (const code of ['new-float-common','new-cotti-window-common','cotti-order-share-window','cotti-order-share-float','cotti-launch-window']) {
  const body = JSON.stringify({data:encrypt({code,storeId:123,extra:'中文推广内容'})});
  assert.deepEqual(run(body),{response:{status:404,headers:{'Content-Type':'application/json'},body:'{}'}});
}
for (const code of ['normal-menu','order-detail','',null]) {
  assert.deepEqual(run(JSON.stringify({data:encrypt({code,keep:1})})),{});
}
for (const value of [undefined,'','not json','null','{}','[]','{"data":null}','{"data":123}','{"data":"not ciphertext"}',JSON.stringify({data:encrypt({keep:1})})]) {
  assert.deepEqual(run(value),{});
}
const blocked = JSON.stringify({data:encrypt({code:'cotti-launch-window'})});
assert.deepEqual(run(blocked,url+'?version=1'),{},'preserve exact-path upstream match');
assert.deepEqual(run(blocked,url.replace('gateway.cotticoffee.com','example.com')),{});
const httpUrl=url.replace('https:','http:');
assert.equal(run(blocked,httpUrl).response.status,404);
const requestLine=plugin.split('\n').find(l=>l.startsWith('http-request '));
const route=new RegExp(requestLine.split(' ')[1]);
assert.ok(route.test(url)); assert.ok(route.test(httpUrl));
assert.ok(!route.test(url+'?version=1'));
assert.ok(requestLine.includes('requires-body=true,binary-body-mode=false'));
assert.ok(requestLine.includes('script-path=https://raw.githubusercontent.com/zhangx16/loon/main/scripts/cotti/cotti.js,'));
const rejectLine=plugin.split('\n').find(l=>l.endsWith(' reject-dict'));
assert.ok(new RegExp(rejectLine.split(' ')[0]).test(url.replace('/list','/adSortList')+'?version=1'));
assert.ok(plugin.includes('hostname = gateway.cotticoffee.com'));
console.log(`PASS: ${count} request cases; all 5 ad codes, independent AES fixtures, normal requests, malformed bodies, single completion and plugin routes. Device validation pending.`);
