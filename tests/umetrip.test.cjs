const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.resolve(__dirname,'..');
const source = fs.readFileSync(path.join(root,'scripts/umetrip/ad-clean.js'),'utf8');
const plugin = fs.readFileSync(path.join(root,'plugins/umetrip-clean.plugin'),'utf8');
const compiled = new vm.Script(source);
let count=0;
const cat=(...parts)=>Buffer.concat(parts.map(x=>Buffer.from(x)));
function vi(n){const out=[];do{let x=n%128;n=Math.floor(n/128);out.push(x+(n?128:0));}while(n);return Buffer.from(out);}
function pb(n,value){const b=typeof value==='string'?Buffer.from(value):value;return cat(vi(n*8+2),vi(b.length),b);}
const url='https://home.umetrip.com/gateway/api/umetrip/native';
const core=pb(9,'flight CA1234; trip and checkin data');
const outer=(rpid,payload)=>cat(pb(5,rpid),pb(7,payload),pb(20,'outer normal field'));
function run(body,headers={}){
  const calls=[];
  compiled.runInNewContext({$request:{url,headers},$response:{status:200,body},$done:x=>calls.push(x),console:{log(){}}},{timeout:1000});
  assert.equal(calls.length,1,'one completion');
  assert.ok(calls[0]&&typeof calls[0]==='object','explicit unchanged result');
  assert.ok(!('bodyBytes' in calls[0]));
  count++;
  return calls[0];
}
function changed(rpid,payload,expected){
  const input=outer(rpid,payload);
  const result=run(new Uint8Array(input));
  assert.ok(ArrayBuffer.isView(result.body),'Loon Uint8Array output');
  assert.ok(Buffer.from(result.body).equals(outer(rpid,expected)),rpid);
  // Header ID takes precedence over a different envelope ID.
  const headerResult=run(new Uint8Array(outer('unknown',payload)),{RpId:rpid});
  assert.ok(Buffer.from(headerResult.body).equals(outer('unknown',expected)));
}
for(const id of ['1000019','1420002','1120000'])changed(id,pb(1,'ad payload'),Buffer.from([10,0,16,0,32,0]));
const homeAd=pb(5,pb(37,'ADVERT'));
changed('1000002',cat(homeAd,core),core);
const homeCard=pb(5,pb(8,pb(3,'中秋国庆活动')));
changed('1000002',cat(homeCard,core),core);
const homeJson={groupList:[{dataSource:'ADVERT'},{groupStyle:1,title:'航班'}],cardList:[{serviceTrack:'advert_x'},{serviceName:'值机'}],keep:1};
changed('1000002',cat(pb(4,JSON.stringify(homeJson)),core),cat(pb(4,JSON.stringify({groupList:[{groupStyle:1,title:'航班'}],cardList:[{serviceName:'值机'}],keep:1})),core));
changed('1000029',cat(pb(8,'瀑布流_特价机票'),core),core);
changed('1370126',cat(pb(8,'付费会员'),core),core);
changed('1370279',cat(pb(1,'可免费试用30天 payMember'),pb(2,'添加家人并开启守护 payMember'),core),core);
changed('1011058',cat(pb(11,'历史行程容量剩余 付费会员'),core),core);
changed('1100001',cat(pb(5,pb(8,pb(3,'我的页面-会员卡片V3'))),core),core);
changed('1060060',cat(pb(12,'付费会员'),core),core);
for(const id of ['unknown','1000002','1000029','1370126','1370279','1011058','1100001','1060060']){
  assert.equal(JSON.stringify(run(new Uint8Array(outer(id,core)))),'{}',`normal ${id}`);
}
assert.equal(JSON.stringify(run(new Uint8Array(outer('unknown',homeAd)))),'{}','unknown business not cleaned');
assert.equal(JSON.stringify(run(new Uint8Array(outer('1000002',homeAd)),{rpid:'unknown'})),'{}','unknown header takes precedence');
for(const input of [undefined,new Uint8Array(),new Uint8Array([0xff]),new Uint8Array([0x3a,0xff]),'{"flight":"normal"}',''])assert.equal(JSON.stringify(run(input)),'{}');
const backing=cat([255,255],outer('1000002',cat(homeAd,core)),[255,255]);
const sliced=new Uint8Array(backing.buffer,backing.byteOffset+2,backing.length-4);
assert.ok(Buffer.from(run(sliced).body).equals(outer('1000002',core)),'honor typed-array view boundaries');
const line=plugin.split('\n').find(l=>l.startsWith('http-response '));
const regex=new RegExp(line.split(' ')[1]);
assert.ok(line.includes('requires-body=true,binary-body-mode=true'));
const hosts=['sns','appmsg','home','umehome','opactivity','activity','umerp','flightstatus','umeflightstatus','startup','umestartup','user','umeuser','event'];
for(const host of hosts){assert.ok(regex.test(`https://${host}.umetrip.com/gateway/api/umetrip/native`));assert.ok(regex.test(`https://${host}.umetrip.com/gateway/api/umetrip/native?x=1`));}
for(const value of [url+'Other',url.replace('/native','/flight/query'),url.replace('home.umetrip.com','example.com')])assert.ok(!regex.test(value));
assert.equal(plugin.match(/^hostname = (.+)$/m)[1].split(', ').length,15);
assert.ok(!plugin.includes('[Rule]'),'no broad domain rejection');
assert.ok(new RegExp(plugin.split('\n').find(l=>l.endsWith(' reject-img')).split(' ')[0]).test('https://oss.umetrip.com/fs/advert/banner.png'));
console.log(`PASS: ${count} binary response cases; all 10 target rpids, header/envelope selection, nested JSON, normal fields, typed-array slices, unknown/malformed pass-through; 14 gateway hosts and 15 MitM hosts. Device validation pending.`);
