import { apiFetch } from "./http";

export const listTemplates = () => apiFetch('/templates');
export const createTemplate = (payload, { idempotencyKey } = {}) =>
	apiFetch('/templates', { method: 'POST', body: payload, idempotencyKey });
export const updateTemplate = (id, payload, { idempotencyKey } = {}) =>
	apiFetch(`/templates/${id}`, { method: 'PUT', body: payload, idempotencyKey });
export const deleteTemplate = (id, { idempotencyKey } = {}) =>
	apiFetch(`/templates/${id}`, { method: 'DELETE', idempotencyKey });
