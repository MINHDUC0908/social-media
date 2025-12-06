// public/firebase-messaging-sw.js
importScripts("https://www.gstatic.com/firebasejs/9.6.10/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.6.10/firebase-messaging-compat.js");

console.log("🔧 Service Worker: Initializing...");

firebase.initializeApp({
    apiKey: "AIzaSyBZ-q-2BPN9-m_4S6KNT142uy-7hQ4b11Y",
    authDomain: "social-app-cf00a.firebaseapp.com",
    projectId: "social-app-cf00a",
    storageBucket: "social-app-cf00a.firebasestorage.app",
    messagingSenderId: "636694123334",
    appId: "1:636694123334:web:41a8f9a2e11310dea5cb47",
    measurementId: "G-VB5WJ284SJ"
});

console.log("✅ Service Worker: Firebase initialized");

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log("📩 [SW] Background message received:", payload);
    console.log("📦 [SW] Payload:", JSON.stringify(payload, null, 2));

    const notificationTitle = payload.notification?.title || payload.data?.title || "Thông báo mới";
    const notificationOptions = {
        body: payload.notification?.body || payload.data?.body || "",
        icon: payload.data?.image || "/vite.svg",
        badge: "/vite.svg",
        data: payload.data,
        tag: "friend-request",
        requireInteraction: true
    };

    console.log("🔔 [SW] Showing notification:", notificationTitle);

    return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Xử lý click notification
self.addEventListener('notificationclick', (event) => {
    console.log("🖱️ [SW] Notification clicked");
    event.notification.close();

    const clickAction = event.notification.data?.click_action || "/";
    
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                for (let client of clientList) {
                    if (client.url.includes(clickAction) && 'focus' in client) {
                        return client.focus();
                    }
                }
                if (clients.openWindow) {
                    return clients.openWindow(clickAction);
                }
            })
    );
});

console.log("✅ Service Worker: Ready to receive messages");