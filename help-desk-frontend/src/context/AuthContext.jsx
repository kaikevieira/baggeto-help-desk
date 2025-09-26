import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { login as apiLogin, logout as apiLogout, refresh as apiRefresh } from "../api/auth";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("auth_user") || "null"); } catch { return null; }
  });
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        if (!user) {
          await apiRefresh();
        }
      } catch (_) {
        // ignorar
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
    }
  }), [user, initializing]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
