const CACHE = 'colonies-v5';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];
const EXTRA = ['https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'];
self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await c.addAll(SHELL);
    await Promise.all(EXTRA.map(u => c.add(u).catch(() => {})));
    self.skipWaiting();
  })());
});
self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const same = new URL(r.url).origin === location.origin;
  e.respondWith((async () => {
    const c = await caches.open(CACHE);
    if (same) {
      try { const n = await fetch(r); if (n.ok) c.put(r, n.clone()); return n; }
      catch (_) { return (await c.match(r, { ignoreSearch: true })) || (await c.match('index.html')); }
    }
    const hit = await c.match(r);
    const net = fetch(r).then(n => { if (n.ok || n.type === 'opaque') c.put(r, n.clone()); return n; }).catch(() => hit);
    return hit || net;
  })());
});
