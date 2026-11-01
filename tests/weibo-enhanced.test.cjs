const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname,'..');
const source = fs.readFileSync(path.join(root,'scripts/weibo/weibo-json.js'),'utf8');
const plugin = fs.readFileSync(path.join(root,'plugins/weibo-enhanced.plugin'),'utf8');
const compiled = new vm.Script(source);
const store = new Map();
const base = 'https://api.weibo.cn/__qx_weibo_settings__/';
const routes = plugin.split('\n').filter(l=>/^http-(request|response) /.test(l)).map(line=>({stage:line.split(' ')[0],pattern:new RegExp(line.split(' ')[1]),line}));
let count=0,networkCalls=0;
function run(url,{method='GET',body,headers={},response}={}) {
  const stage = response === undefined ? 'http-request' : 'http-response';
  assert.equal(routes.filter(r=>r.stage===stage&&r.pattern.test(url)).length,1,'exactly one applicable script entry');
  const calls=[];
  const scope={
    $loon:'Loon test',
    $request:{url,method,body,headers},
    $persistentStore:{read:key=>store.get(key),write:(value,key)=>{store.set(key,value);return true;}},
    $httpClient:{get:(options,callback)=>{networkCalls++;callback('network disabled in test');}},
    $done:result=>calls.push(result),
    console:{log(){}},setTimeout:()=>0,clearTimeout(){}
  };
  if(response!==undefined) scope.$response={status:200,headers:{},body:response};
  compiled.runInNewContext(scope,{timeout:5000});
  assert.equal(calls.length,1,'one completion per invocation');
  count++;
  return JSON.parse(JSON.stringify(calls[0]));
}
function config(){const r=run(base+'api/config');assert.equal(r.response.status,200);return JSON.parse(r.response.body);}
function post(action,data){return run(base+'api/'+action,{method:'POST',body:typeof data==='string'?data:JSON.stringify(data),headers:{'Content-Type':'application/json','X-Weibo-Settings':'1',Origin:'https://api.weibo.cn',Referer:base}});}
const page=run(base).response;
assert.equal(page.status,200);
assert.ok(page.headers['Content-Type'].startsWith('text/html'));
assert.ok(page.body.includes('更新日志'));
assert.ok(page.body.includes('hiddenFollowingGroups'));
assert.ok(page.body.includes('hideHomeRecommendTab'));
const initial=config();
assert.equal(initial.version,'0.1.52');
assert.equal(initial.config.startupImageSource,'off');
assert.equal(initial.config.hideHomeRecommendTab,false);
assert.deepEqual(initial.config.hiddenFollowingGroups,[]);
assert.deepEqual(Object.keys(initial.followingGroups),['all','special','friends','original','video','vplus','group']);
for(const key of Object.keys(initial.followingGroups)) {
  const saved=post('save',{hiddenFollowingGroups:[key],hideHomeRecommendTab:true});
  assert.equal(saved.response.status,200);
  const after=config().config;
  assert.deepEqual(after.hiddenFollowingGroups,[key]);
  assert.equal(after.hideHomeRecommendTab,true);
}
assert.equal(store.size,1,'all configuration stays in one local storage key');
assert.ok(store.has('weibo_adblock_config_v3'));
assert.equal(post('save',{hiddenFollowingGroups:[],hideHomeRecommendTab:false}).response.status,200);
assert.equal(config().config.hideHomeRecommendTab,false);
// Exercise real Loon runtime with upstream feed structure, not exported helpers.
const feedURL='https://api.weibo.cn/2/statuses/container_timeline_hot?x=1';
const normal={category:'feed',data:{id:'1',text:'normal content'}};
const promoted={category:'feed',data:{id:'2',promotion:{type:'ad'}}};
const payload=JSON.stringify({items:[normal,promoted],keep:1});
assert.deepEqual(JSON.parse(run(feedURL,{response:payload}).body),{items:[normal],keep:1});
post('save',{enabled:false});
assert.equal(run(feedURL,{response:payload}).body,payload,'global switch disables feed filtering');
assert.equal(post('reset',{}).response.status,400,'reset requires the explicit upstream reset flag');
assert.equal(post('reset',{reset:true}).response.status,200);
assert.deepEqual(config().config,initial.config,'reset restores defaults');
assert.deepEqual(JSON.parse(run(feedURL,{response:payload}).body),{items:[normal],keep:1});
for(const malformed of ['not json','','null']) {
  const result=run(feedURL,{response:malformed});
  assert.ok(!('body' in result)||result.body===malformed,'unknown body passes unchanged');
}
const badSave=post('save','{invalid');
assert.equal(badSave.response.status,400);
assert.deepEqual(config().config,initial.config);
assert.equal(networkCalls,0,'default settings and cleanup make no external fetches');
// Every documented upstream route is covered, including its query string form.
const scope={module:{exports:{}},console:{log(){}}};
compiled.runInNewContext(scope,{timeout:5000});
for(const route of scope.module.exports.ROUTES) {
  const url='https://'+route.host+route.path+'?test=1';
  assert.equal(routes.filter(r=>r.stage==='http-response'&&r.pattern.test(url)).length,1,url);
}
assert.equal(routes.length,6);
for(const r of routes){assert.ok(r.line.includes('binary-body-mode=false'));if(r.stage==='http-response'||r.line.includes('save|reset'))assert.ok(r.line.includes('requires-body=true'));}
const quic=plugin.split('\n').filter(l=>l.startsWith('AND,'));
const hosts=plugin.match(/^hostname = (.+)$/m)[1].split(', ');
assert.equal(hosts.length,4);assert.equal(quic.length,4);
for(const host of hosts)assert.ok(quic.includes(`AND,((DOMAIN,${host}),(PROTOCOL,QUIC)),REJECT`));
for(const url of ['https://api.weibo.cn/2/statuses/container_timeline_hotOther','https://example.com/__qx_weibo_settings__/'])assert.ok(!routes.some(r=>r.pattern.test(url)));
const expectedHash=plugin.match(/脚本 SHA-256：([a-f0-9]{64})/)[1];
assert.equal(crypto.createHash('sha256').update(source).digest('hex'),expectedHash);
console.log(`PASS: ${count} Loon runtime calls; settings page/config/save/reset, 7 independent groups, recommendation tab, persistent storage, feed filtering, disable/pass-through, all upstream routes and 4 scoped QUIC rules. Device validation pending.`);
