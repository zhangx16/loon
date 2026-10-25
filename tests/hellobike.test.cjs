const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const source = fs.readFileSync(path.join(__dirname, '../scripts/hellobike/easybike-ad.js'), 'utf8');
const script = new vm.Script(source);
const plugin = fs.readFileSync(path.join(__dirname, '../plugins/hellobike-clean.plugin'), 'utf8');
const STATIC = '0199bec97dfa5e0d';
const DYNAMIC = '0123456789abcdef';
const HEADER = 'X-Loon-HelloBike-Context';
const CACHE = 'HelloBikeLoonKeyCacheV1';
const api = 'https://api.hellobike.com/api';
let checks = 0;
function encrypt(text, secret = STATIC) {
  const key = Buffer.from(secret);
  const cipher = crypto.createCipheriv('aes-128-cbc', key, key);
  return Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]).toString('base64');
}
function decrypt(text, secret = STATIC) {
  const key = Buffer.from(secret);
  const cipher = crypto.createDecipheriv('aes-128-cbc', key, key);
  return Buffer.concat([cipher.update(text, 'base64'), cipher.final()]).toString('utf8');
}
function runtime() {
  const store = new Map();
  const notifications = [];
  let clock = Date.now();
  let random = 0;
  function run(request, response) {
    const calls = [];
    const math = Object.create(Math);
    math.random = () => (++random) / 10000000000;
    const globals = {
      $request: request,
      $persistentStore: {
        read: key => store.get(key),
        write(value, key) {
          if (value === undefined) store.delete(key);
          else store.set(key, value);
          return true;
        }
      },
      $notification: {post: (...args) => notifications.push(args)},
      $done: value => calls.push(value),
      Math: math,
      Date: class extends Date { static now() { return clock; } }
    };
    if (response !== undefined) globals.$response = response;
    script.runInNewContext(globals, {timeout: 1000});
    assert.equal(calls.length, 1, 'exactly one $done per invocation');
    checks++;
    return JSON.parse(JSON.stringify(calls[0]));
  }
  function request(meta, opts = {}) {
    const result = {url:opts.url || api, method:'POST', headers:{'Content-Type':'text/plain', ...opts.headers}, body:opts.encrypted ? encrypt(JSON.stringify(meta), opts.secret) : JSON.stringify(meta)};
    const output = run(result);
    if (output.headers) result.headers = output.headers;
    return result;
  }
  function response(req, body, options = {}) {
    const copy = {...req};
    if (!options.requestBody) delete copy.body;
    return run(copy, {status: options.status || 200, headers:{}, body});
  }
  return {store, notifications, run, request, response, advance: ms => {clock += ms;}};
}
function changed(meta, data, expected) {
  const r = runtime();
  const req = r.request(meta);
  assert.match(req.headers[HEADER], /^\d{1,24}$/);
  assert.equal(req.headers['Content-Type'], 'text/plain');
  const result = r.response(req, JSON.stringify({code:0, data}));
  assert.deepEqual(JSON.parse(result.body), {code:0, data:expected});
  assert.equal(r.store.size, 0, 'consume context after response');
}
const card = {cardId:'ad', cardType:'recommend', cardInfo:{}};
for (const pageId of ['platform_home', 'platform_me']) {
  changed({action:'homepage.feeds.data',pageId}, {hasMore:true,list:[card],keep:1}, {hasMore:false,list:[],keep:1});
  changed({action:'homepage.feeds.second.data',pageId}, [card], []);
}
changed({action:'homepage.waterfall.module.data'}, {materialList:[1],needRequest:1,pageIndex:0}, {materialList:[],needRequest:0,pageIndex:0});
changed({action:'homepage.module.newdata'}, {moduleList:[{moduleKey:'homepage_waterfall_module'},{moduleKey:'homepage_feeds_module'},{moduleKey:'homepage_keyposition',moduleData:{gridList:[{gridName:'借 钱'},{gridName:'骑行'}]}},{moduleKey:'keep'}]}, {moduleList:[{moduleKey:'homepage_keyposition',moduleData:{gridList:[{gridName:'骑行'}]}},{moduleKey:'keep'}]});
changed({action:'homepage.startup.popupWindow'}, [{popupWindowType:'marketAd',popupWindowData:{}},{popupWindowType:'financeRecommendPopup',popupWindowData:{}},{popupWindowType:'keep',popupWindowData:{}}], [{popupWindowType:'keep',popupWindowData:{}}]);
changed({action:'adx.ssp.show'}, {adm:[{impid:'1',creative:[1],backupCreative:[2],adAllianceMappings:{ad:1},keep:3}]}, {adm:[{impid:'1',creative:[],backupCreative:[],adAllianceMappings:{},keep:3}]});
changed({action:'lego.bff.data',pageCode:'LEGO_MY_PAGE'}, [{moduleKey:'LEGO_MY_PAGE_FEEDS',moduleData:{}},{moduleKey:'LEGO_MY_PAGE_CURATED_GRID',moduleData:{items:[{gridName:'邀请车主'},{gridName:'福利中心'}]}},{moduleKey:'keep',moduleData:{}}], [{moduleKey:'keep',moduleData:{}}]);
changed({action:'lego.bff.data',pageCode:'LEGO_MY_PAGE'}, [{moduleKey:'LEGO_MY_PAGE_MY_WALLET',moduleType:2,moduleData:{dslUrl:'https://resource.51downapp.cn/2c616bdaab8255dec1c8428d5b9c18b4.json?md5=2c616bdaab8255dec1c8428d5b9c18b4',financeEntries:[{type:'lending'}],walletUrl:'hellobike://wallet'}}], []);
changed({action:'homepage.shortcut.scene.perception'}, {taxiBannerConfig:{bannerCouponInfoNew:{styleUrl:'https://resource.51downapp.cn/c4c107668f5005ecd51924636eca3213.json?md5=c4c107668f5005ecd51924636eca3213',backgroundImage:'https://assets.51downapp.cn/platform/7b09ca8186d2480f9493158b14b80197'},title:'ad',promoText:'ad',jumpUrl:'ad',keep:1}}, {taxiBannerConfig:{bannerCouponInfoNew:null,title:'',promoText:'',jumpUrl:'',keep:1}});

