const CACHE_NAME = 'cctv-ofertas-v1';
const ASSETS = [
    '/',
    '/index.html',
    '/src/styles/global.css',
    '/src/scripts/layout.js',
    '/src/scripts/main.js',
    '/src/assets/images/logo.png'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS))
            .catch(err => console.error('SW Install Cache Error:', err))
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response; // Return cached asset
                }
                return fetch(event.request).catch(error => {
                    // Fallback to 404 page if offline and not cached
                    if (event.request.destination === 'document') {
                        return caches.match('/src/pages/404.html');
                    }
                    throw error;
                });
            })
    );
});

self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
