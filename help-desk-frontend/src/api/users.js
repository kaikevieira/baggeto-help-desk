// src/api/users.js
import { apiFetch } from "./http";

export function listUsers(q = "") {
  return apiFetch("/users", { params: { q } });
}

export function getUsers() {
  return listUsers();
}

// ADMIN only
export function createUser({ username, password, role = "USER" }, { idempotencyKey } = {}) {
  return apiFetch("/users", {
    method: "POST",
    body: { username, password, role },
    idempotencyKey,
  });
}

// ADMIN only
export function updateUser(id, { username, password, role }, { idempotencyKey } = {}) {
  // envia somente campos definidos
  const body = {};
  if (username !== undefined) body.username = username;
  if (password !== undefined && password !== "") body.password = password; // opcional no edit
  if (role !== undefined) body.role = role;

  return apiFetch(`/users/${id}`, {
    method: "PUT",
    body,
    idempotencyKey,
  });
}

// Authenticated user: update own theme
export function updateMyTheme(theme, { idempotencyKey } = {}) {
  return apiFetch(`/users/me`, { method: "PATCH", body: { theme } , idempotencyKey });
}
