// Minimal client for testing emails from Team page
import { apiFetch } from "./http";

export function sendTestEmailToUser(userId) {
  return apiFetch(`/notifications/test-email/${userId}`, { method: 'POST' });
}