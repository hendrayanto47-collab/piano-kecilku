/* Piano Kecilku: simpan aplikasi dan suara di HP supaya cepat dan bisa dipakai tanpa internet */
const APP = 'pk-app-v1', SOUNDS = 'pk-sounds-v1';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(APP).then(c => c.addAll(SHELL))); self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== APP && k !== SOUNDS).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin === location.origin) {
    /* aplikasi: ambil versi terbaru dulu, pakai simpanan kalau tidak ada internet */
    e.respondWith(fetch(r).then(res => { const cp = res.clone(); caches.open(APP).then(c => c.put(r, cp)); return res; })
      .catch(() => caches.match(r).then(m => m || caches.match('./index.html'))));
    return;
  }
  if (/\.mp3$/.test(u.pathname) || /fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)) {
    /* suara alat musik dan huruf: pakai simpanan, unduh sekali saja */
    e.respondWith(caches.open(SOUNDS).then(c => c.match(r).then(m => m || fetch(r).then(res => { if (res.ok) c.put(r, res.clone()); return res; }))));
  }
});
