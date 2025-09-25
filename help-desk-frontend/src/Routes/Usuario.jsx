import { Navigate, Outlet } from "react-router-dom";

const Usuario = () => {

    const token = localStorage.getItem("token");
    if (!token) return <Navigate to="/login" replace />;
    return <Outlet />;
};

export default Usuario;