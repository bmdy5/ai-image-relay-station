// 最简的 Service Worker，不主动拦截请求做复杂缓存，仅为了满足 PWA 的“可安装”硬性指标。
// 这解决了“缓存旧页面导致用户无法更新”的问题。

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // 留空，全部放行网络请求（Network First / Bypass）
});
