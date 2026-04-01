// Service Worker for KiryanaBook Push Notifications
self.addEventListener('push', function(event) {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: 'https://api.dicebear.com/7.x/shapes/svg?seed=KiryanaBook&backgroundColor=00E676',
            vibrate: [300, 100, 300, 100, 600],
            requireInteraction: true,
            badge: 'https://api.dicebear.com/7.x/shapes/svg?seed=KiryanaBook&backgroundColor=000'
        };
        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

self.addEventListener('notificationclick', function(event) {
    const urlToOpen = event.notification.data?.url || '/';
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(windowClients) {
            for (var i = 0; i < windowClients.length; i++) {
                var client = windowClients[i];
                if (client.url === urlToOpen && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});
