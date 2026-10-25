const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.resolve(__dirname,'..');
const plugin = fs.readFileSync(path.join(root,'plugins/tencent-sports-clean.plugin'),'utf8');
const routes = plugin.split('\n').filter(l=>/^http-(request|response) /.test(l)).map(line=>({
  stage:line.split(' ')[0], pattern:new RegExp(line.split(' ')[1]),
  file:line.match(/script-path=https:\/\/raw\.githubusercontent\.com\/zhangx16\/loon\/main\/(.*?),/)[1]
}));
let count = 0;
function run(url,input,expected) {
  const selected = routes.filter(r=>r.pattern.test(url));
  assert.equal(selected.length,1,`one route for ${url}`);
  const route = selected[0];
  const calls = [];
  const context = {$request:{url},console:{log(){}},$done:result=>calls.push(result)};
  if (route.stage === 'http-response') context.$response = {body:typeof input === 'string' ? input : JSON.stringify(input)};
  vm.runInNewContext(fs.readFileSync(path.join(root,route.file),'utf8'),context,{timeout:1000});
  assert.equal(calls.length,1,'one completion');
  count++;
  const result = JSON.parse(JSON.stringify(calls[0]));
  if (expected !== undefined) assert.deepEqual(JSON.parse(result.body),expected);
  return result;
}
for (const endpoint of ['GetTabRemoteConfig','GetTabToggle']) {
  for (const query of ['', '?version=1']) {
    assert.deepEqual(run('https://config.ab.qq.com/tab/'+endpoint+query), {response:{status:200,headers:{'Content-Type':'application/proto'},body:''}});
  }
}
for (const endpoint of ['feeds/list','m/matchAfter/stats','match/adBanner']) {
  const keep = {id:'news',info:{title:'比赛新闻'}};
  const schedule = {id:'hot_my_schedule'};
  const quickNews = {id:'type1142'};
  run('https://app.sports.qq.com/'+endpoint+'?id=1', {code:0,data:{
    list:[keep,{id:'ad'},{type:613},{reason:'强插'},{report:'{"module":"internalbanner"}'},{info:{jumpData:{param:{url:'https://gdt.qq.com/ad'}}}}],
    topItem:[schedule,quickNews,{id:'type1149'},{info:{vipPromotion:{title:'新用户首开特惠',button:'立即开通'}}}],
    stats:[{text:'比分'},{text:'广告'},{type:41},{ad:{adListPB:'ad'}}],
    adList:[1],iconAd:{ad:1},topWidget:{ad:1},keep:1
  }}, {code:0,data:{list:[keep],topItem:[schedule,quickNews],stats:[{text:'比分'}],adList:'',iconAd:{},topWidget:{},keep:1}});
}
run('https://shequ.sports.qq.com/topic/detail?id=1',{data:{content:'文章',adListPB:'ad',adList:[1],adInfos:[2]}},{data:{content:'文章',adListPB:'',adList:[],adInfos:[]}});
run('https://app.sports.qq.com/trpc.sports_resource.cgi.ResourceCGI/MatchWidgets',{data:{bannerList:[1,2],stats:[3]}},{data:{bannerList:[],stats:[3]}});
run('https://app.sports.qq.com/vaccess/trpc.sports_resource.cgi.ResourceCGI/ColumnWidget?x=1',{code:0,data:{img:'ad'}},{code:0,data:null});
run('https://app.sports.qq.com/vaccess/trpc.sports_resource.cgi.ResourceCGI/ColumnWidget',{code:0,data:{keep:1}},{code:0,data:{keep:1}});
run('https://app.sports.qq.com/vaccess/trpc.sportsbasic.column.Column/GetColumn',{data:{forceNotice:[{id:'ad1'},{id:2}],newRecommend:[{id:'ad1'},{id:'2'},{id:'news'}],keep:1}},{data:{forceNotice:[],newRecommend:[{id:'news'}],keep:1}});
run('https://matchweb.sports.qq.com/trpc.dorae.coin.Coin/CoinLayer?x=1','upstream',{code:0,data:null,traceID:''});
const h5 = run('https://sports.qq.com/sapp/h5msg.htm','<html>promotion</html>');
assert.ok(h5.body.includes('http://sports.qq.com/jsBridge/close?'));
assert.ok(h5.body.includes('history.back()'));
assert.ok(!h5.body.includes('<html>promotion</html>'));

// Remove only the VIP popup object while keeping surrounding HTML/JSON valid.
for (const position of [0,1,2]) {
  const normal = [{moduleId:'schedule',title:'正常赛事'},{moduleId:'news',title:'正常新闻'}];
  const popup = {moduleId:'vip',moduleType:'module_popup_page',itemDataLists:[{text:'braces } and escaped " quote'}]};
  const modules = normal.slice(); modules.splice(position,0,popup);
  const html = '<script>window.DATA='+JSON.stringify({modules})+'</script>';
  const result = run('https://film.video.qq.com/x/sports-vip-channel/?x=1',html);
  const json = result.body.slice('<script>window.DATA='.length,-'</script>'.length);
  assert.deepEqual(JSON.parse(json),{modules:normal});
}
const plainHtml = '<html>normal member page</html>';
assert.equal(run('https://film.video.qq.com/x/sports-vip-channel/',plainHtml).body,plainHtml);
for (const url of ['https://app.sports.qq.com/feeds/list?id=1','https://app.sports.qq.com/trpc.sports_resource.cgi.ResourceCGI/MatchWidgets']) {
  assert.deepEqual(run(url,'invalid JSON'),{});
  run(url,{code:0,data:{normal:'赛事内容'}},{code:0,data:{normal:'赛事内容'}});
}
assert.equal(routes.length,3);
for (const route of routes) assert.ok(fs.existsSync(path.join(root,route.file)));
const hosts = plugin.match(/^hostname = (.+)$/m)[1].split(',');
assert.equal(hosts.length,6);
assert.ok(!plugin.includes('%APPEND%'));
for (const url of ['https://other.sports.qq.com/feeds/list?id=1','https://app.sports.qq.com/normal/api','https://film.video.qq.com/x/other/']) {
  assert.equal(routes.filter(r=>r.pattern.test(url)).length,0);
}
console.log(`PASS: ${count} script cases; splash response contract, feed/VIP/community cleanup, widgets/popups, normal content retention, malformed-response pass-through and route isolation. Device validation pending.`);
