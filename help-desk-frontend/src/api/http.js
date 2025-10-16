// Detecta automaticamente se estamos em desenvolvimento ou produção
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
export const BASE_URL = isDevelopment 
  ? "http://localhost:4000" 
  : "https://free-sarajane-kaikevieira-4a44ef78.koyeb.app";

console.log('🌐 Environment detected:', { 
  isDevelopment, 
  hostname: window.location.hostname, 
  baseUrl: BASE_URL 
});

// Flag para evitar múltiplos refreshes simultâneos
let isRefreshing = false;
let refreshPromise = null;

// Função para detectar iOS
const isIOSDevice = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

// Função de fetch com timeout para iOS
const fetchWithTimeout = (url, options, timeout = 30000) => {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), timeout)
    )
  ]);
};

async function refreshToken() {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }
  
  isRefreshing = true;
  const isIOS = isIOSDevice();
  
  console.log('🔄 Attempting token refresh...', { isIOS, baseUrl: BASE_URL });
  
  refreshPromise = fetchWithTimeout(`${BASE_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
    headers: { 
      "Content-Type": "application/json",
      // Headers específicos para iOS
      ...(isIOS && {
        "Cache-Control": "no-cache",
        "Pragma": "no-cache",
        "Accept": "application/json, text/plain, */*"
      })
    }
  }, isIOS ? 60000 : 30000); // 60s timeout para iOS, 30s para outros

  try {
    const res = await refreshPromise;
    console.log('🔄 Refresh response:', { status: res.status, ok: res.ok });
    if (!res.ok) {
      throw new Error(`Refresh falhou: ${res.status} ${res.statusText}`);
    }
    const result = await res.json();
    console.log('✅ Token refresh successful');
    return result;
  } catch (error) {
    console.error('❌ Token refresh failed:', error);
    throw error;
  } finally {
    isRefreshing = false;
    refreshPromise = null;
  }
}

export async function apiFetch(path, { method = "GET", headers = {}, body, params, idempotencyKey, _isRetry = false } = {}) {
  const url = new URL(path, BASE_URL);
  if (params && typeof params === "object") {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, v);
    });
  }

  const isIOS = isIOSDevice();
  
  const opts = {
    method,
    credentials: "include", // envia cookies httpOnly
    headers: { 
      "Content-Type": "application/json", 
      // Headers específicos para iOS
      ...(isIOS && {
        "Cache-Control": "no-cache",
        "Pragma": "no-cache",
        "Accept": "application/json, text/plain, */*"
      }),
      ...headers 
    },
  };

  if (idempotencyKey && typeof idempotencyKey === 'string') {
    opts.headers["Idempotency-Key"] = idempotencyKey;
  }

  if (body !== undefined) {
    opts.body = typeof body === "string" ? body : JSON.stringify(body);
  }

  const res = await fetchWithTimeout(url, opts, isIOS ? 60000 : 30000);
  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json() : await res.text();

  console.log(`🌐 API Request: ${method} ${path}`, { 
    status: res.status, 
    ok: res.ok,
    credentials: opts.credentials,
    isIOS 
  });

  // Se token expirou (401) e não é uma rota de auth, tenta refresh
  if (res.status === 401 && !_isRetry && !path.includes('/auth/')) {
    console.log('🔑 Token expired, attempting refresh...');
    try {
      await refreshToken();
      console.log('🔄 Retrying original request...');
      // Retry a requisição original
      return apiFetch(path, { method, headers, body, params, _isRetry: true });
    } catch (refreshError) {
      console.error('❌ Refresh failed, redirecting to login:', refreshError);
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
