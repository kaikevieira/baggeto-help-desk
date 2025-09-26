import { useEffect, useMemo, useState } from "react";
import AppLayout from "../components/AppLayout";
import { listUsers, createUser, updateUser } from "../api/users";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";

const RoleBadge = ({ role }) => {
  const color =
    role === "ADMIN"
      ? "bg-azul-escuro/20 text-azul-200 border-azul-escuro/40"
      : "bg-white/5 text-texto border-borda/70";
  return (
    <span className={`inline-flex items-center gap-1 rounded-lg border px-2 py-[2px] text-xs ${color}`}>
      {role === "ADMIN" ? "Admin" : "User"}
    </span>
  );
};

const SkeletonRow = () => (
  <tr className="animate-pulse">
    <td className="px-4 py-3">
      <div className="h-4 w-10 rounded bg-white/10" />
    </td>
    <td className="px-4 py-3">
      <div className="h-4 w-40 rounded bg-white/10" />
    </td>
    <td className="px-4 py-3">
      <div className="h-6 w-16 rounded bg-white/10" />
    </td>
    <td className="px-4 py-3">
      <div className="h-4 w-40 rounded bg-white/10" />
    </td>
    <td className="px-4 py-3">
      <div className="h-7 w-24 rounded bg-white/10" />
    </td>
  </tr>
);

