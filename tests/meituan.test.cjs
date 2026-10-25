const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const base = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(base, 'scripts/meituan/mt.js'), 'utf8');
const plugin = fs.readFileSync(path.join(base, 'plugins/meituan-clean.plugin'), 'utf8');
const routes = plugin.split('\n').filter(l => l.startsWith('http-response ')).map(l => new RegExp(l.split(' ')[1], 'i'));
let cases = 0;
function run(url, input, expected) {
  const body = typeof input === 'string' ? input : JSON.stringify(input);
  const results = [];
  vm.runInNewContext(source, {$request: {url}, $response: {body}, $done: r => results.push(r)}, {timeout: 1000});
  assert.equal(results.length, 1, 'must finish exactly once');
  if (expected === undefined) assert.equal(JSON.stringify(results[0]), '{}');
  else {
    assert.equal(routes.filter(r => r.test(url)).length, 1, 'exactly one configured route');
    assert.deepEqual(JSON.parse(results[0].body), expected);
  }
  cases++;
}
const tab = 'https://apimobile.meituan.com/aggroup/indexTab';
run(tab, {data:{resource:{tabArea:[{tabName:'homepage'},{tabName:'video'},{tabName:'xiaotuan'},{tabName:'mine'},{tabName:'other'}]}}}, {data:{resource:{tabArea:[{tabName:'homepage'},{tabName:'mine'},{tabName:'other'}]}}});
run(tab, {data:{resource:{tabArea:[{tabName:'video'}]}}});
for (const scene of ['gwc_feed1_2265', 'personalcenter_2154']) {
  run(`https://feedguess.meituan.com/lycoris/scene/${scene}?x=1`, {data:[{id:1}],ext:{keep:1}}, {data:[],ext:{keep:1,forbidByExp:true},bottom:true});
}
run('https://feedguess.meituan.com/lycoris/scene/other', {data:[1]});
run('https://mt-personalcenter.meituan.com/usercenter/display', {children:[{name:'mine_cross_recommend'},{name:'orders'}]}, {children:[{name:'orders'}]});
run('https://apimobile.meituan.com/group/v1/deal/searchpage/defaultword', {searchIntroduceResponse:{defaultWordRes:{defaultWordItems:[1],keep:2},HotWordInfos:[2]}}, {searchIntroduceResponse:{defaultWordRes:{defaultWordItems:[],keep:2},HotWordInfos:[]}});
run('https://apimobile.meituan.com/group/v1/deal/searchpage/hotword/city/divide/hotrecommend/', {data:{segmentsV2:[{hotwordSegments:[{pageName:'EntranceHotwordsV2Hotwords'}]},{hotwordSegments:[{pageName:'EntranceHotwordsV2ContentCard'},{pageName:'keep'}]},{keep:1}],aiSearchBubble:{bubbleTexts:[1],keep:2}}}, {data:{segmentsV2:[{hotwordSegments:[{pageName:'keep'}]},{keep:1}],aiSearchBubble:{bubbleTexts:[],keep:2}}});
const ai = 'https://assistify.meituan.com/assistant/getAppClientHornConfig';
run(ai, {data:JSON.stringify({skills:{ad:1},keep:2})}, {data:JSON.stringify({skills:{},keep:2})});
run(ai, {data:'not json'});
for (const [url, key] of [
  ['https://mop.meituan.com/mop/entry/shoppingCartEntry','topBannerArea'],
  ['https://mop.meituan.com/api/entryModule/startupPicture','startupPicArea']
]) {
  for (const nested of [false, true]) {
    for (const holder of ['resourcesMap', 'resource']) {
      const value = {[holder]:{[key]:[1],keep:[2]}};
      const expected = {[holder]:{[key]:[],keep:[2]}};
      run(url, nested ? {data:value} : value, nested ? {data:expected} : expected);
    }
  }
}
for (const value of ['', '<html>error</html>', 'null', '{}', '[]', '42']) run(tab, value);
run('https://example.com/unrelated', {data:[1]});
const rules = plugin.split('\n').filter(l => /^(DOMAIN|IP-CIDR)/.test(l));
assert.equal(rules.length, 35);
assert.equal(rules.filter(l => l.startsWith('DOMAIN,')).length, 10);
assert.equal(rules.filter(l => l.startsWith('DOMAIN-WILDCARD,')).length, 1);
assert.equal(rules.filter(l => l.startsWith('IP-CIDR,')).length, 22);
assert.equal(rules.filter(l => l.startsWith('IP-CIDR6,')).length, 2);
assert.equal(new Set(rules).size, rules.length);
assert.equal(routes.length, 8);
const mitm = plugin.match(/^hostname = (.+)$/m)[1].split(',').map(s => s.trim());
assert.equal(mitm.length, 5);
for (const line of plugin.split('\n').filter(l => l.startsWith('http-response '))) {
  assert.ok(line.includes('requires-body=true,binary-body-mode=false'));
  assert.ok(line.includes('script-path=https://raw.githubusercontent.com/zhangx16/loon/main/scripts/meituan/mt.js,'));
}
for (const url of ['https://apimobile.meituan.com/aggroup/indexTab', 'https://feedguess.meituan.com/lycoris/scene/personalcenter_2154', 'https://mt-personalcenter.meituan.com/usercenter/display', ai, 'https://mop.meituan.com/api/entryModule/startupPicture']) {
  assert.ok(mitm.includes(new URL(url).hostname));
}
console.log(`PASS: ${cases} response cases; 35 rules, 8 script entries, 5 MitM hosts. Node simulation only; Loon device validation pending.`);
