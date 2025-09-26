import { apiFetch } from "./http";

export function summary() {
  return apiFetch("/dashboard/summary");
}
