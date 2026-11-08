// 改任何檔案後，把 VERSION +1，手機下次開啟就會換新。
const VERSION = 'v2';
const CACHE = `tokyo-trip-${VERSION}`;
const FONT_CACHE = 'tokyo-trip-fonts';
const SHELL = [
    './',
    'index.html',
    'manifest.json',
    'css/style.css',
    'js/trip-data.js',
    'js/storage.js',
    'js/weather.js',
    'js/app.js',
    'icons/icon-192.png',
    'icons/icon-512.png',
    'icons/icon-maskable-512.png',
    'icons/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
    event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
    // 只清自己的舊快取，同網域的福岡版不受影響。
    event.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(keys
                .filter((key) => key.startsWith('tokyo-trip-') && key !== CACHE && key !== FONT_CACHE)
                .map((key) => caches.delete(key))))
            .then(() => self.clients.claim()),
    );
});

async function networkFirst(request) {
    const cache = await caches.open(CACHE);
    try {
        const response = await fetch(request);
        if (response.ok) await cache.put(request, response.clone());
        return response;
    } catch (error) {
        const cached = await cache.match(request, { ignoreSearch: true });
        return cached || cache.match('index.html');
    }
}

async function staleWhileRevalidate(request) {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(request, { ignoreSearch: true });
    const update = fetch(request)
        .then((response) => {
            if (response.ok) cache.put(request, response.clone());
            return response;
        })
        .catch(() => cached);
    return cached || update;
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

    event.respondWith(request.mode === 'navigate' ? networkFirst(request) : staleWhileRevalidate(request));
});
