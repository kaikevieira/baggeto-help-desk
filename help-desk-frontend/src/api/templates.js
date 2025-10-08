import { apiFetch } from "./http";

export const listTemplates = () => apiFetch('/templates');
export const createTemplate = (payload) => apiFetch('/templates', { method: 'POST', body: payload });
export const updateTemplate = (id, payload) => apiFetch(`/templates/${id}`, { method: 'PUT', body: payload });
export const deleteTemplate = (id) => apiFetch(`/templates/${id}`, { method: 'DELETE' });
