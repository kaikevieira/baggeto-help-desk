import { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout";
import { listUsers } from "../api/users";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

export default function Team() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      if (user?.role !== "ADMIN") return;
      try {
        const u = await listUsers();
        setUsers(u);
      } catch (e) {
        setError(e?.message || "Erro ao listar usuários");
      }
    })();
  }, [user]);

  return (
    <AppLayout current="/team" onNavigate={(to) => navigate(to)}>
      <section className="mb-6">
        <h1 className="text-2xl font-semibold text-titulo">Equipe</h1>
        <p className="text-texto/70">Usuários do sistema (visível para ADMIN)</p>
      </section>

      {user?.role !== "ADMIN" ? (
        <div className="rounded-2xl border border-borda p-6 text-texto/80">
          Você não tem permissão para ver esta página.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-borda">
          <table className="min-w-full divide-y divide-borda/70">
            <thead className="bg-[#151515] text-xs uppercase tracking-wide text-texto">
              <tr>
                <th className="px-4 py-3 text-left">Usuário</th>
                <th className="px-4 py-3 text-left">Perfil</th>
                <th className="px-4 py-3 text-left">Criado em</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borda/60">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-white/5">
                  <td className="px-4 py-3 text-texto">{u.username}</td>
                  <td className="px-4 py-3 text-texto/80">{u.role}</td>
                  <td className="px-4 py-3 text-texto/70">
                    {new Date(u.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {error && <div className="p-3 text-sm text-red-300">{error}</div>}
        </div>
      )}
    </AppLayout>
  );
}
