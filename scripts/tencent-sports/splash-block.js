// Surge Map Local equivalent for Loon. Original: Hey-sayiwanna/TencentSports-Surge.
// Keep HTTP 200, an empty body and the original protobuf Content-Type.
const url = (typeof $request !== "undefined" && $request && $request.url) || "";
if (/^https:\/\/config\.ab\.qq\.com\/tab\/(?:GetTabRemoteConfig|GetTabToggle).*/.test(url)) {
  $done({
    response: {
      status: 200,
      headers: { "Content-Type": "application/proto" },
      body: ""
    }
  });
} else {
  $done({});
}