// Capture a synthetic dynamic key using Loon's numeric status and storage APIs.
const dynamic = runtime();
const keyRequest = {url:'https://api.hellobike.com/secretkey',method:'POST',headers:{}};
const keyBody = encrypt(JSON.stringify({code:0,data:{key:DYNAMIC,'key-version':'v1','fingerprint-hash':'fp',expired:Math.floor(Date.now()/1000)+3600}}));
assert.deepEqual(dynamic.run(keyRequest,{status:200,body:keyBody}), {});
assert.equal(JSON.parse(dynamic.store.get(CACHE)).records[0].secret, DYNAMIC);
assert.equal(dynamic.notifications.length, 1);
dynamic.run(keyRequest,{status:200,body:keyBody});
assert.equal(dynamic.notifications.length, 1, 'do not repeat known-key notification');
const dynReq = dynamic.request({action:'homepage.feeds.data',pageId:'platform_home'}, {encrypted:true,secret:DYNAMIC,headers:{'Key-Version':'v1','Fingerprint-Hash':'fp'}});
const dynRes = dynamic.response(dynReq, encrypt('{"code":0,"data":{"hasMore":true,"list":[],"id":9223372036854775807,"decimal":1.2300,"exp":1e+25}}',DYNAMIC));
const dynText = decrypt(dynRes.body,DYNAMIC);
assert.ok(dynText.includes('9223372036854775807'));
assert.ok(dynText.includes('1.2300'));
assert.ok(dynText.includes('1e+25'));
assert.equal(JSON.parse(dynText).data.hasMore, false);
for (const quoted of [false,true]) {
  const r = runtime();
  const req = r.request({action:'homepage.feeds.data',pageId:'platform_home'},{encrypted:true});
  const encrypted = encrypt(JSON.stringify({code:0,data:{hasMore:true,list:[card]}}));
  const result = r.response(req,quoted ? JSON.stringify(encrypted) : encrypted);
  assert.deepEqual(JSON.parse(decrypt(quoted ? JSON.parse(result.body) : result.body)), {code:0,data:{hasMore:false,list:[]}});
}

// Requests may finish out of order; there must be no cross-request action reuse.
const concurrent = runtime();
const first = concurrent.request({action:'homepage.feeds.data',pageId:'platform_home'});
const second = concurrent.request({action:'homepage.startup.popupWindow'});
assert.notEqual(first.headers[HEADER],second.headers[HEADER]);
assert.deepEqual(JSON.parse(concurrent.response(second,'{"code":0,"data":[{"popupWindowType":"marketAd","popupWindowData":{}}]}').body).data, []);
assert.equal(JSON.parse(concurrent.response(first,'{"code":0,"data":{"hasMore":true,"list":[]}}').body).data.hasMore,false);

// Hash-slot collisions, expiration, missing context and malformed inputs pass through.
for (const mode of ['collision','expired','missing','non200','invalidJSON','wrongKey','headerMismatch','wrongPage']) {
  const r = runtime();
  const req = r.request({action:'homepage.feeds.data',pageId: mode === 'wrongPage' ? 'checkout' : 'platform_home'});
  if (mode === 'collision') {
    for (const [key,value] of r.store) {
      const record = JSON.parse(value); record.contextID = '123'; r.store.set(key,JSON.stringify(record));
    }
  }
  if (mode === 'expired') r.advance(180001);
  if (mode === 'missing') delete req.headers[HEADER];
  if (mode === 'headerMismatch') req.headers.action = 'lego.bff.data';
  const body = mode === 'invalidJSON' ? 'not json' : mode === 'wrongKey' ? encrypt('{"code":0,"data":{}}',DYNAMIC) : '{"code":0,"data":{"hasMore":true,"list":[]}}';
  assert.deepEqual(r.response(req,body,{status: mode === 'non200' ? 500 : 200}),{},mode);
}
const invalidCapture = runtime();
invalidCapture.run(keyRequest,{status:500,body:keyBody});
invalidCapture.run(keyRequest,{status:200,body:JSON.stringify({code:0,data:{key:DYNAMIC}})});
assert.equal(invalidCapture.store.size,0);
const expiredKey = runtime();
expiredKey.run(keyRequest,{status:200,body:encrypt(JSON.stringify({code:0,data:{key:DYNAMIC,'key-version':'v1','fingerprint-hash':'fp',expired:1}}))});
assert.equal(expiredKey.store.size,0);

