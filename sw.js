const CACHE_NAME = 'cctv-ofertas-v1.1.3';
const ASSETS = [
    '/',
    '/index.html',
    '/src/styles/global.css',
    '/src/scripts/layout.js',
    '/src/scripts/main.js',
    '/src/assets/images/logo.png'
    // JSON data excluded from precache to always get fresh data
];

self.addEventListener('install', (event) => {
    self.skipWaiting(); // Force activate new service worker
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS))
            .catch(err => console.error('SW Install Cache Error:', err))
    );
});

self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        Promise.all([
            // Claim all clients immediately
            self.clients.claim(),
            // Clean up old caches
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheWhitelist.indexOf(cacheName) === -1) {
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
        ])
    );
});

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // NEVER cache JSON data files - always network-first with no cache storage
    if (url.pathname.includes('.json')) {
        event.respondWith(
            fetch(event.request, { cache: 'no-store' })
                .catch(() => caches.match(event.request))
        );
        return;
    }

    // Network-first for HTML documents
    if (event.request.destination === 'document') {
        event.respondWith(
            fetch(event.request)
                .then(networkResponse => {
                    return caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    });
                })
                .catch(() => {
                    return caches.match(event.request).then(cachedResponse => {
                        return cachedResponse || caches.match('/src/pages/404.html');
                    });
                })
        );
        return;
    }

    // Cache-first for other static assets (images, css, js)
    if (true) {
        // Cache-first for images, css, js
        event.respondWith(
            caches.match(event.request).then(cachedResponse => {
                return cachedResponse || fetch(event.request).then(networkResponse => {
                    return caches.open(CACHE_NAME).then(cache => {
                        if (event.request.url.startsWith('http')) {
                            cache.put(event.request, networkResponse.clone());
                        }
                        return networkResponse;
                    });
                });
            })
        );
    }
});
