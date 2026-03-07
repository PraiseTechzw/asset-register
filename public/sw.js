const CACHE_NAME = 'asset-register-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/assets',
    '/transfers',
    '/audits',
    '/analytics',
    '/scanner',
    '/settings',
    '/favicon.ico',
    '/grid-bg.svg'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE).catch(err => console.log("Caching failed", err));
        })
    );
});

self.addEventListener('fetch', (event) => {
    // Only handle GET requests for navigation or static assets
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request).then((fetchResponse) => {
                // Optionally cache new successful GET requests
                return fetchResponse;
            });
        }).catch(() => {
            // If offline and not in cache, we could return a custom offline page
        })
    );
});
