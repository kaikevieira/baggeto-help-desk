import React, { createContext, useContext, useEffect, useMemo, useState, useRef } from "react";
import { login as apiLogin, logout as apiLogout, refresh as apiRefresh, me as apiMe } from "../api/auth";
import { updateMyTheme } from "../api/users";
import { debugCookies } from "../utils/cookieDebug";
import { testIOSCookies, forceIOSCookies } from "../utils/iosCookieHelper";

const AuthCtx = createContext(null);

// Função para detectar iOS
const isIOSDevice = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

// Função para detectar Safari
const isSafari = () => {
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("auth_user") || "null"); } catch { return null; }
  });
  const [initializing, setInitializing] = useState(true);
  const [authRetryCount, setAuthRetryCount] = useState(0);
  const [iosAuthComplete, setIosAuthComplete] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const refreshTimerRef = useRef(null);
  const isIOS = isIOSDevice();
  const deviceInfo = { isIOS, isSafari: isSafari() };

  // Função para configurar refresh preventivo
  const setupRefreshTimer = () => {
    // Limpa timer anterior se existir
    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current);
    }

    // Para iOS, usa refresh mais frequente (10 minutos) para compensar possíveis problemas
    const refreshInterval = isIOS ? 10 * 60 * 1000 : 14 * 60 * 1000;
    
    refreshTimerRef.current = setInterval(async () => {
      if (user) {
        try {
          await apiRefresh();
          console.log(`Token refreshed preventively (${deviceInfo.isIOS ? 'iOS' : 'other'})`);
          setAuthRetryCount(0); // Reset retry count on success
        } catch (error) {
          console.error('Preventive refresh failed:', error);
          setAuthRetryCount(prev => prev + 1);
          
          // Para iOS, tenta mais vezes antes de deslogar
          const maxRetries = isIOS ? 3 : 1;
          if (authRetryCount >= maxRetries) {
            console.warn(`Max auth retries reached (${authRetryCount}), logging out`);
            setUser(null);
            localStorage.removeItem("auth_user");
            setAuthRetryCount(0);
          }
        }
      }
    }, refreshInterval);
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
        // Timeout mais longo para iOS devido a possível latência
        const timeoutDuration = isIOS ? 20000 : 10000;
        timeoutId = setTimeout(() => {
          setInitializing(false);
        }, timeoutDuration);

        // Delay específico para iOS para garantir que cookies sejam processados
        if (isIOS) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Testa se cookies funcionam no iOS
          const cookiesWork = testIOSCookies();
          if (!cookiesWork) {
            console.warn('🚨 iOS: Cookies não estão funcionando, forçando...');
            await forceIOSCookies();
          }
          
          debugCookies(); // Debug inicial no iOS
        }

        // Log device info for debugging
        
        // Se já tem usuário no localStorage, verifica se é válido
        if (user && !isValidating) {
          setIsValidating(true);
          try {
            // Para iOS, aguarda mais tempo antes de validar
            if (isIOS) {
              await new Promise(resolve => setTimeout(resolve, 2000));
            }
            
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
              // Para iOS, tenta mais uma vez após delay
              if (isIOS && authRetryCount < 2) {
                setAuthRetryCount(prev => prev + 1);
                await new Promise(resolve => setTimeout(resolve, 3000));
                try {
                  await apiRefresh();
                  const { user: userData } = await apiMe();
                  setUser(userData);
                  localStorage.setItem("auth_user", JSON.stringify(userData));
                } catch (finalError) {
                  // Refresh falhou definitivamente, remove dados inválidos
                  localStorage.removeItem("auth_user");
                  setUser(null);
                }
              } else {
                // Refresh falhou, remove dados inválidos
                localStorage.removeItem("auth_user");
                setUser(null);
              }
            }
          } finally {
            setIsValidating(false);
          }
        } else if (!user) {
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
        // Em caso de erro não esperado, limpa estado
        localStorage.removeItem("auth_user");
        setUser(null);
      } finally {
        clearTimeout(timeoutId);
        setInitializing(false);
        // Marca que o iOS terminou o processo de autenticação
        if (isIOS) {
          setTimeout(() => setIosAuthComplete(true), 1000);
        }
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
    initializing: initializing || (isIOS && !iosAuthComplete),
    async login(username, password) {
      try {
        const { user: u } = await apiLogin(username, password);
        setUser(u);
        localStorage.setItem("auth_user", JSON.stringify(u));
        setAuthRetryCount(0); // Reset retry count on successful login
        
        // Delay específico para iOS para garantir que cookies sejam definidos
        if (isIOS) {
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Debug cookies no iOS após login
          debugCookies();
          
          // Verifica se o usuário ainda está válido após o delay
          try {
            await apiMe();
          } catch (verifyError) {
            console.log('iOS: Verificação pós-login falhou, tentando refresh');
            // Se falhar, tenta refresh uma vez
            await apiRefresh();
          }
        }
        
        console.log(`Login successful (${deviceInfo.isIOS ? 'iOS' : 'other'})`);
        return u;
      } catch (error) {
        console.error('Login failed:', error);
        throw error;
      }
    },
    async logout() {
      try { 
        await apiLogout(); 
        console.log('Logout API call successful');
      } catch (error) {
        console.error('Logout API call failed:', error);
      }
      setUser(null);
      localStorage.removeItem("auth_user");
      setAuthRetryCount(0);
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
      console.log(`Logout completed (${deviceInfo.isIOS ? 'iOS' : 'other'})`);
    },
    async setTheme(theme) {
      if (!user) return;
      const updated = await updateMyTheme(theme);
      setUser(updated);
      localStorage.setItem("auth_user", JSON.stringify(updated));
      return updated;
    }
  }), [user, initializing, iosAuthComplete, isIOS]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
