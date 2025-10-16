import React, { useEffect, useState } from "react";
import {
  FiHome,
  FiList,
  FiPlusCircle,
  FiUsers,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiX,
} from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
// import { useMobileMenu } from "../hooks/useMobileMenu.js";

const NavItem = ({ icon: Icon, label, active = false, onClick }) => (
  <button
    onClick={onClick}
    className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition-all duration-300 ease-in-out transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-azul-claro/50
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
  // const mobileMenu = useMobileMenu();
  
  // Estado local para controlar o menu mobile
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Fecha o menu mobile quando a rota muda
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Previne scroll do body quando menu está aberto
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  // Fecha o menu ao pressionar ESC
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen]);

  // Navega usando prop se vier do layout; senão, usa o router direto
  const go = (to) => {
    if (onNavigate) {
      onNavigate(to);
    } else {
      navigate(to);
    }
    setIsMobileMenuOpen(false); // Fecha o menu mobile após navegação
  };

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

  const SidebarContent = () => (
    <>
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
          {user?.fullName || user?.username || "—"}
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
    </>
  );

  return (
    <>
      {/* Botão Menu Hambúrguer - Visível apenas em mobile */}
      <button
        onClick={() => {
          setIsMobileMenuOpen(!isMobileMenuOpen);
        }}
        className={`fixed top-4 left-4 z-50 flex items-center justify-center h-12 w-12 rounded-xl bg-azul-claro text-white shadow-lg border border-azul-claro/20 md:hidden transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-azul-claro/50 ${
          isMobileMenuOpen ? 'rotate-180' : 'rotate-0'
        }`}
        aria-label={isMobileMenuOpen ? "Fechar menu" : "Abrir menu"}
        aria-expanded={isMobileMenuOpen}
      >
        <div className="relative">
          <FiMenu className={`h-6 w-6 transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0 rotate-180' : 'opacity-100 rotate-0'}`} />
          <FiX className={`h-6 w-6 absolute inset-0 transition-all duration-300 ${isMobileMenuOpen ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-180'}`} />
        </div>
      </button>

      {/* Overlay para mobile */}
      <div 
        className={`fixed inset-0 bg-black/50 z-30 md:hidden transition-opacity duration-300 ease-in-out ${
          isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => {
          setIsMobileMenuOpen(false);
        }}
        aria-hidden="true"
      />

      {/* Sidebar Desktop */}
      <aside 
        className="fixed top-0 left-0 hidden h-screen w-72 flex-col border-r border-borda p-4 md:flex z-20" 
        style={{ backgroundColor: 'var(--color-sidebar)' }}
      >
        <SidebarContent />
      </aside>

      {/* Sidebar Mobile */}
      <aside 
        className={`mobile-sidebar fixed top-0 left-0 z-40 h-screen w-72 flex flex-col border-r border-borda p-4 md:hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full shadow-none'
        }`}
        style={{ backgroundColor: 'var(--color-sidebar)' }}
        onClick={(e) => e.stopPropagation()}
        role="navigation"
        aria-label="Menu de navegação principal"
      >
        <SidebarContent />
      </aside>
    </>
  );
}
