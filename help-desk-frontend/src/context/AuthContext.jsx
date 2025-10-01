import React, { createContext, useContext, useEffect, useMemo, useState, useRef } from "react";
import { login as apiLogin, logout as apiLogout, refresh as apiRefresh, me as apiMe } from "../api/auth";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("auth_user") || "null"); } catch { return null; }
  });
  const [initializing, setInitializing] = useState(true);
  const refreshTimerRef = useRef(null);

  // Função para configurar refresh preventivo
  const setupRefreshTimer = () => {
    // Limpa timer anterior se existir
    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current);
    }

    // Refresh a cada 14 minutos (1 minuto antes de expirar)
    refreshTimerRef.current = setInterval(async () => {
      if (user) {
        try {
          await apiRefresh();
          console.log('Token refreshed preventively');
        } catch (error) {
          console.error('Preventive refresh failed:', error);
          // Se refresh preventivo falhar, faz logout
          setUser(null);
          localStorage.removeItem("auth_user");
        }
      }
    }, 14 * 60 * 1000); // 14 minutos
  };

  // Limpa timer quando componente desmonta
  useEffect(() => {
    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, []);

  // Setup inicial e refresh timer quando user muda
  useEffect(() => {
    if (user) {
      setupRefreshTimer();
    } else if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  }, [user]);

  useEffect(() => {
    let timeoutId;
    
    (async () => {
      try {
        // Timeout de segurança: se não resolver em 10 segundos, para a inicialização
        timeoutId = setTimeout(() => {
          console.warn('Auth initialization timeout');
          setInitializing(false);
        }, 10000);

        // Se já tem usuário no localStorage, verifica se é válido
        if (user) {
          try {
            // Tenta fazer uma requisição para verificar se token ainda é válido
            await apiMe();
            // Se chegou aqui, token é válido, não precisa fazer nada
          } catch (error) {
            // Token inválido, tenta refresh
            try {
              await apiRefresh();
              const { user: userData } = await apiMe();
              setUser(userData);
              localStorage.setItem("auth_user", JSON.stringify(userData));
            } catch (refreshError) {
              // Refresh falhou, remove dados inválidos
              localStorage.removeItem("auth_user");
              setUser(null);
            }
          }
        } else {
          // Não tem usuário, tenta verificar se há sessão válida
          try {
            await apiRefresh();
            const { user: userData } = await apiMe();
            setUser(userData);
            localStorage.setItem("auth_user", JSON.stringify(userData));
          } catch (_) {
            // Sem sessão válida, garante que localStorage está limpo
            localStorage.removeItem("auth_user");
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Em caso de erro não esperado, limpa estado
        localStorage.removeItem("auth_user");
        setUser(null);
      } finally {
        clearTimeout(timeoutId);
        setInitializing(false);
      }
    })();

    // Cleanup function
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []); // eslint-disable-line

  const value = useMemo(() => ({
    user,
    initializing,
    async login(username, password) {
      const { user: u } = await apiLogin(username, password);
      setUser(u);
      localStorage.setItem("auth_user", JSON.stringify(u));
      return u;
    },
    async logout() {
      try { await apiLogout(); } catch {}
      setUser(null);
      localStorage.removeItem("auth_user");
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    }
  }), [user, initializing]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
