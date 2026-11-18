// Retire the previous offline dashboard without touching other site caches.
self.addEventListener('install', event => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    await caches.delete('zoz-brain-v1');
    await self.clients.claim();

    const scope = new URL(self.registration.scope);
    const destination = new URL('gravikind/', scope).href;
    const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    await Promise.all(windows.map(async client => {
      const url = new URL(client.url);
      if (url.origin !== scope.origin || !url.pathname.startsWith(scope.pathname)) return;
      const path = url.pathname.slice(scope.pathname.length);
      const retired = path === '' || path === 'index.html' || path === 'brain.html' || path === 'app-v1' || path.startsWith('app-v1/');
      if (retired) {
        try { await client.navigate(destination); } catch (_) { /* A tab may have closed. */ }
      }
    }));
    await self.registration.unregister();
  })());
});

// No fetch handler: all requests use the network normally.
