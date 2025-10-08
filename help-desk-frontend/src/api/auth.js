import { apiFetch } from "./http";

export function login(username, password, { idempotencyKey } = {}) {
  return apiFetch("/auth/login", { method: "POST", body: { username, password }, idempotencyKey });
}

export function logout({ idempotencyKey } = {}) {
  return apiFetch("/auth/logout", { method: "POST", idempotencyKey });
}

export function refresh({ idempotencyKey } = {}) {
  return apiFetch("/auth/refresh", { method: "POST", idempotencyKey });
}

export function me() {
  return apiFetch("/auth/me");
}
