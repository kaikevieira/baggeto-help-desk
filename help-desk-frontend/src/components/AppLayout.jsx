import Sidebar from "./SideBar";
import { useAuth } from "../context/AuthContext.jsx";

export default function AppLayout({ onNavigate, onLogout, children }) {
  const { user } = useAuth();
  const theme = user?.theme || 'DARK';
  return (
    <div className="min-h-screen bg-fundo text-texto overflow-x-hidden max-w-full" data-theme={theme}>
      {/* Sidebar fixa para desktop */}
      <div className="fixed left-0 top-0 z-40 w-72 h-full hidden md:block overflow-y-auto">
        <Sidebar onNavigate={onNavigate} onLogout={onLogout} />
      </div>
      
      {/* Main content com margem para sidebar */}
      <main className="md:ml-72 min-h-screen p-4 sm:p-6 max-w-full overflow-x-hidden">
        {children}
      </main>
      
      {/* Sidebar mobile overlay */}
      <div className="md:hidden fixed inset-0 z-50 bg-black/50" id="mobile-sidebar">
        <div className="w-72 h-full" style={{ backgroundColor: 'var(--color-sidebar)' }}>
          <Sidebar onNavigate={onNavigate} onLogout={onLogout} />
        </div>
      </div>
    </div>
  );
}
