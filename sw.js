// Service worker do Gerador de Propostas
// Guarda o app inteiro no aparelho para abrir sem internet.
const CACHE = 'propostas-dm-5f0ee0d4';
const ARQUIVOS = ['./', './index.html', './manifest.json'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((nomes) => Promise.all(nomes.filter((n) => n !== CACHE).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  // O banco de dados nunca é cacheado: ou vai para a rede, ou o app usa o
  // que está salvo no aparelho e enfileira para enviar depois.
  if (url.hostname.indexOf('firebaseio.com') !== -1) return;
  if (e.request.method !== 'GET') return;

  e.respondWith(
    caches.match(e.request).then((guardado) => {
      const daRede = fetch(e.request)
        .then((resp) => {
          if (resp && resp.status === 200 && resp.type === 'basic') {
            const copia = resp.clone();
            caches.open(CACHE).then((c) => c.put(e.request, copia));
          }
          return resp;
        })
        .catch(() => guardado);
      return guardado || daRede;
    })
  );
});
