const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const zlib = require('node:zlib');
const root = path.resolve(__dirname,'..');
const scripts = {
  sports:fs.readFileSync(path.join(root,'scripts/tencent-sports/zenmo-clean.js'),'utf8'),
  video:fs.readFileSync(path.join(root,'scripts/tencent-video/ad-clean.js'),'utf8')
};
let cases = 0;
function run(kind,url,body,{requestBody,headers={},request=false,status=200}={}) {
  const calls=[];
  const req={url,method:'POST',headers,body:request ? body : requestBody};
  const scope={$request:req,console:{log(){}},$done:v=>calls.push(v)};
  if (!request) scope.$response={status,headers:{},body};
  vm.runInNewContext(scripts[kind],scope,{timeout:1500});
  assert.equal(calls.length,1,'exactly one completion');
  assert.ok(!('bodyBytes' in calls[0]),'Loon returns body, not bodyBytes');
  cases++;
  return calls[0];
}
function json(url,input,expected,opts={}) {
  const result=run('sports','https://app.sports.qq.com/'+url,JSON.stringify(input),opts);
  assert.deepEqual(JSON.parse(result.body),expected);
}
const cat=(...parts)=>Buffer.concat(parts.map(p=>Buffer.from(p)));
function vi(n) {const a=[]; do {const b=n%128;n=Math.floor(n/128);a.push(b+(n?128:0));}while(n);return Buffer.from(a);}
const pb=(n,value)=>{const b=typeof value==='string'?Buffer.from(value):value;return cat(vi(n*8+2),vi(b.length),b);};
function readPb(input) {
  const b=Buffer.from(input);let p=0;const out=[];
  function integer(){let n=0,m=1;for(let i=0;i<8;i++){assert.ok(p<b.length);const v=b[p++];n+=(v&127)*m;if(!(v&128))return n;m*=128;}throw Error('varint');}
  while(p<b.length){const t=integer(),f=Math.floor(t/8),w=t%8;if(w===0)out.push({f,w,v:integer()});else {assert.equal(w,2);const n=integer();assert.ok(p+n<=b.length);out.push({f,w,v:b.subarray(p,p+n)});p+=n;}}
  return out;
}
const mapEntry=(key,value)=>pb(3,cat(pb(1,key),pb(2,cat(pb(1,value),pb(4,key)))));
const ab=(entries)=>cat(vi(8),vi(100),...entries);
const abURL='https://config.ab.qq.com/tab/GetTabRemoteConfig?x=1';
const sportsHeaders={'uSeR-aGeNt':'QQSportsV3/8.0'};
const sportsAB=ab([mapEntry('iqad_splash_forbid_splash','0'),mapEntry('unrelated','keep')]);
const sportsOut=run('sports',abURL,new Uint8Array(sportsAB),{headers:sportsHeaders}).body;
assert.ok(ArrayBuffer.isView(sportsOut));
function entries(b){return Object.fromEntries(readPb(b).filter(x=>x.f===3).map(x=>{const e=readPb(x.v);const key=e.find(f=>f.f===1).v.toString();const inner=readPb(e.find(f=>f.f===2).v);return [key,inner.find(f=>f.f===1).v.toString()];}));}
assert.deepEqual(entries(sportsOut),{iqad_splash_forbid_splash:'1',unrelated:'keep',teenager_guide_show_interval:'36500'});
assert.equal(JSON.stringify(run('sports',abURL,sportsAB,{headers:{'User-Agent':'QQLive/1'}})),'{}');
assert.equal(JSON.stringify(run('sports',abURL,sportsAB,{headers:sportsHeaders,status:500})),'{}');
assert.equal(JSON.stringify(run('sports',abURL,Buffer.from([0xff]),{headers:sportsHeaders})),'{}');
json('init/config',{data:{middleIcon:{isAble:'1',keep:1}}},{data:{middleIcon:{isAble:'0',keep:1}}});
json('user/homePageV2',{data:{moduleList:[{moduleType:804},{moduleType:810},{moduleType:816},{moduleType:817},{moduleType:1}]}},{data:{moduleList:[{moduleType:1}]}});
json('m/match/liveSum',{data:{sum:3,mids:{one:1},keep:1}},{data:{sum:0,mids:{},keep:1}});
json('match/multiUpdate',{data:{one:{matchInfo:{}}}},{data:{}});
json('feeds/home',{data:{topItem:[{type:1120},{type:1,adInfos:[1]}],list:[{adInfos:[1],keep:1}],hotWords:[1],coinIcon:{ad:1},adList:'ad'}},{data:{topItem:[{type:1,adInfos:[]}],list:[{adInfos:[],keep:1}],hotWords:[],adList:''}});
json('feeds/list',{data:{topItem:[{type:1120},{type:1}],hotWords:['keep'],coinIcon:{keep:1}}},{data:{topItem:[{type:1}],hotWords:['keep'],coinIcon:{keep:1}}});
const xml='<key>adOn</key><string>YES</string><key>gdtAdOn</key><string>YES</string><key>other</key><string>YES</string>';
assert.equal(run('sports','https://k.ssp.qq.com/getsdkconfig',xml,{headers:sportsHeaders}).body,xml.replace(/(<key>(?:adOn|gdtAdOn)<\/key><string>)YES/g,'$1NO'));
assert.equal(JSON.stringify(run('sports','https://k.ssp.qq.com/getsdkconfig',xml)), '{}');
const ssp='https://sports.ssp.qq.com/app';
const reqData={adReqData:{adtype:7,chid:5,launch:0,slot:[{loid:'71,73'}]}};
const req=run('sports',ssp,JSON.stringify(reqData),{request:true,headers:{'Content-Type':'application/json'}});
assert.equal(req.headers['X-Loon-Sports-SSP-Target'],'1');
assert.equal(req.headers['Content-Type'],'application/json');
const sspBody=JSON.stringify({adList:JSON.stringify({index:[{channel_id:7247}],order:[1],keep:1})});
const sspOut=run('sports',ssp,sspBody,{headers:req.headers});
assert.deepEqual(JSON.parse(JSON.parse(sspOut.body).adList),{index:[{channel_id:7247}],order:[],keep:1});
const no=run('sports',ssp,'{}',{request:true,headers:{'x-loon-sports-ssp-target':'1'}});
assert.equal(no.headers['X-Loon-Sports-SSP-Target'],'0');
assert.equal(JSON.stringify(run('sports',ssp,sspBody,{headers:no.headers})),'{}');
assert.equal(JSON.stringify(run('sports',ssp,sspBody)),'{}');
assert.equal(JSON.stringify(run('sports',ssp,JSON.stringify({adList:JSON.stringify({index:[{channel_id:1}],order:[1]})}),{headers:req.headers})),'{}');

