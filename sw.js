// Troque a versão a cada deploy para forçar a atualização do cache
const CACHE_NAME = '221snack-v2';
const FONT_CACHE = '221snack-fonts';

// Arquivos essenciais para o app abrir offline (caminhos relativos ao sw.js)
const APP_SHELL = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './images/favicon.png',
  './images/apple-touch-icon.png',
  './images/icon-192.png',
  './images/icon-512.png',
  './images/icon-maskable-512.png'
];

// 1. Instalação: salva o app shell e ativa a nova versão sem esperar
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

// 2. Ativação: remove caches antigos e assume o controle das abas abertas
self.addEventListener('activate', event => {
  const keep = [CACHE_NAME, FONT_CACHE];
  event.waitUntil(
    caches.keys()
      .then(names => Promise.all(
        names.filter(name => !keep.includes(name)).map(name => caches.delete(name))
      ))
      .then(() => self.clients.claim())
  );
});

// 3. Fetch
self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Google Fonts: cache primeiro (arquivos não mudam)
  if (url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com') {
    event.respondWith(
      caches.open(FONT_CACHE).then(cache =>
        cache.match(request).then(cached =>
          cached || fetch(request).then(response => {
            cache.put(request, response.clone());
            return response;
          })
        )
      )
    );
    return;
  }

  if (url.origin !== self.location.origin) return;

  // Navegação (HTML): rede primeiro, para sempre pegar a versão nova; offline cai no cache
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put('./index.html', copy));
          return response;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Demais arquivos (CSS, JS, imagens): responde do cache e atualiza em segundo plano
  event.respondWith(
    caches.open(CACHE_NAME).then(cache =>
      cache.match(request).then(cached => {
        const network = fetch(request)
          .then(response => {
            if (response.ok) cache.put(request, response.clone());
            return response;
          })
          .catch(() => cached);
        return cached || network;
      })
    )
  );
});
