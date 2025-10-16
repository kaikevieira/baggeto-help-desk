import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { FullPageSkeleton } from "../components/Skeletons";

export default function PrivateRoute() {
  const { user, initializing } = useAuth();
  const loc = useLocation();

  if (initializing) {
    return <FullPageSkeleton />;
  }
  
  if (!user) {
    return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  }
  
  return <Outlet />;
}
