const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export async function apiFetch(path, { method = "GET", headers = {}, body, params } = {}) {
  const url = new URL(path, BASE_URL);
  if (params && typeof params === "object") {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, v);
    });
  }

  const opts = {
    method,
    credentials: "include", // envia cookies httpOnly
    headers: { "Content-Type": "application/json", ...headers },
  };

  if (body !== undefined) {
    opts.body = typeof body === "string" ? body : JSON.stringify(body);
  }

  const res = await fetch(url, opts);
  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    const message = (isJson && (data?.message || data?.error)) || res.statusText;
    const err = new Error(message || "Erro de requisição");
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}