// A local request response must be wrapped and keep the upstream template hashes.
const styleBase = 'https://resource.51downapp.cn/f414fbc17c411b4e986ba8891c738a49.json';
const styleUrl = styleBase + '?md5=e5230c919f7e3f3af3256161fbfaa0e2&hbe_qx_ui=1.3';
const echo = runtime();
const local = echo.run({url:styleUrl,method:'GET',headers:{}}).response;
assert.equal(local.status,200);
assert.equal(crypto.createHash('md5').update(local.body).digest('hex'),'e5230c919f7e3f3af3256161fbfaa0e2');
assert.equal(crypto.createHash('sha256').update(local.body).digest('hex'),'250a8f7cbd00aee3ad6ad986ffe72170518d6b4666804827c458964dae576a58');
assert.equal(echo.run({url:styleBase+'?md5=bad',method:'GET'}).response.status,503);
const capital = runtime();
const capitalReq = capital.request({action:'lego.bff.data',pageCode:'LEGO_MY_PAGE'});
const capitalRes = capital.response(capitalReq,JSON.stringify({code:0,data:[{moduleKey:'LEGO_MY_PAGE_MY_CAPITAL_NEW',moduleType:2,moduleData:{dslUrl:styleBase+'?md5=f414fbc17c411b4e986ba8891c738a49',recommendedSlot:{ad:1},keep:1}}]}));
const moduleData = JSON.parse(capitalRes.body).data[0].moduleData;
assert.equal(moduleData.dslUrl,styleUrl);
assert.equal(moduleData.recommendedSlot,null);
assert.equal(moduleData.keep,1);

// Direct request bodies, case-insensitive headers and unavailable storage.
const direct = runtime();
const directReq = {url:api,method:'POST',headers:{},body:JSON.stringify({action:'homepage.feeds.data',pageId:'platform_home'})};
assert.equal(JSON.parse(direct.response(directReq,'{"code":0,"data":{"hasMore":true,"list":[]}}',{requestBody:true}).body).data.hasMore,false);
const conflict = runtime();
const conflictReq = conflict.request({action:'homepage.feeds.data',pageId:'platform_home'});
conflictReq.body = JSON.stringify({action:'homepage.feeds.data',pageId:'platform_me'});
assert.deepEqual(conflict.response(conflictReq,'{"code":0,"data":{"hasMore":true,"list":[]}}',{requestBody:true}),{});
const lowerCase = runtime();
const lowerReq = lowerCase.request({action:'homepage.feeds.data',pageId:'platform_home'});
lowerReq.headers[HEADER.toLowerCase()] = lowerReq.headers[HEADER];
delete lowerReq.headers[HEADER];
assert.equal(JSON.parse(lowerCase.response(lowerReq,'{"code":0,"data":{"hasMore":true,"list":[]}}').body).data.hasMore,false);
for (const storage of [undefined,{read:()=>null,write:()=>false},{read:()=>'{broken json',write:()=>{throw new Error('unavailable');}}]) {
  const calls = [];
  script.runInNewContext({$request:directReq,$persistentStore:storage,$done:v=>calls.push(v)},{timeout:1000});
  assert.equal(calls.length,1);
  assert.equal(JSON.stringify(calls[0]),'{}');
  checks++;
}

// Configuration coverage and paths.
const routes = plugin.split('\n').filter(l => /^http-(request|response) /.test(l));
const rewrites = plugin.split('\n').filter(l => l.endsWith(' reject-200'));
assert.equal(routes.length,4);
assert.equal(rewrites.length,4);
const hosts = plugin.match(/^hostname = (.+)$/m)[1].split(',').map(s=>s.trim());
assert.equal(hosts.length,9);
for (const line of routes) {
  new RegExp(line.split(' ')[1]);
  assert.ok(line.includes('script-path=https://raw.githubusercontent.com/zhangx16/loon/main/scripts/hellobike/easybike-ad.js,'));
  assert.ok(line.includes('binary-body-mode=false'));
}
assert.ok(new RegExp(routes[0].split(' ')[1]).test(styleUrl));
for (const line of rewrites) new RegExp(line.split(' ')[0]);
assert.ok(!/\$prefs|\$notify|\.statusCode/.test(source));
console.log(`PASS: ${checks} Loon script invocations; AES round trips, key capture, concurrency, local template hashes, pass-through guards; 4 rewrites, 4 scripts, 9 MitM hosts. Device validation pending.`);
