import { useEffect, useMemo, useState } from "react";
import { getUsers } from "../api/users";

export default function MultiUserSelect({ label = "Atribuir para (múltiplos)", value = [], onChange, disabled = false }) {
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { loadUsers(); }, []);

  async function loadUsers() {
    setLoading(true);
    setError("");
    try {
      const data = await getUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      setError("Erro ao carregar usuários");
    } finally {
      setLoading(false);
    }
  }

  const selectedIds = useMemo(() => new Set((value || []).map((u) => u.id)), [value]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return users.filter((u) => !selectedIds.has(u.id) && (!needle || u.username.toLowerCase().includes(needle)));
  }, [users, q, selectedIds]);

  function addUser(u) {
    if (!onChange) return;
    const next = [...(value || []), { id: u.id, username: u.username, role: u.role }];
    onChange(next);
    setQ("");
  }

  function removeUser(id) {
    if (!onChange) return;
    const next = (value || []).filter((u) => u.id !== id);
    onChange(next);
  }

  return (
    <div>
      <label className="mb-1 block text-sm text-texto/80">{label}</label>
      <div className="rounded-xl border border-borda p-2">
        <div className="flex flex-wrap gap-2 mb-2">
          {(value || []).map((u) => (
            <span key={u.id} className="inline-flex items-center gap-2 rounded-full border border-borda px-3 py-1 text-sm">
              {u.username}
              <button type="button" className="text-texto/60 hover:text-red-400 disabled:opacity-50" onClick={() => removeUser(u.id)} aria-label={`Remover ${u.username}`} disabled={disabled}>×</button>
            </span>
          ))}
        </div>
        <input
          className="w-full rounded-lg border border-borda bg-transparent px-3 py-2 text-texto"
          placeholder={loading ? "Carregando..." : "Pesquisar usuário pelo nome"}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          disabled={loading || disabled}
        />
        {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
        {q && filtered.length > 0 && !disabled && (
          <div className="mt-2 max-h-40 overflow-auto rounded-lg border border-borda">
            {filtered.map((u) => (
              <button
                key={u.id}
                type="button"
                className="block w-full text-left px-3 py-2 hover:bg-borda/20"
                onClick={() => addUser(u)}
              >
                {u.username} ({u.role === 'ADMIN' ? 'Admin' : 'Usuário'})
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
