
const CACHE_NAME = 'RTSWStaticCache-2025-05-16-524681713';
const URLs_TO_CACHE = ['/','/UISs/i/script.min.js','/UISs/i/style.min.css','/Modules/BunnerBox/script.min.js','/Modules/BunnerBox/style.min.css','/Modules/HeaderBox/script.min.js','/Modules/HeaderBox/style.min.css','/Modules/Total/script.min.js','/Modules/Total/style.min.css','/Modules/ButtonBox/script.min.js','/Modules/ButtonBox/style.min.css','/UISs/books/script.min.js','/UISs/books/style.min.css','/Modules/ApiRtInk_MSAP/script.min.js','/Modules/BooksBox/script.min.js','/Modules/BooksBox/style.min.css','/UISs/task/script.min.js','/UISs/task/style.min.css','/Modules/TTBox/script.min.js','/Modules/TTBox/style.min.css','/UISs/book/script.min.js','/UISs/book/style.min.css','/Modules/BookBox/script.min.js','/Modules/BookBox/style.min.css','/UISs/bookEdit/script.min.js','/UISs/bookEdit/style.min.css','/Modules/BookEditBox/script.min.js','/Modules/BookEditBox/style.min.css','/offline'];
const OFFLINE_PAGE = '/offline';
const staticExtensions = ['.html', '.js', '.css', '.png', '.jpg', '.jpeg', '.svg', '.webp', '.gif', '.woff2', '.woff', '.ttf', '.eot'];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    self.skipWaiting(); // Принудительно активируем SW
    const cache = await caches.open(CACHE_NAME);
    
    for (const url of URLs_TO_CACHE) {
      try {
        await cache.add(url);
        console.log(`[ServiceWorker] Закеширован: ${url}`);
      } catch (e) {
        console.warn(`[ServiceWorker] Не удалось закешировать: ${url}`, e);
      }
    }

    console.log('[ServiceWorker] Установка завершена с частичным кэшированием.');
  })());
});

self.addEventListener('activate', (event) => {
    event.waitUntil((async () => {
        try {
            const cacheNames = await caches.keys();
            await Promise.all(cacheNames.filter(name => name !== CACHE_NAME).map(name => caches.delete(name)));
            await self.clients.claim();
            console.log('[ServiceWorker] Активация завершена.');
        } catch (e) {
            console.error('[ServiceWorker] Ошибка активации:', e);
        }
    })());
});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    event.respondWith((async () => {
        const req = event.request;
        const requestUrl = new URL(req.url);
        const isStatic = staticExtensions.some(ext => requestUrl.pathname.endsWith(ext));
        const cache = await caches.open(CACHE_NAME);

        if (isStatic) {
            const cached = await cache.match(req);
            if (cached) return cached;
        }

        try {
            const networkResponse = await fetch(req);
            if(![403, 404, 408, 500].includes(networkResponse.status)) await cache.put(req, networkResponse.clone()).catch(e => { console.error('Ошибка сохранения в кеш:', e); });
            return networkResponse;
        } catch (e) { 
            console.warn('[ServiceWorker] Сетевая ошибка:', e);

            // После того как ошибка в сети произошла, проверяем кеш
            const cachedResponse = await cache.match(req);
            if (cachedResponse) {
                console.log('[ServiceWorker] Ответ найден в кеше:', req.url); // Логируем, если нашли в кеше
                return cachedResponse;
            }

            const acceptHeader = req.headers.get('Accept') || '';
            const isHtml = acceptHeader.includes('text/html');

            if(isHtml) {
                const cached = await cache.match(OFFLINE_PAGE);
                if (cached) return cached;

                // Базовая offline-страница
                return new Response(
                    `<h1>Offline Mode</h1><p>The application is unavailable without internet access</p><p><a href='/' style='color: blue;'>Go to the homepage</a></p>`,
                    { headers: { 'Content-Type': 'text/html' } }
                );
            }
        }

        return new Response('Offline', { status: 503, statusText: 'Offline' });
    })());
});
