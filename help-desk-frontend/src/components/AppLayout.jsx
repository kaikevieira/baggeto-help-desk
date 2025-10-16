import Sidebar from "./SideBar";
import { useAuth } from "../context/AuthContext.jsx";

export default function AppLayout({ onNavigate, onLogout, children }) {
  const { user } = useAuth();
  const theme = user?.theme || 'DARK';
  return (
    <div className="min-h-screen bg-fundo text-texto overflow-x-hidden max-w-full" data-theme={theme}>
      {/* Sidebar - fixa no desktop */}
      <Sidebar onNavigate={onNavigate} onLogout={onLogout} />
      
      {/* Main content com margem para sidebar apenas no desktop */}
      <main className="md:ml-72 min-h-screen p-4 sm:p-6 max-w-full overflow-x-hidden pt-20 md:pt-4">
        {children}
      </main>
    </div>
  );
}
