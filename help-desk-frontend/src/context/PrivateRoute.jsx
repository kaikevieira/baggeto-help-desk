import React, { useState, useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { FullPageSkeleton } from "../components/Skeletons";

// Função para detectar iOS
const isIOSDevice = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

export default function PrivateRoute() {
  const { user, initializing } = useAuth();
  const loc = useLocation();
  const [iosReady, setIosReady] = useState(!isIOSDevice());

  // Delay específico para iOS para garantir que cookies sejam processados
  useEffect(() => {
    if (isIOSDevice() && user && !initializing) {
      const timer = setTimeout(() => {
        setIosReady(true);
      }, 1500); // 1.5s delay para iOS

      return () => clearTimeout(timer);
    }
  }, [user, initializing]);

  if (initializing || (isIOSDevice() && !iosReady)) {
    return <FullPageSkeleton />;
  }
  
  if (!user) {
    return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  }
  
  return <Outlet />;
}
