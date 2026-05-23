self.addEventListener("push", function (event) {
  const data = event.data ? event.data.json() : {};
  const title = data.title || "⚡ Hunter System";
  const options = {
    body: data.body || "Your daily quests await!",
    icon: "/vite.svg",
    badge: "/vite.svg",
    tag: "daily-reminder",
    vibrate: [200, 100, 200],
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  event.waitUntil(clients.openWindow("/"));
});