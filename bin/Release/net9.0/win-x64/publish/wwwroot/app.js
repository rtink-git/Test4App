
// Function to check if the app is running inside Telegram Mini App

function isRunningInTelegramWebApp() {
    const tg = window.Telegram?.WebApp;
    return ( tg && typeof tg.initData === 'string' && tg.initData.length > 0 );
}

// Run behavior based on the environment

window.IS_RUNNING_IN_TELEGRAM_WEBAPP = isRunningInTelegramWebApp()

if (window.IS_RUNNING_IN_TELEGRAM_WEBAPP) {
    const tg = window.Telegram.WebApp;
    tg.ready();
    tg.setBackgroundColor('#1f1f1f');
    tg.setHeaderColor('bg_color');
    tg.expand(); // Expand the app to full screen
    console.log('Running inside Telegram Mini App');

  const initData = tg.initDataUnsafe;
  const encodedParam = initData.start_param;

  if (encodedParam && !sessionStorage.getItem('redirectedOnce')) {
      const base64 = encodedParam.replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
      const decodedPath = atob(padded);

      const currentPath = window.location.pathname;

      if (currentPath !== decodedPath) {
          sessionStorage.setItem('redirectedOnce', 'true');
          window.location.replace(decodedPath);
      }
  }
} else console.log('Not running in Telegram');



window.IS_PWA_MODE = (() => {
  return window.matchMedia('(display-mode: standalone)').matches ||
         window.navigator.standalone === true || // для iOS Safari
         document.referrer.startsWith('android-app://') ||
         window.IS_RUNNING_IN_TELEGRAM_WEBAPP;
})();

window.IS_LOCAL_HOST = ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname) || /^127\\.\\d+\\.\\d+\\.\\d+$/.test(window.location.hostname);

// Кэш для хранения уже найденных ответов из Cache API
const cacheResponses = new Map();

document.addEventListener('click', async function(event) {
  const link = event.target.closest('a');
  if (!link || !link.href || link.target === '_blank' || link.hasAttribute('download') || link.origin !== location.origin) return;
  if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.defaultPrevented) return;
  if (link.hash && link.pathname === location.pathname) return;

  event.preventDefault();
  const href = link.getAttribute('href');

  if (window.IS_PWA_MODE) {
    const success = await window.loadPageContent(href);
    if (!success) location.href = href;
    else history.pushState(null, '', href);
  } else location.href = href;
}, true);

window.loadPageContent = async function(path) {
  const fullUrl = new URL(path, location.origin).href;
  const relativePath = new URL(path, location.origin).pathname;

  if (!('caches' in window)) return false;

  const cacheKey = `${fullUrl}|${relativePath}`;
  if (cacheResponses.has(cacheKey)) return applyCachedResponse(cacheResponses.get(cacheKey));

  try {
    const cacheNames = await caches.keys();
    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      let response = await cache.match(fullUrl) || await cache.match(relativePath);

      if (response) {
        const text = await response.text();
        cacheResponses.set(cacheKey, text);
        return applyCachedResponse(text);
      }
    }
  } catch (err) { console.error('Ошибка при обращении к кэшу:', err); }

  return false;
};

function applyCachedResponse(text) {
  const endIndex = text.toLowerCase().indexOf('</head>') + 7;
  const headOnlyText = text.slice(0, endIndex) + '</html>';
  const doc = new DOMParser().parseFromString(headOnlyText, 'text/html');

  if (doc.title) document.title = doc.title;

  requestAnimationFrame(() => {
    document.body.replaceChildren('');
    replaceHead(doc.head);
  });

  return true;
}

function getElementKey(el) {
  if (el.tagName === 'TITLE') return 'TITLE';

  if (el.tagName === 'META') {
    const name = el.getAttribute('name') || el.getAttribute('property') || el.getAttribute('charset');
    if (name) return `META:${name}`;
    const httpEquiv = el.getAttribute('http-equiv');
    if (httpEquiv) return `META:${httpEquiv}`;
    return `META:${el.outerHTML.length}`;
  }

  if (el.tagName === 'LINK') {
    const rel = el.getAttribute('rel');
    const href = el.getAttribute('href');
    if (rel && href) return `LINK:${rel}:${new URL(href, location.origin).href}`;
  }

  if (el.tagName === 'STYLE') return `STYLE:${el.textContent.length}`;

  const attrs = [];
  for (const {name, value} of el.attributes)
    if (['id', 'class', 'src', 'href', 'type', 'rel'].includes(name))
      attrs.push(`${name}=${value}`);
  return `${el.tagName}:${attrs.join('|')}`;
}

async function replaceHead(newHead) {
  const fragment = document.createDocumentFragment();
  const scriptsToLoad = [];

  document.head.querySelectorAll('script[type="module"]').forEach(s => s.remove());

  const isEqualElement = (oldEl, newEl) => {
    if (oldEl.tagName !== newEl.tagName) return false;
    if (oldEl.type === 'application/ld+json') return false;
    if (oldEl.outerHTML === newEl.outerHTML) return true;

    if (oldEl.tagName === 'META') return oldEl.name === newEl.name && oldEl.content === newEl.content;

    if (oldEl.tagName === 'LINK') return oldEl.rel === newEl.rel && oldEl.href === newEl.href;

    return false;
  };

  for (const newNode of newHead.children) {
    if (newNode.tagName === 'SCRIPT') {
      const isModule = newNode.type === 'module';
      const isJsonLd = newNode.type === 'application/ld+json';
      const src = newNode.getAttribute('src');

      if (isJsonLd) document.head.querySelectorAll('script[type="application/ld+json"]').forEach(s => s.remove());

      const script = document.createElement('script');
      if (isModule || isJsonLd || !document.head.querySelector(`script[src="${src}"]`)) {
        if (src) script.src = src;
        script.type = newNode.type || 'text/javascript';
        script.textContent = newNode.textContent;
        if (newNode.async) script.async = true;
        if (newNode.defer) script.defer = true;
        fragment.appendChild(script);
      }
    } else {
      let exists = false;
      for (const oldNode of document.head.children)
        if (isEqualElement(oldNode, newNode)) {
          exists = true;
          break;
        }

      if (!exists) fragment.appendChild(newNode.cloneNode(true));
    }
  }

  for (const oldNode of [...document.head.children]) {
    if (oldNode.tagName === 'SCRIPT' && 
        oldNode.type !== 'module' && 
        oldNode.type !== 'application/ld+json') continue;

    let exists = false;
    for (const newNode of newHead.children)
      if (isEqualElement(oldNode, newNode)) {
        exists = true;
        break;
      }

    if (!exists) oldNode.remove();
  }

  document.head.appendChild(fragment);
}

const registerServiceWorker = async () => {
  if (!('serviceWorker' in navigator)) return;

  if (window.IS_LOCAL_HOST) {
    console.log('Service Worker отключен на localhost');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('/serviceworker.js');
    console.log('Service Worker зарегистрирован:', registration);
    registration.update().catch(() => {});
  } catch (error) { console.error('Ошибка регистрации Service Worker:', error); }
};

if (document.readyState === 'complete') { registerServiceWorker(); } else { window.addEventListener('load', registerServiceWorker); }
