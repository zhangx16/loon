# loon

个人 Loon 插件与脚本集合。每个插件只做一件事，尽量不互相依赖。

## 插件列表

| 插件 | 说明 | 订阅地址 |
|---|---|---|
| `bilibili-network-lite` | B 站网络层净化：去 AV1、去 PCDN、挡埋点。不含去广告/布局等页面层功能 | [订阅](https://raw.githubusercontent.com/zhangx16/loon/main/plugins/bilibili-network-lite.plugin) |
| `meituan-clean` | 美团 App 12.67.403 净化：隐藏视频/小团标签、推荐流、搜索推荐、购物车横幅及启动图；完整规则需要 Loon Build 1008+ | [订阅](https://raw.githubusercontent.com/zhangx16/loon/main/plugins/meituan-clean.plugin) |
| `hellobike-clean` | 哈啰净化：弹窗、首页推荐、借钱入口、会员领券横条和我的页推广；支持本机动态密钥及加密响应 | [订阅](https://raw.githubusercontent.com/zhangx16/loon/main/plugins/hellobike-clean.plugin) |
| `huazhu-clean` | 华住会去广告：开屏广告和首页弹窗；需开启 MitM 并信任证书 | [订阅](https://raw.githubusercontent.com/zhangx16/loon/main/plugins/huazhu-clean.plugin) |
| `tencent-sports-clean` | 腾讯体育净化：开屏、信息流、会员推广、赛事横幅和活动弹窗；需开启 MitM 并信任证书 | [订阅](https://raw.githubusercontent.com/zhangx16/loon/main/plugins/tencent-sports-clean.plugin) |
| `caixin-clean` | 财新去广告：广告域名、指定首页推送、搜索推荐、小程序、热门推荐及 AI 问题接口；需开启 MitM 并信任证书 | [订阅](https://raw.githubusercontent.com/zhangx16/loon/main/plugins/caixin-clean.plugin) |
| `cotti-clean` | 库迪咖啡微信小程序净化：指定弹窗、悬浮推广和广告排序接口；需开启 MitM 并信任证书 | [订阅](https://raw.githubusercontent.com/zhangx16/loon/main/plugins/cotti-clean.plugin) |
| `hupu-clean` | 虎扑指定广告接口返回无广告 JSON；需 Loon 3.5.1(978)+，开启 MitM 并信任证书；效果待真机验证 | [订阅](https://raw.githubusercontent.com/zhangx16/loon/main/plugins/hupu-clean.plugin) |

## 使用

Loon → 配置 → 插件 → 右上角 `+` → 从 URL 添加，粘贴上表的订阅地址即可。
插件里的脚本走 `raw.githubusercontent.com`，国内网络拉不动时把 `script-path=` 换成对应的
`cdn.jsdelivr.net/gh/zhangx16/loon@main/...` 地址（插件文件里有注释示例）。

> 远程插件不会自动追更。改动后需要删掉重新添加，或等 Loon 下次刷新订阅。

## 目录约定

```
plugins/            插件本体，一个插件一个 .plugin 文件
scripts/<服务名>/   插件引用的 JS，按服务分目录
```

新增插件时：

- 插件文件名用小写 + 连字符，如 `youtube-ads.plugin`，和 `#!name` 保持语义一致。
- `#!date` 每次改动都更新，方便肉眼判断版本。
- `script-path=` 一律写 `https://raw.githubusercontent.com/zhangx16/loon/main/scripts/<服务名>/<脚本>.js` 全路径，不用相对路径。
- 改了脚本或插件，同步更新上面那张表。

## 说明

- 脚本逻辑尽量保持同步执行、末尾只调一次 `$done()`；Loon 的异步是回调式的，`setInterval` 只执行一次。
- 需要读 Body 的脚本记得在 `[Script]` 行加 `requires-body=true`。
- MITM 只加真正需要改写的 API 域名，不要把大流量域名（如视频分片 CDN）加进 `hostname`。

## 美团插件

基于 TG@ZenMoFiShi 的 `ZenmoFeiShi/Qx/MT.snippet` 和 `MT.js`（2026-10-25，用户提供）适配。
保留原脚本逻辑及全部 35 条拦截规则、8 条响应规则，脚本使用本仓库地址。

- 完整规则需要 Loon Build 1008+，其中 `DOMAIN-WILDCARD` 用于匹配 `mquic-*.meituan.com`。
- 开启 MitM，并安装、信任 Loon 的 CA 证书。
- 已通过 Node.js 模拟响应测试，尚未完成 Loon/美团真机验证；原规则适配美团 App 12.67.403。
- 本地验证：`node --check scripts/meituan/mt.js && node tests/meituan.test.cjs`。

## 哈啰插件

基于 TG@ZenMoFiShi 的 [helloobike.snippet](https://github.com/ZenmoFeiShi/Qx/blob/main/helloobike.snippet)
及 [easybike-ad.js](https://github.com/ZenmoFeiShi/Qx/blob/8f547d30cead63257fe4cb0068b35cf1fc01d559/easybike-ad.js) 适配。
保留上游 AES/哈希实现、页面清理逻辑、4 条广告 URL 拦截及页面模板内容；转换为 Loon 的请求/响应脚本与本地响应格式。

- 开启 MitM，并安装、信任 Loon 的 CA 证书。首次添加后完全退出并重启哈啰，让 `/secretkey` 请求捕获本机动态密钥；收到通知后重新进入首页和我的页面。若通知被禁用，可先检查页面净化是否生效。
- 密钥通过 `$persistentStore` 仅存储在 Loon 本机，不写入仓库，也不上传。动态密钥按版本、指纹和有效期匹配。
- QX 的 `sessionIndex` 改用 `X-Loon-HelloBike-Context` 请求 Header 关联。该 Header 仅含随机关联编号，发往当前哈啰 API；业务元数据和密钥保留在本机。其余请求 Header 和正文保留。
- 请求关联缓存限制为 64 个槽位，180 秒过期；关联丢失、槽位碰撞或解密失败时放行原响应。若其他规则移除该 Header，部分净化会跳过。
- 页面模板在请求阶段由脚本直接返回，并校验上游 MD5/SHA-256；仅解密插件列出的 9 个域名。
- 已完成模拟请求/响应、AES 往返、密钥捕获、大整数精度、并发关联及模板哈希验证，尚未完成 Loon/哈啰真机验证。
- 本地验证：`node --check scripts/hellobike/easybike-ad.js && node tests/hellobike.test.cjs`。

## 腾讯体育插件

基于 Hey-sayiwanna 的 [TencentSports-Surge](https://github.com/Hey-sayiwanna/TencentSports-Surge/tree/aad85d3669ababee8d64cd6e245b6d0546250bd0) 适配，保留原两份响应脚本业务逻辑及接口匹配范围。
Surge 的两条 `Map Local` 转为一个 Loon 请求脚本，返回 HTTP 200、空正文及 `Content-Type: application/proto`；MitM 保留原 6 个域名。

- 添加插件后开启 MitM，并安装、信任 Loon CA 证书；完全退出再启动腾讯体育。
- 覆盖首页信息流强插广告、置顶会员推广、社区广告、赛事横幅/悬浮组件、金币任务会员弹层、PageCard 强制弹窗和 H5 运营弹窗。
- **不包含视频播放前约 60 秒广告的拦截能力**：上游将该功能交由另行安装的广告平台及 HTTPDNS 基础模块，本次仅适配所提供的模块及其引用脚本。
- 若规则已命中但仍显示旧广告，先排查本地缓存；上游建议首次使用时卸载重装 App。若 HTTPS 请求未解密，检查 MitM 与 QUIC 设置。
- 已完成模拟响应、正常内容保留、开屏响应格式及配置匹配验证，尚未完成 Loon/腾讯体育真机验证。
- 本地验证：`node tests/tencent-sports.test.cjs`。

## 库迪咖啡微信小程序插件

基于 @Zirawell 的 [cotti.js](https://github.com/zirawell/R-Store/blob/02451c1fb536296842c950f94479141f08c30a03/Res/Scripts/AntiAd/cotti.js) 和用户提供的 QX 规则适配。
保留上游内置 AES 实现及参数，在请求阶段解密 `data`，仅对原五个推广 code 返回本地 HTTP 404；广告排序接口返回空 JSON。

- 开启 MitM，并安装、信任 Loon CA 证书；关闭后重新打开库迪咖啡微信小程序。
- 将原请求脚本的状态行改为 Loon 的 `$done({response:{status:404,...}})`，正常请求通过 `$done({})` 放行。补充缺失、异常正文的放行处理，避免重复完成或解析异常中断。
- 十六进制参数解码改用脚本自带的 CryptoJS，不依赖运行时是否提供 `TextDecoder`。
- 保留原 URL 范围：`position/list` 仅匹配无查询参数的地址；`adSortList` 保留原前缀匹配。
- 已通过独立 AES 测试数据、全部五个推广标识、正常请求及异常正文的模拟验证，尚未完成 Loon/微信真机验证。
- 本地验证：`node --check scripts/cotti/cotti.js && node tests/cotti.test.cjs`。
