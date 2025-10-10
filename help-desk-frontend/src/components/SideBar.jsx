import React from "react";
import {
  FiHome,
  FiList,
  FiPlusCircle,
  FiUsers,
  FiSettings,
  FiLogOut,
} from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const NavItem = ({ icon: Icon, label, active = false, onClick }) => (
  <button
    onClick={onClick}
    className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition-all duration-300 ease-in-out transform hover:scale-[1.02]
      ${
        active 
          ? "bg-azul-claro/15 text-titulo border border-azul-claro/60 shadow-lg shadow-azul-claro/10" 
          : "text-texto hover:bg-azul-claro/8 hover:text-titulo hover:border-azul-claro/30 border border-transparent"
      }`}
  >
    {/* Indicador de ativo - barra lateral */}
    {active && (
      <div className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-azul-claro animate-pulse" />
    )}
    
    <span className={`grid h-8 w-8 place-items-center rounded-lg border transition-all duration-300
      ${
        active 
          ? "border-azul-claro/50 bg-azul-claro/25 text-azul-claro" 
          : "border-borda bg-[var(--color-surface)] text-texto group-hover:text-azul-claro group-hover:border-azul-claro/40 group-hover:bg-azul-claro/10"
      }`}>
      <Icon className="h-5 w-5" />
    </span>
    <span className="truncate font-medium">{label}</span>
  </button>
);

export default function Sidebar({
  // mantém compatibilidade, mas o ativo é inferido pela URL automaticamente
  current,
  onNavigate,
}) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Navega usando prop se vier do layout; senão, usa o router direto
  const go = (to) => (onNavigate ? onNavigate(to) : navigate(to));

  // Destaca automaticamente com base na URL atual
  const isActive = (match) => {
    if (Array.isArray(match)) {
      return match.some((m) => pathname === m || pathname.startsWith(m + '/'));
    }
    return pathname === match || pathname.startsWith(match + '/');
  };

  const handleLogout = async () => {
    try {
      await logout(); // limpa cookies/localStorage
    } finally {
      navigate("/login", { replace: true });
    }
  };

  return (
    <aside className="sticky top-0 hidden h-screen w-72 flex-col border-r border-borda p-4 md:flex" style={{ backgroundColor: 'var(--color-sidebar)' }}>
      {/* Logo */}
  <div className="mb-4 flex items-center gap-3 px-2 group cursor-pointer transition-all duration-300 hover:scale-105">
        <img
          src="/logo.png"
          alt="Transportes Baggeto"
          className="h-10 w-10 rounded-xl object-contain transition-all duration-300 group-hover:bg-azul-claro/10 group-hover:shadow-lg group-hover:shadow-azul-claro/20"
        />
        <div className="transition-all duration-300 group-hover:translate-x-1">
          <p className="leading-tight text-base font-semibold text-titulo group-hover:text-azul-claro transition-colors duration-300">
            Transportes Baggeto
          </p>
          <p className="text-xs text-texto group-hover:text-texto/80 transition-colors duration-300">Service Desk</p>
        </div>
      </div>

      {/* Usuário logado */}
      <div className="mb-6 px-2">
        <p className="text-xs text-texto/60">Logado como</p>
        <p className="truncate text-sm font-medium text-titulo">
          {user?.username ?? "—"}
        </p>
      </div>

      {/* Navegação */}
      <nav className="grid gap-2 relative">
        <NavItem
          label="Dashboard"
          icon={FiHome}
          active={isActive("/dashboard")}
          onClick={() => go("/dashboard")}
        />
        <NavItem
          label="Chamados"
          icon={FiList}
          active={isActive("/tickets") && !isActive("/tickets/new")}
          onClick={() => go("/tickets")}
        />
        <NavItem
          label="Novo Chamado"
          icon={FiPlusCircle}
          active={isActive("/tickets/new")}
          onClick={() => go("/tickets/new")}
        />
        {user?.role === 'ADMIN' && (
          <NavItem
            label="Equipe"
            icon={FiUsers}
            active={isActive("/team")}
            onClick={() => go("/team")}
          />
        )}
        <NavItem
          label="Configurações"
          icon={FiSettings}
          active={isActive("/settings")}
          onClick={() => go("/settings")}
        />
      </nav>

      {/* Sair (funciona em todas as telas) */}
      <div className="mt-auto px-2">
        <button
          className="group flex w-full items-center gap-3 rounded-xl border border-borda px-3 py-2 text-left text-sm text-texto hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-all duration-300 ease-in-out transform hover:scale-[1.02]"
          onClick={handleLogout}
        >
          <span className="grid h-8 w-8 place-items-center rounded-lg border border-borda text-texto group-hover:text-red-400 group-hover:border-red-500/30 transition-all duration-300" style={{ backgroundColor: 'var(--color-surface)' }}>
            <FiLogOut className="h-5 w-5" />
          </span>
          <span className="font-medium">Sair</span>
        </button>
      </div>
    </aside>
  );
}
