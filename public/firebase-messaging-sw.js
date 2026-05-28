importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyB-YyhH6YxdWs121F0cooKUJmu0WdTB7sk",
  authDomain: "hertsu-452a6.firebaseapp.com",
  projectId: "hertsu-452a6",
  storageBucket: "hertsu-452a6.firebasestorage.app",
  messagingSenderId: "540872912805",
  appId: "1:540872912805:web:bc49d0c9e8c30c5c89824c",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body, icon } = payload.notification || {};
  self.registration.showNotification(title || "BKAM Alert", {
    body: body || "Price update!",
    icon: icon || "/icon-192.png",
    badge: "/icon-192-maskable.png",
    data: { url: payload.data?.url || "/" },
  });
});
