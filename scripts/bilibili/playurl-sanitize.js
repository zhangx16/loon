/**
 * Bilibili playurl 响应净化（Loon http-response 脚本 / 通用 Surge 兼容写法）
 *
 * 只做两件事，对应上游 Make-Bilibili-Great-Than-Ever-Before 的 disable-av1 与 no-p2p：
 *   1. 从 dash.video / support_formats 里剔除 AV1（codecid 13 / codecs 含 av01）
 *   2. 从 baseUrl / backupUrl / durl 里剔除 PCDN、P2P 地址，并把可用的正常地址顶到 baseUrl
 *
 * 与用户脚本版本的区别：这里是在"完整候选列表"上做静态裁剪，不需要运行时反复探测/重试。
 * 代价是拿不到播放器内部的健康度信息，也不会做 CDN 优选/预热。
 *
 * 注意：Loon 的异步模型是回调式，本脚本全部同步执行，末尾只调用一次 $done()。
 */

var PCDN_KEYWORDS = [
  '302ppio',
  '302kodo',
  '.mcdn.bilivideo',
  'szbdyd.com',
  '.nexusedgeio.com',
  '.ahdohpiechei.com',
  // 项目里同样被标记为 P2P：证书与实际域名不匹配的 mirror
  'upos-sz-mirror14b.bilivideo.com'
];

var OS_MCDN = /[?&]os=mcdn(?:&|$)/;
/** 纯 IP / *.mcdn 的独立路径 PCDN，B 站官方代理能替我们取到同一份数据 */
var MCDN_TF = /^https?:\/\/(?:(?:\d{1,3}\.){3}\d{1,3}|[^/]+\.mcdn\.bilivideo\.(?:com|cn|net))(?::\d{1,5})?\/v\d\/resource/;
var PROXY_TF = 'https://proxy-tf-all-ws.bilivideo.com';

function isMcdnTf(url) {
  return typeof url === 'string' && MCDN_TF.test(url);
}

function isPcdnUrl(url) {
  if (typeof url !== 'string' || url.length === 0) {
    return false;
  }
  if (OS_MCDN.test(url) || MCDN_TF.test(url)) {
    return true;
  }
  for (var i = 0; i < PCDN_KEYWORDS.length; i++) {
    if (url.indexOf(PCDN_KEYWORDS[i]) !== -1) {
      return true;
    }
  }
  return false;
}

/** 上游 no-p2p 的做法：mcdn 独立路径交给官方代理取，签名仍然有效 */
function viaProxy(url) {
  return PROXY_TF + '?url=' + encodeURIComponent(url);
}

function isAv1Video(item) {
  if (!item) {
    return false;
  }
  if (item.codecid === 13) {
    return true;
  }
  // 少数接口不带 codecid，用 mimeType / codecs 兜底
  if (typeof item.mimeType === 'string' && item.mimeType.indexOf('av01') !== -1) {
    return true;
  }
  return typeof item.codecs === 'string' && item.codecs.indexOf('av01') !== -1;
}

/**
 * 一个 DASH 条目（video / audio）的 URL 字段：
 *   baseUrl: string
 *   backupUrl: string[] | null
 * 目标：baseUrl 不能是 PCDN；backupUrl 里剔掉 PCDN。
 * 如果 baseUrl 是 PCDN，就把第一个可用的备用地址顶上去。
 */
function sanitizeDashItem(item) {
  if (!item) {
    return false;
  }
  var changed = false;

  var backup = Array.isArray(item.backupUrl) ? item.backupUrl : [];
  var keptBackup = [];
  for (var i = 0; i < backup.length; i++) {
    if (isPcdnUrl(backup[i])) {
      changed = true;
    } else {
      keptBackup.push(backup[i]);
    }
  }

  if (typeof item.baseUrl === 'string' && isPcdnUrl(item.baseUrl)) {
    if (keptBackup.length > 0) {
      item.baseUrl = keptBackup.shift();
      changed = true;
    } else if (isMcdnTf(item.baseUrl)) {
      // 没有备用地址：别让播放器直接撞 PCDN，改走官方代理
      item.baseUrl = viaProxy(item.baseUrl);
      changed = true;
    }
    // 其他情况（PCDN 且无备用、又没法代理）：原样留着，总比播不了好
  }

  if (Array.isArray(item.backupUrl)) {
    item.backupUrl = keptBackup;
  }

  return changed;
}

/** durl（FLV / MP4 老接口）：url + backup_url */
function sanitizeDurlItem(item) {
  if (!item) {
    return false;
  }
  var changed = false;
  var backup = Array.isArray(item.backup_url) ? item.backup_url : [];
  var kept = [];
  for (var i = 0; i < backup.length; i++) {
    if (isPcdnUrl(backup[i])) {
      changed = true;
    } else {
      kept.push(backup[i]);
    }
  }
  if (typeof item.url === 'string' && isPcdnUrl(item.url)) {
    if (kept.length > 0) {
      item.url = kept.shift();
      changed = true;
    } else if (isMcdnTf(item.url)) {
      item.url = viaProxy(item.url);
      changed = true;
    }
  }
  if (Array.isArray(item.backup_url)) {
    item.backup_url = kept;
  }
  return changed;
}

function sanitize(json) {
  var data = json && json.data;
  if (!data) {
    return false;
  }
  var changed = false;

  // 1. AV1：视频流与清晰度列表
  if (Array.isArray(data.support_formats)) {
    var formats = [];
    for (var i = 0; i < data.support_formats.length; i++) {
      var f = data.support_formats[i];
      if (f && typeof f.codecs === 'string' && f.codecs.indexOf('av01') === 0) {
        changed = true;
        continue;
      }
      formats.push(f);
    }
    data.support_formats = formats;
  }

  var dash = data.dash;
  if (dash) {
    if (Array.isArray(dash.video)) {
      var videos = [];
      for (var j = 0; j < dash.video.length; j++) {
        var v = dash.video[j];
        if (isAv1Video(v)) {
          changed = true;
          continue;
        }
        if (sanitizeDashItem(v)) {
          changed = true;
        }
        videos.push(v);
      }
      dash.video = videos;
    }
    if (Array.isArray(dash.audio)) {
      for (var k = 0; k < dash.audio.length; k++) {
        if (sanitizeDashItem(dash.audio[k])) {
          changed = true;
        }
      }
    }
  }

  // 2. durl（部分投稿 / 番剧仍走这个接口）
  if (Array.isArray(data.durl)) {
    for (var m = 0; m < data.durl.length; m++) {
      if (sanitizeDurlItem(data.durl[m])) {
        changed = true;
      }
    }
  }

  return changed;
}

(function main() {
  var body = $response && $response.body;
  if (!body || ($response.status && $response.status !== 200)) {
    $done({});
    return;
  }

  var json;
  try {
    json = JSON.parse(body);
  } catch (e) {
    $done({});
    return;
  }

  var changed;
  try {
    changed = sanitize(json);
  } catch (e) {
    console.log('bili-playurl-sanitize: sanitize failed: ' + e);
    $done({});
    return;
  }

  if (!changed) {
    $done({});
    return;
  }

  $done({ body: JSON.stringify(json) });
})();
