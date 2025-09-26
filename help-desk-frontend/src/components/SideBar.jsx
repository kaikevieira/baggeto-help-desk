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
    className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition
      ${active ? "bg-azul-escuro/20 text-titulo border border-azul-escuro/40" : "text-texto hover:bg-white/5"}`}
  >
    <span className="grid h-8 w-8 place-items-center rounded-lg border border-borda bg-[#1b1b1b] text-texto group-hover:text-titulo">
      <Icon className="h-5 w-5" />
    </span>
    <span className="truncate">{label}</span>
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

  // Destaca automaticamente com base na URL atual (sem depender de "current")
  const isActive = (match) => {
    if (Array.isArray(match)) return match.some((m) => pathname.startsWith(m));
    return pathname.startsWith(match);
  };
  // Mantém compatibilidade com prop "current" se você ainda passar ela do AppLayout
  const active = (key, match) => (current ? current === key : isActive(match));

  const handleLogout = async () => {
    try {
      await logout(); // limpa cookies/localStorage
    } finally {
      navigate("/login", { replace: true });
    }
  };

  return (
    <aside className="sticky top-0 hidden h-screen w-72 flex-col border-r border-borda bg-[#141414] p-4 md:flex">
      {/* Logo */}
      <div className="mb-4 flex items-center gap-3 px-2">
        <img
          src="/logo.png"
          alt="Transportes Baggeto"
          className="h-10 w-10 rounded-xl object-contain bg-azul-escuro/10"
        />
        <div>
          <p className="leading-tight text-base font-semibold text-titulo">
            Transportes Baggeto
          </p>
          <p className="text-xs text-texto">Service Desk</p>
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
      <nav className="grid gap-2">
        <NavItem
          label="Dashboard"
          icon={FiHome}
          active={active("dashboard", "/dashboard")}
          onClick={() => go("/dashboard")}
        />
        <NavItem
          label="Chamados"
          icon={FiList}
          active={active("tickets", ["/tickets"]) && !isActive("/tickets/new")}
          onClick={() => go("/tickets")}
        />
        <NavItem
          label="Novo Chamado"
          icon={FiPlusCircle}
          active={active("new", "/tickets/new")}
          onClick={() => go("/tickets/new")}
        />
        <NavItem
          label="Equipe"
          icon={FiUsers}
          active={active("team", "/team")}
          onClick={() => go("/team")}
        />
        <NavItem
          label="Configurações"
          icon={FiSettings}
          active={active("settings", "/settings")}
          onClick={() => go("/settings")}
        />
      </nav>

      {/* Sair (funciona em todas as telas) */}
      <div className="mt-auto px-2">
        <button
          className="flex w-full items-center gap-3 rounded-xl border border-borda px-3 py-2 text-left text-sm text-texto hover:bg-white/5"
          onClick={handleLogout}
        >
          <FiLogOut className="h-5 w-5" />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}