// AB binary response: preserve other keys and support gzip with independent zlib.
const videoAB=ab([
  mapEntry('simple_mode_config',JSON.stringify({enable:0,feature_config:{enable:0,keep:1}})),
  mapEntry('ios_nx_netframework_compatible',JSON.stringify({quic:{enabled:true,allPbReqEnabled:true,allJceReqEnabled:true,keep:1}})),
  mapEntry('network_resolve_config',JSON.stringify({enablePreResolve:true,enableNac:true,enableHdns:true,keep:1})),
  mapEntry('unrelated','keep')
]);
for(const gz of [false,true]) {
  const input=gz?zlib.gzipSync(videoAB):videoAB;
  const result=run('video',abURL,new Uint8Array(input)).body;
  assert.ok(ArrayBuffer.isView(result));
  const data=entries(gz?zlib.gunzipSync(result):result);
  assert.equal(data.unrelated,'keep');
  const simple=JSON.parse(data.simple_mode_config);
  assert.equal(simple.enable,1);assert.equal(simple.feature_config.tab_bar_cut_whitelist,'0;4');assert.equal(simple.feature_config.keep,1);
  assert.deepEqual(JSON.parse(data.ios_nx_netframework_compatible).quic,{enabled:false,allPbReqEnabled:false,allJceReqEnabled:false,keep:1});
  assert.deepEqual(JSON.parse(data.network_resolve_config),{enablePreResolve:false,enableNac:false,enableHdns:false,keep:1});
}
assert.ok(entries(run('video',abURL,ab([mapEntry('unrelated','keep')])).body).simple_mode_config);
const delivery='https://rdelivery.qq.com/v1/sdkconfig/get';
assert.equal(run('video',delivery,'{"tab_gray":true,"keep":1}').body,'{"tab_gray":false,"keep":1}');
assert.equal(JSON.stringify(run('video',delivery,'{"tab_gray":false}')),'{}');

