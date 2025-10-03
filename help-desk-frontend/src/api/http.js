const BASE_URL = "http://uncertain-dione-kaikevieira-a7451037.koyeb.app";

// Flag para evitar múltiplos refreshes simultâneos
let isRefreshing = false;
let refreshPromise = null;

async function refreshToken() {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }
  
  isRefreshing = true;
  refreshPromise = fetch(`${BASE_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" }
  });

  try {
    const res = await refreshPromise;
    if (!res.ok) {
      throw new Error('Refresh falhou');
    }
    return await res.json();
  } finally {
    isRefreshing = false;
    refreshPromise = null;
  }
}

export async function apiFetch(path, { method = "GET", headers = {}, body, params, _isRetry = false } = {}) {
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

  // Se token expirou (401) e não é uma rota de auth, tenta refresh
  if (res.status === 401 && !_isRetry && !path.includes('/auth/')) {
    try {
      await refreshToken();
      // Retry a requisição original
      return apiFetch(path, { method, headers, body, params, _isRetry: true });
    } catch (refreshError) {
      // Se refresh falhou, redireciona para login
      if (typeof window !== 'undefined') {
        localStorage.removeItem("auth_user");
        window.location.href = '/login';
      }
      throw refreshError;
    }
  }

  if (!res.ok) {
    const message = (isJson && (data?.message || data?.error)) || res.statusText;
    const err = new Error(message || "Erro de requisição");
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}
