var cacheName = 'PURE-PWA-Shell-1';
var filesToCache = [
    '/',
    '/Content/manifest.json',
    '/Content/bootstrap.min.css',
    '/Content/site.min.css',
    '/Content/slot.min.css',
    '/Content/Images/bg.png',
    '/Content/Images/logo-rectangle.png',
    '/Content/Images/side-nav-bg.jpg',
    '/Content/Font/material-icons.woff2',
    '/Content/Images/Icons/icon-128x128.png',
    '/Content/Images/Icons/icon-144x144.png',
    '/Content/Images/Icons/icon-152x152.png',
    '/Content/Images/Icons/icon-192x192.png',
    '/Content/Images/Icons/icon-256x256.png',
    '/Content/Images/Icons/icon-512x512.png',
    '/Scripts/modernizr-2.8.3.min.js',
    '/Scripts/jquery-3.3.1.min.js',
    '/Scripts/bootstrap.min.js',
    '/Scripts/app-1.0.0.min.js',
    '/Scripts/slot.min.js'
];

self.addEventListener('install', function (e) {
    //console.log('[ServiceWorker] Install');
    e.waitUntil(
        caches.open(cacheName).then(function (cache) {
            //console.log('[ServiceWorker] Caching app shell');
            return cache.addAll(filesToCache);
        })
    );
});

self.addEventListener('activate', function (e) {
    //console.log('[ServiceWorker] Activate');
    e.waitUntil(
        caches.keys().then(function (keyList) {
            return Promise.all(keyList.map(function (key) {
                if (key !== cacheName) {
                    console.log('[ServiceWorker] Removing old cache', key);
                    return caches.delete(key);
                }
            }));
        })
    );
    return self.clients.claim();
});

self.addEventListener('fetch', function (event) {
    // Parse the URL:
    var requestURL = new URL(event.request.url);

    if (event.request.method === 'POST') {
        return;
    }

    //console.log(event.request);

    event.respondWith(
        caches.match(event.request).then(function (response) {
            return response || fetch(event.request);
        })
    );
});

// 推送通知
self.addEventListener('push', function (event) {
    console.log('[Service Worker] Push Received.');
    console.log('[Service Worker] Push had this data:' + event.data.text());

    RefreshApp();

    //const title = '有新的更新';
    //const options = {
    //    body: 'Yay it works.',
    //    icon: 'images/icon.png',
    //    badge: 'images/badge.png'
    //};

    //event.waitUntil(self.registration.showNotification(title, options));
});

// 使用者點選通知
self.addEventListener('notificationclick', function (event) {
    console.log('[Service Worker] Notification click Received.');

    event.notification.close();

    //event.waitUntil(
    //    clients.openWindow('')
    //);
});