function frame(header,body){const head=Buffer.alloc(16);head[0]=9;head[1]=0x30;head.writeUInt16BE(header.length,8);const out=cat(head,header,body);out.writeUInt32BE(out.length,4);return out;}
const blocked='/trpc.business_splash.ad_ssp_splash.splashService/GetSplashPreload';
const videoURL='https://i.video.qq.com/';
for(const gz of [false,true]) {
  const original=frame(pb(7,blocked),pb(1,'keep'));
  const result=run('video',videoURL,gz?zlib.gzipSync(original):original,{request:true}).body;
  const raw=gz?zlib.gunzipSync(result):Buffer.from(result);
  assert.equal(raw.length,original.length);
  assert.equal(raw.readUInt32BE(4),raw.length);
  assert.ok(raw.includes(Buffer.from('/XetSplashPreload')));
  assert.ok(raw.subarray(raw.length-pb(1,'keep').length).equals(pb(1,'keep')));
}
const keep=pb(1,'normal');
const ad=pb(3,pb(1,pb(1,'type.googleapis.com/pb.AdResponseInfo')));
for(const gz of [false,true]) {
  const original=frame(pb(7,'normal'),cat(keep,ad));
  const result=run('video',videoURL,gz?zlib.gzipSync(original):original).body;
  const raw=gz?zlib.gunzipSync(result):Buffer.from(result);
  assert.equal(raw.readUInt32BE(4),raw.length);
  const start=16+raw.readUInt16BE(8);
  assert.ok(raw.subarray(start).equals(keep),'retain normal Protobuf fields');
}
// Tab Any keeps homepage and removes the VIP entry, reindexing retained tabs.
const tabItem=(key,title)=>cat(pb(3,title),pb(22,pb(1,key)));
const tabAny=cat(pb(1,'type.googleapis.com/pb.GetTabListRsp'),pb(2,cat(pb(1,tabItem('homepage','首页')),pb(1,tabItem('vip_entrance','会员专区')))));
const tabOut=run('video',videoURL,frame(pb(7,'normal'),pb(5,tabAny))).body;
assert.ok(Buffer.from(tabOut).includes(Buffer.from('homepage')));
assert.ok(!Buffer.from(tabOut).includes(Buffer.from('vip_entrance')));