function UserModal({ open, onClose, onSave, initial }) {
  const isEdit = Boolean(initial?.id);
  const [username, setUsername] = useState(initial?.username || "");
  const [role, setRole] = useState(initial?.role || "USER");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setUsername(initial?.username || "");
      setRole(initial?.role || "USER");
      setPassword("");
      setError("");
      setSaving(false);
    }
  }, [open, initial]);

  if (!open) return null;

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await onSave({
        username,
        role,
        password: isEdit ? password || undefined : password, // no edit, senha é opcional
      });
      onClose();
    } catch (err) {
      setError(err?.message || "Falha ao salvar usuário");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-borda bg-[#111] p-5">
        <h3 className="text-lg font-semibold text-titulo">
          {isEdit ? "Editar usuário" : "Novo usuário"}
        </h3>
        <p className="mb-4 text-sm text-texto/70">
          {isEdit
            ? "Atualize os dados do usuário. Deixe a senha em branco para não alterá-la."
            : "Crie um novo usuário com perfil e senha."}
        </p>

        <form onSubmit={submit} className="grid gap-4">
          <div>
            <label className="mb-1 block text-sm text-texto/80">Usuário</label>
            <input
              className="w-full rounded-xl border border-borda bg-transparent px-3 py-2 text-texto focus:outline-none focus:ring-2 focus:ring-azul-claro/30"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-texto/80">Perfil</label>
              <select
                className="w-full rounded-xl border border-borda bg-transparent px-3 py-2 text-texto"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm text-texto/80">
                Senha {isEdit ? "(opcional)" : ""}
              </label>
              <input
                type="password"
                className="w-full rounded-xl border border-borda bg-transparent px-3 py-2 text-texto"
                placeholder={isEdit ? "Deixe em branco para manter" : "Defina uma senha"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                {...(isEdit ? {} : { required: true })}
                minLength={4}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-2 text-sm text-red-300">
              {error}
            </div>
          )}

          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              className="rounded-xl border border-borda px-4 py-2 text-texto"
              onClick={onClose}
              disabled={saving}
            >
              Cancelar
            </button>
            <Button type="submit" loading={saving}>
              {isEdit ? "Salvar" : "Criar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Team() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null); // objeto user ou null
  const [flash, setFlash] = useState("");

  useEffect(() => {
    (async () => {
      if (user?.role !== "ADMIN") return;
      setLoading(true);
      setError("");
      try {
        const u = await listUsers();
        setUsers(u);
      } catch (e) {
        setError(e?.message || "Erro ao listar usuários");
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const filtered = useMemo(() => {
    let arr = users;
    if (roleFilter !== "ALL") {
      arr = arr.filter((u) => u.role === roleFilter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      arr = arr.filter((u) => u.username.toLowerCase().includes(q));
    }
    return arr;
  }, [users, roleFilter, search]);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (u) => {
    setEditing(u);
    setModalOpen(true);
  };

  const saveUser = async ({ username, role, password }) => {
    if (editing) {
      const updated = await updateUser(editing.id, { username, role, password });
      setUsers((prev) => prev.map((u) => (u.id === editing.id ? updated : u)));
      setFlash("Usuário atualizado com sucesso.");
      setTimeout(() => setFlash(""), 3000);
    } else {
      const created = await createUser({ username, role, password });
      setUsers((prev) => [created, ...prev]);
      setFlash("Usuário criado com sucesso.");
      setTimeout(() => setFlash(""), 3000);
    }
  };

  if (user?.role !== "ADMIN") {
    return (
      <AppLayout current="/team" onNavigate={(to) => navigate(to)}>
        <section className="mb-6">
          <h1 className="text-2xl font-semibold text-titulo">Equipe</h1>
          <p className="text-texto/70">Usuários do sistema (visível para ADMIN)</p>
        </section>
        <div className="rounded-2xl border border-borda p-6 text-texto/80">
          Você não tem permissão para ver esta página.
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout current="/team" onNavigate={(to) => navigate(to)}>
      <section className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-titulo">Equipe</h1>
          <p className="text-texto/70">Gerencie usuários, perfis e acesso</p>
          <div className="mt-2 text-sm text-texto/60">
            Total: <strong>{users.length}</strong> {roleFilter !== "ALL" && <>• Filtrando por <strong>{roleFilter}</strong></>}
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto]">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por usuário…"
            className="w-full rounded-xl border border-borda bg-transparent px-3 py-2 text-texto placeholder:text-texto/50 focus:outline-none focus:ring-2 focus:ring-azul-claro/30"
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-xl border border-borda bg-transparent px-3 py-2 text-texto focus:outline-none"
          >
            <option value="ALL">Todos</option>
            <option value="ADMIN">Admin</option>
            <option value="USER">User</option>
          </select>
          <Button onClick={openCreate}>Novo usuário</Button>
        </div>
      </section>

      {flash && (
        <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300">
          {flash}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-borda">
        <table className="min-w-full divide-y divide-borda/70">
          <thead className="bg-[#151515] text-xs uppercase tracking-wide text-texto">
            <tr>
              <th className="px-4 py-3 text-left">#</th>
              <th className="px-4 py-3 text-left">Usuário</th>
              <th className="px-4 py-3 text-left">Perfil</th>
              <th className="px-4 py-3 text-left">Criado em</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-borda/60">
            {loading ? (
              <>
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-texto/70">
                  Nenhum usuário encontrado.
                </td>
              </tr>
            ) : (
              filtered.map((u, idx) => (
                <tr key={u.id} className="hover:bg-white/5">
                  <td className="px-4 py-3 text-texto/70">{idx + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="grid h-8 w-8 place-items-center rounded-lg border border-borda bg-[#1b1b1b] text-sm text-titulo">
                        {u.username?.[0]?.toUpperCase() || "U"}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-texto">{u.username}</div>
                        <div className="text-xs text-texto/60">ID: {u.id.slice(0, 6)}…</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><RoleBadge role={u.role} /></td>
                  <td className="px-4 py-3 text-texto/70">
                    {new Date(u.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <button
                        className="rounded-lg border border-borda px-3 py-1 text-xs text-texto hover:bg-white/5"
                        onClick={() => openEdit(u)}
                      >
                        Editar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {error && (
          <div className="p-3 text-sm text-red-300">{error}</div>
        )}
      </div>

      {/* Modal de criar/editar */}
      <UserModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initial={editing}
        onSave={saveUser}
      />
    </AppLayout>
  );
}
