import React from "react";
import {
  FiHome,
  FiList,
  FiPlusCircle,
  FiUsers,
  FiSettings,
  FiLogOut,
} from "react-icons/fi";

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

export default function Sidebar({ current = "dashboard", onNavigate = () => {} }) {
  return (
    <aside className="sticky top-0 hidden h-screen w-72 flex-col border-r border-borda bg-[#141414] p-4 md:flex">
      {/* Logo */}
      <div className="mb-6 flex items-center gap-3 px-2">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-azul-escuro text-white">TB</div>
        <div>
          <p className="text-base font-semibold text-titulo leading-tight">Transportes Baggeto</p>
          <p className="text-xs text-texto">Service Desk</p>
        </div>
      </div>

      {/* Navegação */}
      <nav className="grid gap-2">
        <NavItem
          label="Dashboard"
          icon={FiHome}
          active={current === "dashboard"}
          onClick={() => onNavigate("/dashboard")}
        />
        <NavItem
          label="Chamados"
          icon={FiList}
          active={current === "tickets"}
          onClick={() => onNavigate("/tickets")}
        />
        <NavItem
          label="Novo Chamado"
          icon={FiPlusCircle}
          active={current === "new"}
          onClick={() => onNavigate("/tickets/new")}
        />
        <NavItem
          label="Equipe"
          icon={FiUsers}
          active={current === "team"}
          onClick={() => onNavigate("/team")}
        />
        <NavItem
          label="Configurações"
          icon={FiSettings}
          active={current === "settings"}
          onClick={() => onNavigate("/settings")}
        />
      </nav>

      {/* Sair */}
      <div className="mt-auto px-2">
        <button className="flex w-full items-center gap-3 rounded-xl border border-borda px-3 py-2 text-left text-sm text-texto hover:bg-white/5">
          <FiLogOut className="h-5 w-5" />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}