// Build JCE roll/pause ad frames independently, verify updated lengths and gzip.
const jInt=(tag,n)=>n===0?Buffer.from([(tag<<4)|12]):Buffer.from([(tag<<4),n]);
const jStr=(tag,str)=>cat([(tag<<4)|6,Buffer.byteLength(str)],Buffer.from(str));
const jSimple=(tag,data)=>cat([(tag<<4)|13,0],jInt(0,data.length),data);
function jce(cmd,body) {
  const inner=cat(Buffer.alloc(16),jSimple(1,body),[0x28]);
  inner[0]=0x26;inner.writeUInt32BE(inner.length,1);
  const head=Buffer.alloc(80);head[0]=0x13;head[8]=(cmd>>16)&255;head[9]=(cmd>>8)&255;head[10]=cmd&255;head.writeUInt32BE(inner.length,76);
  const out=cat(head,zlib.gzipSync(inner),[3]);out.writeUInt32BE(out.length,1);return out;
}
function jBody(result){const raw=Buffer.from(result);assert.equal(raw.readUInt32BE(1),raw.length);const inner=zlib.gunzipSync(raw.subarray(80,-1));assert.equal(raw.readUInt32BE(76),inner.length);assert.equal(inner.readUInt32BE(1),inner.length);let p=18;const type=inner[p++]&15;let len;if(type===0)len=inner[p++];else if(type===12)len=0;else throw Error('test length');return inner.subarray(p,p+len);}
for(const cmd of [129278,130273]) {
  const body=cat([0x29],jInt(0,1),jStr(0,'livemsg'),jStr(3,'keep'));
  const result=run('video','https://iacc.qq.com/',jce(cmd,body)).body;
  assert.ok(jBody(result).equals(cat([0x29],jInt(0,0),jStr(3,'keep'))));
}
const pause=cat([0x1a],jSimple(1,cat([9],jInt(0,1),jStr(0,'livemsg'))),[0x0b],jStr(3,'keep'));
const pauseResult=run('video','https://iacc.qq.com/',jce(129196,pause)).body;
assert.ok(jBody(pauseResult).equals(cat([0x1a],jSimple(1,cat([9],jInt(0,0))),[0x0b],jStr(3,'keep'))));
for(const value of [Buffer.alloc(0),Buffer.from([0xff]),Buffer.from('normal content')]) {
  assert.equal(JSON.stringify(run('video',videoURL,value)),'{}');
  assert.equal(JSON.stringify(run('video','https://iacc.qq.com/',value)),'{}');
}
assert.equal(JSON.stringify(run('video',videoURL,frame(pb(7,'normal'),keep),{request:true})),'{}');
assert.equal(JSON.stringify(run('video',videoURL,frame(pb(7,'normal'),keep))),'{}');

// Check configuration routing, including mutually exclusive UA conditions.
const sportsPlugin=fs.readFileSync(path.join(root,'plugins/tencent-sports-zenmo-clean.plugin'),'utf8');
const videoPlugin=fs.readFileSync(path.join(root,'plugins/tencent-video-clean.plugin'),'utf8');
for(const [kind,plugin] of [['sports',sportsPlugin],['video',videoPlugin]]) {
  const legacy=plugin.split('\n').filter(l=>/^http-(response|request) /.test(l));
  assert.equal(legacy.length,kind==='sports'?8:4);
  for(const line of legacy) {
    new RegExp(line.split(' ')[1]);
    const file=line.match(/script-path=https:\/\/raw\.githubusercontent\.com\/zhangx16\/loon\/main\/([^,]+)/)[1];
    assert.ok(fs.existsSync(path.join(root,file)));
    if(line.includes('iacc\\.qq') || line.includes('i\\.video')) assert.ok(line.includes('binary-body-mode=true'));
  }
  const condition=plugin.split('\n').find(l=>l.startsWith('response if'));
  assert.ok(condition.includes('requires_body=true, binary_body_mode=true'));
  assert.ok(condition.includes(kind==='sports'?'/^QQSportsV3\\//i':'/^(?!QQSportsV3\\/)/i'));
  assert.equal(plugin.match(/^hostname = (.+)$/m)[1].split(',').length,4);
}
for(const ua of ['QQSportsV3/8','qqsportsv3/9','QQLive/1','other','']) {
  assert.equal(Number(/^QQSportsV3\//i.test(ua))+Number(/^(?!QQSportsV3\/)/i.test(ua)),1);
}
console.log(`PASS: ${cases} script calls; Loon binary bodies, Protobuf/gzip, TRPC requests/responses, JCE pre/mid/pause ad fixtures, JSON/XML, SSP context and plugin routing. Device validation pending.`);
