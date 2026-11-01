# loon

个人 Loon 插件与脚本集合。每个插件只做一件事，尽量不互相依赖。

## 插件列表

| 插件 | 说明 | 安装 / 订阅 |
|---|---|---|
| `bilibili-network-lite` | B 站网络层净化：去 AV1、去 PCDN、挡埋点。不含去广告/布局等页面层功能 | [添加到 Loon](https://www.nsloon.com/openloon/import?plugin=https%3A%2F%2Fraw.githubusercontent.com%2Fzhangx16%2Floon%2Fmain%2Fplugins%2Fbilibili-network-lite.plugin) · [原始链接](https://raw.githubusercontent.com/zhangx16/loon/main/plugins/bilibili-network-lite.plugin) |
| `meituan-clean` | 美团 App 12.67.403 净化：隐藏视频/小团标签、推荐流、搜索推荐、购物车横幅及启动图；完整规则需要 Loon Build 1008+ | [添加到 Loon](https://www.nsloon.com/openloon/import?plugin=https%3A%2F%2Fraw.githubusercontent.com%2Fzhangx16%2Floon%2Fmain%2Fplugins%2Fmeituan-clean.plugin) · [原始链接](https://raw.githubusercontent.com/zhangx16/loon/main/plugins/meituan-clean.plugin) |
| `hellobike-clean` | 哈啰净化：弹窗、首页推荐、借钱入口、会员领券横条和我的页推广；支持本机动态密钥及加密响应 | [添加到 Loon](https://www.nsloon.com/openloon/import?plugin=https%3A%2F%2Fraw.githubusercontent.com%2Fzhangx16%2Floon%2Fmain%2Fplugins%2Fhellobike-clean.plugin) · [原始链接](https://raw.githubusercontent.com/zhangx16/loon/main/plugins/hellobike-clean.plugin) |
| `huazhu-clean` | 华住会去广告：开屏广告和首页弹窗；需开启 MitM 并信任证书 | [添加到 Loon](https://www.nsloon.com/openloon/import?plugin=https%3A%2F%2Fraw.githubusercontent.com%2Fzhangx16%2Floon%2Fmain%2Fplugins%2Fhuazhu-clean.plugin) · [原始链接](https://raw.githubusercontent.com/zhangx16/loon/main/plugins/huazhu-clean.plugin) |
| `tencent-sports-clean` | 腾讯体育净化：开屏、信息流、会员推广、赛事横幅和活动弹窗；需开启 MitM 并信任证书 | [添加到 Loon](https://www.nsloon.com/openloon/import?plugin=https%3A%2F%2Fraw.githubusercontent.com%2Fzhangx16%2Floon%2Fmain%2Fplugins%2Ftencent-sports-clean.plugin) · [原始链接](https://raw.githubusercontent.com/zhangx16/loon/main/plugins/tencent-sports-clean.plugin) |
| `tencent-sports-zenmo-clean` | 腾讯体育净化（@ZenmoFeiShi）：开屏、我的页、底部会员入口、首页展示和搜索热词；与旧体育版二选一，需 Loon 3.5.1(983)+ | [添加到 Loon](https://www.nsloon.com/openloon/import?plugin=https%3A%2F%2Fraw.githubusercontent.com%2Fzhangx16%2Floon%2Fmain%2Fplugins%2Ftencent-sports-zenmo-clean.plugin) · [原始链接](https://raw.githubusercontent.com/zhangx16/loon/main/plugins/tencent-sports-zenmo-clean.plugin) |
| `tencent-video-clean` | 腾讯视频净化（@ZenmoFeiShi）：开屏、前贴片/中插/暂停广告、底部导航和我的页；需 Loon 3.5.1(983)+，效果待真机验证 | [添加到 Loon](https://www.nsloon.com/openloon/import?plugin=https%3A%2F%2Fraw.githubusercontent.com%2Fzhangx16%2Floon%2Fmain%2Fplugins%2Ftencent-video-clean.plugin) · [原始链接](https://raw.githubusercontent.com/zhangx16/loon/main/plugins/tencent-video-clean.plugin) |
| `caixin-clean` | 财新去广告：广告域名、指定首页推送、搜索推荐、小程序、热门推荐及 AI 问题接口；需开启 MitM 并信任证书 | [添加到 Loon](https://www.nsloon.com/openloon/import?plugin=https%3A%2F%2Fraw.githubusercontent.com%2Fzhangx16%2Floon%2Fmain%2Fplugins%2Fcaixin-clean.plugin) · [原始链接](https://raw.githubusercontent.com/zhangx16/loon/main/plugins/caixin-clean.plugin) |
| `cotti-clean` | 库迪咖啡微信小程序净化：指定弹窗、悬浮推广和广告排序接口；需开启 MitM 并信任证书 | [添加到 Loon](https://www.nsloon.com/openloon/import?plugin=https%3A%2F%2Fraw.githubusercontent.com%2Fzhangx16%2Floon%2Fmain%2Fplugins%2Fcotti-clean.plugin) · [原始链接](https://raw.githubusercontent.com/zhangx16/loon/main/plugins/cotti-clean.plugin) |
| `hupu-clean` | 虎扑指定广告接口返回无广告 JSON；需 Loon 3.5.1(978)+，开启 MitM 并信任证书；效果待真机验证 | [添加到 Loon](https://www.nsloon.com/openloon/import?plugin=https%3A%2F%2Fraw.githubusercontent.com%2Fzhangx16%2Floon%2Fmain%2Fplugins%2Fhupu-clean.plugin) · [原始链接](https://raw.githubusercontent.com/zhangx16/loon/main/plugins/hupu-clean.plugin) |
| `zhuanzhuan-clean` | 转转净化（@ddgksf2013）：开屏、弹窗、横幅、信息流、搜索推荐和我的页；需 Loon 3.5.1(978)+ | [添加到 Loon](https://www.nsloon.com/openloon/import?plugin=https%3A%2F%2Fraw.githubusercontent.com%2Fzhangx16%2Floon%2Fmain%2Fplugins%2Fzhuanzhuan-clean.plugin) · [原始链接](https://raw.githubusercontent.com/zhangx16/loon/main/plugins/zhuanzhuan-clean.plugin) |
| `weibo-enhanced` | 微博增强（@ddgksf2013）：广告净化、推荐 TAB 和七个关注分组设置；附本机设置页和微博域名 QUIC 拦截 | [添加到 Loon](https://www.nsloon.com/openloon/import?plugin=https%3A%2F%2Fraw.githubusercontent.com%2Fzhangx16%2Floon%2Fmain%2Fplugins%2Fweibo-enhanced.plugin) · [原始链接](https://raw.githubusercontent.com/zhangx16/loon/main/plugins/weibo-enhanced.plugin) |

## 使用

在已安装 Loon 的设备上点击上表「添加到 Loon」，即可唤起 Loon 导入插件。
如果浏览器或 GitHub App 未能唤起，请在 Safari 中打开仓库页面重试，或复制「原始链接」到 Loon → 配置 → 插件 → 右上角 `+` → 从 URL 添加。
安装入口使用 [Loon 官方通用链接](https://nsloon.app/docs/Scheme/)，将插件地址 URL 编码后传给 `plugin` 参数。
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

本节介绍旧版 `tencent-sports-clean`。新增的 @ZenmoFeiShi 版见下节；两个体育插件应二选一，不要同时启用。

基于 Hey-sayiwanna 的 [TencentSports-Surge](https://github.com/Hey-sayiwanna/TencentSports-Surge/tree/aad85d3669ababee8d64cd6e245b6d0546250bd0) 适配，保留原两份响应脚本业务逻辑及接口匹配范围。
Surge 的两条 `Map Local` 转为一个 Loon 请求脚本，返回 HTTP 200、空正文及 `Content-Type: application/proto`；MitM 保留原 6 个域名。

- 添加插件后开启 MitM，并安装、信任 Loon CA 证书；完全退出再启动腾讯体育。
- 覆盖首页信息流强插广告、置顶会员推广、社区广告、赛事横幅/悬浮组件、金币任务会员弹层、PageCard 强制弹窗和 H5 运营弹窗。
- **不包含视频播放前约 60 秒广告的拦截能力**：上游将该功能交由另行安装的广告平台及 HTTPDNS 基础模块，本次仅适配所提供的模块及其引用脚本。
- 若规则已命中但仍显示旧广告，先排查本地缓存；上游建议首次使用时卸载重装 App。若 HTTPS 请求未解密，检查 MitM 与 QUIC 设置。
- 已完成模拟响应、正常内容保留、开屏响应格式及配置匹配验证，尚未完成 Loon/腾讯体育真机验证。
- 本地验证：`node tests/tencent-sports.test.cjs`。

## 腾讯体育 / 腾讯视频（@ZenmoFeiShi 版）

来源为 TG@ZenMoFiShi 的 [txsports-ad-clean.snippet](https://github.com/ZenmoFeiShi/Qx/blob/0569e497ba42b342d8d52e87f096dbdac91bf803/txsports-ad-clean.snippet)
及 [TxvideoAD.snippet](https://github.com/ZenmoFeiShi/Qx/blob/0569e497ba42b342d8d52e87f096dbdac91bf803/TxvideoAD.snippet)，脚本取同一提交的 `txsports-ad-clean.js` 和 `Txvideoad.js`，保留原协议转换逻辑及作者署名。

- 需要 Loon 3.5.1(983)+，开启 MitM 并安装、信任 CA 证书。二进制规则启用 `binary-body-mode=true`，使用 Loon 的 `Uint8Array body`；JSON/XML 规则使用文本模式。
- **安装 `tencent-sports-zenmo-clean` 前，禁用旧版 `tencent-sports-clean`**。两者覆盖的功能不同，旧版的开屏空响应和 `feeds/list` 脚本会与新版冲突。使用腾讯视频版时也应禁用旧体育版，避免其通用配置空响应覆盖视频配置。
- 新体育版与新视频版可以一起启用：共享的 `config.ab.qq.com/tab/GetTabRemoteConfig` 使用互斥 User-Agent 条件，`QQSportsV3/` 交由体育版，其余请求保留上游视频版的处理范围；无需依赖两个新插件的排列顺序。
- 体育版处理开屏开关、首页模块/热词、我的页推广和会员入口；上游还会清空 `liveSum` 的 `sum/mids` 及含 `matchInfo` 的 `multiUpdate` 数据，此行为随原版保留。
- 体育版的 `sports.ssp.qq.com/app` 请求会添加 `X-Loon-Sports-SSP-Target: 0/1`，仅传递广告请求是否命中的判断结果，不传递原正文。若其他插件移除该 Header 且响应阶段无请求正文，该项净化会跳过。
- 视频版保留上游 TRPC 请求/响应、JCE 和 gzip 处理，包含前贴片/中插/暂停广告列表清理，并保留两条域名拒绝规则。无需从旧体育版另行引入基础模块才能运行这些处理分支；实际播放效果尚未真机验证。
- 添加后完全退出再启动对应 App。若仍显示缓存界面，先确认请求是否命中及 HTTPS 是否解密；本次未验证所有 App 版本或所有广告形式。
- 已用独立构造的数据验证 Protobuf、gzip、TRPC、JCE 广告列表、JSON/XML、异常放行及 UA 分流；这不能替代真机抓包和播放验证。
- 本地验证：`node tests/tencent-zenmo.test.cjs`。

## 库迪咖啡微信小程序插件

基于 @Zirawell 的 [cotti.js](https://github.com/zirawell/R-Store/blob/02451c1fb536296842c950f94479141f08c30a03/Res/Scripts/AntiAd/cotti.js) 和用户提供的 QX 规则适配。
保留上游内置 AES 实现及参数，在请求阶段解密 `data`，仅对原五个推广 code 返回本地 HTTP 404；广告排序接口返回空 JSON。

- 开启 MitM，并安装、信任 Loon CA 证书；关闭后重新打开库迪咖啡微信小程序。
- 将原请求脚本的状态行改为 Loon 的 `$done({response:{status:404,...}})`，正常请求通过 `$done({})` 放行。补充缺失、异常正文的放行处理，避免重复完成或解析异常中断。
- 十六进制参数解码改用脚本自带的 CryptoJS，不依赖运行时是否提供 `TextDecoder`。
- 保留原 URL 范围：`position/list` 仅匹配无查询参数的地址；`adSortList` 保留原前缀匹配。
- 已通过独立 AES 测试数据、全部五个推广标识、正常请求及异常正文的模拟验证，尚未完成 Loon/微信真机验证。
- 本地验证：`node --check scripts/cotti/cotti.js && node tests/cotti.test.cjs`。

## 转转插件

基于 @ddgksf2013 的 [转转净化 V1.0.6](https://ddgksf2013.top/rewrite/ZhuanZhuanAds.conf)（上游更新日期 2026-08-24，2026-11-01 获取）转换，保留原 16 条 JQ 净化规则和 6 条拦截规则、6 个 MitM 域名。无需下载外部脚本。

- 需要 Loon 3.5.1(978)+；开启 MitM，并安装、信任 Loon CA 证书，完全退出再启动转转。
- 信息流保留 `type` 不为数字 `29` 的项目；我的页钱包只保留 `balance`，工具栏移除原规则指定的金融、租机等推广项目。
- 规则也会关闭新人专区、会员中心等运营入口。接口匹配范围和缺失字段处理与上游 JQ 表达式保持一致。
- 已完成原生 JQ 样例、正常项目保留及 URL 匹配验证，尚未完成 Loon/转转真机验证。

## 微博增强插件

基于 @ddgksf2013 的 [WeiboEnhanced.conf](https://ddgksf2013.top/rewrite/WeiboEnhanced.conf)（规则 V0.1.21，更新日期 2026-10-19）和 [weibo_json.js](https://ddgksf2013.top/scripts/weibo_json.js)（脚本 0.1.52，2026-11-01 获取），原贡献者 @zmqcherish。脚本内置 Loon 运行时适配，本仓库原样保存脚本，仅转换插件配置。

- 开启 MitM，安装、信任 Loon CA 证书；禁用其他微博净化脚本以避免同一接口重复改写，完全退出再启动微博。
- 在 Safari 打开[微博助手本机设置页](https://api.weibo.cn/__qx_weibo_settings__/)，或从微博内脚本生成的助手入口进入。设置页和配置/保存/重置 API 均由 Loon 请求脚本在本机返回，不需要真实服务端提供页面。路径中的 `qx` 是上游保留的兼容标识，Loon 也使用这个地址。
- 在设置页控制首页顶部“推荐” TAB、七个关注分组（全部关注、特别关注、好友圈、原创、视频、V+微博、群微博）及其他开关；默认设置沿用上游。配置保存在 Loon 的 `$persistentStore`。
- QX 的 `udp_drop_list = QUIC` 不适用于 Loon。本插件包含 4 条域名与 `PROTOCOL,QUIC` 组合规则，阻止相关微博 API 的 QUIC，帮助回落到可解密连接；需 Loon 3.1.7+。未封锁其他应用的 QUIC。主配置更高优先级的规则或无法识别域名的连接仍可能影响拦截。
- 规则覆盖首页/关注信息流、搜索、发现、个人页、详情/评论、视频频道和开屏等接口，实际净化效果取决于 App 版本与响应结构。
- 自定义开屏图片是上游可选功能，默认关闭；用户选择必应、随机图片或自定义图片来源时，脚本可能向相应图片接口发起请求。
- 已验证 Loon 本机设置页、配置保存/重置、七个分组及推荐 TAB 设置和模拟净化响应，尚未完成 Loon/微博真机验证。
- 本地验证：`node tests/weibo-enhanced.test.cjs`。
