# loon

个人 Loon 插件与脚本集合。每个插件只做一件事，尽量不互相依赖。

## 插件列表

| 插件 | 说明 | 订阅地址 |
|---|---|---|
| `bilibili-network-lite` | B 站网络层净化：去 AV1、去 PCDN、挡埋点。不含去广告/布局等页面层功能 | [订阅](https://raw.githubusercontent.com/zhangx16/loon/main/plugins/bilibili-network-lite.plugin) |

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
