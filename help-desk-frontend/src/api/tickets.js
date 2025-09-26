import { apiFetch } from "./http";

export function listTickets({ page = 1, pageSize = 10, status, q } = {}) {
  return apiFetch("/tickets", { params: { page, pageSize, status, q } });
}

export function getTicket(id) {
  return apiFetch(`/tickets/${id}`);
}

export function createTicket(payload) {
  return apiFetch("/tickets", { method: "POST", body: payload });
}

export function updateTicket(id, payload) {
  return apiFetch(`/tickets/${id}`, { method: "PUT", body: payload });
}

export function listComments(ticketId) {
  return apiFetch(`/tickets/${ticketId}/comments`);
}

export function addComment(ticketId, body) {
  return apiFetch(`/tickets/${ticketId}/comments`, { method: "POST", body: { body } });
}
