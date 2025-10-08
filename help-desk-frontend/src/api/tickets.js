import { apiFetch } from "./http";

export function listTickets({ page = 1, pageSize = 10, status, q } = {}) {
  return apiFetch("/tickets", { params: { page, pageSize, status, q } });
}

export function getTicket(id) {
  return apiFetch(`/tickets/${id}`);
}

export function createTicket(payload, { idempotencyKey } = {}) {
  return apiFetch("/tickets", { method: "POST", body: payload, idempotencyKey });
}

export function updateTicket(id, payload, { idempotencyKey } = {}) {
  return apiFetch(`/tickets/${id}`, { method: "PUT", body: payload, idempotencyKey });
}

export function listComments(ticketId) {
  return apiFetch(`/tickets/${ticketId}/comments`);
}

export function addComment(ticketId, body, { idempotencyKey } = {}) {
  return apiFetch(`/tickets/${ticketId}/comments`, { method: "POST", body: { body }, idempotencyKey });
}

export function deleteTicket(id, { idempotencyKey } = {}) {
  return apiFetch(`/tickets/${id}`, { method: "DELETE", idempotencyKey });
}
