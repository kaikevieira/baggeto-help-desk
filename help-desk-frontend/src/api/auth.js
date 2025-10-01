import { apiFetch } from "./http";

export function login(username, password) {
  return apiFetch("/auth/login", { method: "POST", body: { username, password } });
}

export function logout() {
  return apiFetch("/auth/logout", { method: "POST" });
}

export function refresh() {
  return apiFetch("/auth/refresh", { method: "POST" });
}

export function me() {
  return apiFetch("/auth/me");
}
