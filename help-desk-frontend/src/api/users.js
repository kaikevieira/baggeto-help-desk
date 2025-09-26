import { apiFetch } from "./http";

export function listUsers(q = "") {
  return apiFetch("/users", { params: { q } });
}
