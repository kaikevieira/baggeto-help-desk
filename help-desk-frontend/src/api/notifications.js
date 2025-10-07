import { apiFetch, BASE_URL } from "./http";

export function listNotifications({ page = 1, pageSize = 20, unread } = {}) {
  return apiFetch("/notifications", { params: { page, pageSize, unread } });
}

export function unreadCount() {
  return apiFetch("/notifications/unread-count");
}

export function markRead(id) {
  return apiFetch(`/notifications/${id}/read`, { method: "POST" });
}

export function dismiss(id) {
  return apiFetch(`/notifications/${id}/dismiss`, { method: "POST" });
}

export function openNotificationsStream() {
  const url = `${BASE_URL}/notifications/stream`;
  const es = new EventSource(url, { withCredentials: true });
  return es;
}
