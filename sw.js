/* Service worker: ưu tiên mạng (luôn lấy bản mới nhất), mất mạng thì dùng bản đã lưu. */
var CACHE = 'mln-gameshow-v13';
var FILES = [
  './',
  'index.html',
  'style.css',
  'app.js',
  'rank.js',
  'questions.js',
  'theory.js',
  'explain.js',
  'manifest.webmanifest',
  'logo.png',
  'icon-192.png',
  'icon-512.png',
  'qr-mb.png',
  'sw.js'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE)
      .then(function (c) { return c.addAll(FILES); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (ks) {
      return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  try {
    if (new URL(e.request.url).origin !== self.location.origin) return;
  } catch (err) {
    return;
  }
  e.respondWith(
    fetch(e.request).then(function (r) {
      if (r && r.status === 200) {
        var copy = r.clone();
        caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
      }
      return r;
    }).catch(function () {
      return caches.match(e.request).then(function (m) { return m || caches.match('index.html'); });
    })
  );
});
