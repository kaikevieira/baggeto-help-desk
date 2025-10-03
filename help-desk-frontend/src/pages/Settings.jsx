import AppLayout from "../components/AppLayout";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import { usePageTitle } from "../hooks/usePageTitle";
import { PageHeaderSkeleton, Skeleton } from "../components/Skeletons";

export default function Settings() {
  usePageTitle('Configurações');
  const navigate = useNavigate();
  const { user, logout, initializing } = useAuth();

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
          <h2 className="text-lg font-medium text-titulo">Minha conta</h2>
          <ul className="mt-2 text-sm text-texto/80 space-y-1">
            <li>
              <strong>Usuário:</strong> {user?.username}
            </li>
            <li>
              <strong>Perfil:</strong> {user?.role}
            </li>
          </ul>
        </div>

        <div className="flex gap-2">
          <Button onClick={logout}>Sair</Button>
          <button
            className="rounded-xl border border-borda px-4 py-2 text-texto"
            disabled
          >
            Tema (em breve)
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
