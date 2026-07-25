/* Firebase Cloud Messaging background handler.
 *
 * This is a SEPARATE service worker from the app shell SW (sw.js). FCM registers
 * it at its own scope for background push. The config below is the public
 * Firebase web config (not secret). Keep the SDK version in sync with the
 * `firebase` dependency in package.json.
 */
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyBEyiz3yCcIWVyQwfTMjpI0wsz5qKvq9vI',
  authDomain: 'today-ish-b648a.firebaseapp.com',
  projectId: 'today-ish-b648a',
  storageBucket: 'today-ish-b648a.firebasestorage.app',
  messagingSenderId: '696382847793',
  appId: '1:696382847793:web:d364fb4f60ef474338ce10',
});

const messaging = firebase.messaging();

// The Cloud Function sends DATA-only messages so we control rendering here
// (avoids the double-notification you get when a `notification` payload is also
// auto-displayed by the browser).
messaging.onBackgroundMessage((payload) => {
  const data = payload.data || {};
  const title = data.title || 'Today-ish';
  const body = data.body || '';
  self.registration.showNotification(title, {
    body,
    tag: data.tag || undefined, // same tag → replaces instead of stacking
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    data,
  });
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(self.clients.openWindow('/'));
});
