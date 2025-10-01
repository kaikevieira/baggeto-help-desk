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
    (async () => {
      try {
        if (!user) {
          // Tenta fazer refresh para verificar se ainda tem sessão válida
          await apiRefresh();
          // Se refresh foi bem-sucedido, busca dados do usuário
          const { user: userData } = await apiMe();
          setUser(userData);
          localStorage.setItem("auth_user", JSON.stringify(userData));
        }
      } catch (_) {
        // Se refresh ou /me falhou, usuário não está autenticado
        localStorage.removeItem("auth_user");
        setUser(null);
      } finally {
        setInitializing(false);
      }
    })();
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
