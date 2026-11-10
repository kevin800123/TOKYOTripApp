// 改任何檔案後，把 VERSION +1，手機下次開啟就會換新。沒改版號，手機會一直用舊版。
// 同一版的 HTML、CSS、JS 一律從同一份快取提供，避免新 HTML 配舊 JS 造成空白。
const VERSION = 'v8';
const CACHE = `tokyo-trip-${VERSION}`;
const FONT_CACHE = 'tokyo-trip-fonts';
// 景點照片跟著安裝一起快取，在山上沒訊號也看得到。新增照片要加進這裡。
const PHOTOS = [
    'ameyoko', 'daikanyama', 'ebisu', 'gala', 'gala_slope', 'izakaya', 'kagurazaka', 'koishikawa',
    'musashino', 'narita_t1', 'narita_t2', 'nezu', 'ponshukan', 'ramen', 'sento', 'shimokita',
    'soup_curry', 'ueno', 'ueno_park', 'whisky', 'yakiniku', 'yanaka', 'yushima', 'yuzawa',
];
const SHELL = [
    './',
    'index.html',
    'manifest.json',
    'css/style.css',
    'js/spots.js',
    'js/trip-data.js',
    'js/storage.js',
    'js/weather.js',
    'js/app.js',
    'icons/icon-192.png',
    'icons/icon-512.png',
    'icons/icon-maskable-512.png',
    'icons/apple-touch-icon.png',
    ...PHOTOS.map((name) => `photos/${name}.webp`),
];

self.addEventListener('install', (event) => {
    // cache: 'reload' 略過瀏覽器的 HTTP 快取，GitHub Pages 有 10 分鐘 max-age，否則新版快取可能裝到舊檔。
    event.waitUntil(
        caches.open(CACHE)
            .then((cache) => cache.addAll(SHELL.map((url) => new Request(url, { cache: 'reload' }))))
            .then(() => self.skipWaiting()),
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil((async () => {
        // 只清自己的舊快取，同網域的福岡版不受影響。
        const old = (await caches.keys()).filter((key) => key.startsWith('tokyo-trip-') && key !== CACHE && key !== FONT_CACHE);
        await Promise.all(old.map((key) => caches.delete(key)));
        // 接手後由 index.html 的 controllerchange 重載開著的舊畫面。
        await self.clients.claim();
    })());
});

async function fromShell(request) {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(request, { ignoreSearch: true });
    if (cached) return cached;
    if (request.mode === 'navigate') return cache.match('index.html');
    return fetch(request);
}

async function cacheFirstFont(request) {
    const cache = await caches.open(FONT_CACHE);
    const cached = await cache.match(request);
    if (cached) return cached;
    const response = await fetch(request);
    if (response.ok || response.type === 'opaque') await cache.put(request, response.clone());
    return response;
}

self.addEventListener('fetch', (event) => {
    const { request } = event;
    if (request.method !== 'GET') return;
    const url = new URL(request.url);

    if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
        event.respondWith(cacheFirstFont(request));
        return;
    }
    if (url.origin !== self.location.origin) return;

    event.respondWith(fromShell(request));
});
