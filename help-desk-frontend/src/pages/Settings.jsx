import AppLayout from "../components/AppLayout";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import { usePageTitle } from "../hooks/usePageTitle";
import { PageHeaderSkeleton, Skeleton } from "../components/Skeletons";
import { FiLogOut } from "react-icons/fi";

export default function Settings() {
  usePageTitle('Configurações');
  const navigate = useNavigate();
  const { user, logout, initializing, setTheme } = useAuth();
  const currentTheme = user?.theme || 'DARK';
  const themes = [
    { key: 'DARK', label: 'Escuro (padrão)' },
    { key: 'LIGHT', label: 'Claro' },
    { key: 'LIGHT_PINK', label: 'Claro (rosa claro)' },
  ];
  const initials = (user?.username?.[0] || '?').toUpperCase();

  if (initializing) {
    return (
      <AppLayout current="/settings" onNavigate={(to) => navigate(to)} onLogout={logout}>
        <PageHeaderSkeleton />
        <div className="grid max-w-xl gap-4">
          <div className="rounded-2xl border border-borda p-4">
            <Skeleton className="h-5 w-40 mb-3" />
            <Skeleton className="h-4 w-64 mb-2" />
            <Skeleton className="h-4 w-52" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      current="/settings"
      onNavigate={(to) => navigate(to)}
      onLogout={logout}
    >
      <section className="mb-6">
        <h1 className="text-2xl font-semibold text-titulo">Configurações</h1>
        <p className="text-texto/70">Preferências da conta</p>
      </section>

      <div className="grid max-w-xl gap-4">
        <div className="rounded-2xl border border-borda p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-azul-escuro text-white grid place-items-center font-semibold">
              {initials}
            </div>
            <div>
              <h2 className="text-lg font-medium text-titulo leading-tight">Minha conta</h2>
              <div className="mt-1 flex items-center gap-2 text-xs">
                <span className="rounded-full border border-borda px-2 py-0.5 text-texto/80">
                  {user?.role}
                </span>
                {user?.email && (
                  <span className="text-texto/70">{user.email}</span>
                )}
              </div>
            </div>
          </div>
          <ul className="mt-3 text-sm text-texto/80 space-y-1">
            <li>
              <strong>Usuário:</strong> {user?.username}
            </li>
            <li>
              <strong>Perfil:</strong> {user?.role}
            </li>
          </ul>
        </div>

        <div className="rounded-2xl border border-borda p-4">
          <h2 className="text-lg font-medium text-titulo mb-2">Tema</h2>
          <p className="text-sm text-texto/70 mb-3">Escolha seu tema padrão (salvo por usuário)</p>
          <div className="grid gap-2">
            <label htmlFor="theme" className="text-sm font-medium text-titulo">Selecionar tema</label>
            <select
              id="theme"
              value={currentTheme}
              onChange={async (e) => { await setTheme(e.target.value); }}
              className="w-full rounded-xl border bg-transparent px-4 py-3 text-titulo border-borda focus:border-azul-claro focus:outline-none focus:ring-2 focus:ring-azul-claro/20"
            >
              {themes.map((t) => (
                <option key={t.key} value={t.key} className="bg-[var(--color-surface)] text-titulo">
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={logout} className="w-auto">
            <FiLogOut className="h-5 w-5" />
            Sair
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
