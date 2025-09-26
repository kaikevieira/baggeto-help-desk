import { Navigate, Route, Routes } from "react-router-dom";
import PrivateRoute from "../context/PrivateRoute.jsx";
import Dashboard from "../pages/Dashboard";
import Login from "../pages/Login";
import Settings from "../pages/Settings";
import Team from "../pages/Team";
import TicketDetails from "../pages/TicketDetails";
import TicketNew from "../pages/TicketNew";
import Tickets from "../pages/Tickets";

const MainRoutes = () => {
  return (
    <Routes>
      {/* pública */}
      <Route path="/login" element={<Login />} />

      {/* protegidas */}
      <Route element={<PrivateRoute />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tickets" element={<Tickets />} />
        <Route path="/tickets/new" element={<TicketNew />} />
        <Route path="/tickets/:id" element={<TicketDetails />} />
        <Route path="/team" element={<Team />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      {/* fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default MainRoutes;
