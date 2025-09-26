import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function PrivateRoute() {
  const { user, initializing } = useAuth();
  const loc = useLocation();

  if (initializing) {
    return <div className="p-6 text-texto">Inicializando...</div>;
  }
  if (!user) {
    return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  }
  return <Outlet />;
}
