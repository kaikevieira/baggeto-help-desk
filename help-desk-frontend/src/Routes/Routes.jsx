import { Navigate, Route, Routes } from "react-router-dom";
import PrivateRoute from "../context/PrivateRoute.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import Dashboard from "../pages/Dashboard";
import Login from "../pages/Login";
import Settings from "../pages/Settings";
import Team from "../pages/Team";
import TicketDetails from "../pages/TicketDetails";
import TicketNew from "../pages/TicketNew";
import Tickets from "../pages/Tickets";
import IOSCookieTest from "../components/IOSCookieTest";

const MainRoutes = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  return (
    <Routes>
      {/* pública */}
      <Route path="/login" element={<Login />} />
      <Route path="/ios-test" element={<IOSCookieTest />} />

      {/* protegidas */}
      <Route element={<PrivateRoute />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tickets" element={<Tickets />} />
        <Route path="/tickets/new" element={<TicketNew />} />
        <Route path="/tickets/:id" element={<TicketDetails />} />
        {isAdmin ? (
          <Route path="/team" element={<Team />} />
        ) : (
          <Route path="/team" element={<Navigate to="/dashboard" replace />} />
        )}
        <Route path="/settings" element={<Settings />} />
      </Route>

      {/* fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default MainRoutes;
