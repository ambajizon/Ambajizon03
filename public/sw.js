const CACHE_NAME = 'ambajizon-admin-v1';

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll([
                '/',
                '/dashboard',
                '/auth/login',
                '/icons/ambajizon-192.png',
                '/icons/ambajizon-512.png'
            ]);
        })
    );
});

self.addEventListener('fetch', (e) => {
    if (e.request.method !== 'GET') return;
    if (!e.request.url.startsWith(self.location.origin)) return;

    e.respondWith(
        caches.match(e.request).then((response) => {
            // Return cached response if found
            if (response) {
                return response;
            }

            return fetch(e.request).catch(() => {
                // Offline fallback
                return new Response(
                    `<html><head><title>Offline</title><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;background-color:#1A237E;color:white;text-align:center;"><h2>🏪 Ambajizon</h2><p>You are offline.<br/>Please check your connection.</p><button onclick="window.location.reload()" style="margin-top:20px;padding:10px 20px;border-radius:20px;background:white;color:#1A237E;border:none;font-weight:bold;">Try Again</button></body></html>`,
                    { headers: { 'Content-Type': 'text/html' } }
                );
            });
        })
    );
});
