export async function requestNotificationPermission() {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  const permission = await Notification.requestPermission();
  return permission === "granted";
}

export function scheduleNotification(hour) {
  if (!("serviceWorker" in navigator)) return;
  const now = new Date();
  const scheduled = new Date();
  scheduled.setHours(hour, 0, 0, 0);
  if (scheduled <= now) scheduled.setDate(scheduled.getDate() + 1);
  const delay = scheduled.getTime() - now.getTime();

  setTimeout(() => {
    if (Notification.permission === "granted") {
      new Notification("⚡ Hunter System", {
        body: "Your daily quests await. Don't break your streak!",
        icon: "/vite.svg",
        badge: "/vite.svg",
        tag: "daily-quest-reminder",
      });
    }
    scheduleNotification(hour);
  }, delay);
}

export function sendInstantNotification(title, body) {
  if (Notification.permission === "granted") {
    new Notification(title, { body, icon: "/vite.svg", tag: "hunter-notification" });
  }
}