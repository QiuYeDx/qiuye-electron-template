export function showSystemNotification(
  title: string,
  body: string,
  force = false
) {
  if (!force && typeof document !== "undefined" && document.hidden) return;
  window.ipcRenderer.send("show-notification", { title, body });
}
