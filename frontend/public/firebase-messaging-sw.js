// SikshaHub.AI - Firebase Cloud Messaging Service Worker
// Handles background push notifications for educators and institutions

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  let title = 'SikshaHub.AI Recruitment Alert';
  let body = 'A new teaching opportunity or platform announcement matches your profile.';
  let actionUrl = '/teacher-dashboard';
  let icon = '/logo.jpeg';
  let badge = '/logo.jpeg';

  if (event.data) {
    try {
      const payload = event.data.json();
      if (payload.notification) {
        title = payload.notification.title || title;
        body = payload.notification.body || body;
        icon = payload.notification.icon || icon;
      }
      if (payload.data) {
        title = payload.data.title || title;
        body = payload.data.body || payload.data.message || body;
        actionUrl = payload.data.actionUrl || actionUrl;
      }
    } catch (e) {
      body = event.data.text() || body;
    }
  }

  const notificationOptions = {
    body,
    icon,
    badge,
    data: {
      actionUrl,
      timestamp: Date.now(),
    },
    actions: [
      { action: 'open_url', title: 'View Opportunity' },
      { action: 'dismiss', title: 'Dismiss' }
    ],
    vibrate: [200, 100, 200],
  };

  event.waitUntil(
    self.registration.showNotification(title, notificationOptions)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const targetUrl = event.notification.data?.actionUrl || '/teacher-dashboard';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

