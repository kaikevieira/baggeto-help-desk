import Sidebar from "./Sidebar";

export default function AppLayout({ onNavigate, onLogout, children }) {
  return (
    <div className="min-h-screen bg-fundo text-texto">
      <div className="mx-auto grid  grid-cols-1 md:grid-cols-[18rem_1fr]">
        <Sidebar onNavigate={onNavigate} onLogout={onLogout} />
        <main className="min-h-screen p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
