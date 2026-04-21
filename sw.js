const CACHE_NAME = 'cctv-ofertas-v1.1.1';
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
    // Determine if request is for data (JSON) or HTML Document
    const isDataOrHtml =
        event.request.url.includes('.json') ||
        event.request.destination === 'document';

    if (isDataOrHtml) {
        // Network-first strategy for data and HTML
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
                        if (cachedResponse) {
                            return cachedResponse;
                        }
                        if (event.request.destination === 'document') {
                            return caches.match('/src/pages/404.html');
                        }
                    });
                })
        );
    } else {
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
