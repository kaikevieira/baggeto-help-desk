import { useState, useEffect } from "react";
import { getUsers } from "../api/users";

export default function UserSelect({ label, value, onChange, placeholder = "Selecione um usuário" }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    setError("");
    try {
      const data = await getUsers();
      setUsers(data || []);
    } catch (err) {
      setError("Erro ao carregar usuários");
      console.error("Erro ao carregar usuários:", err);
    } finally {
      setLoading(false);
    }
  }

  function handleSelectChange(e) {
    const selectedId = e.target.value;
    
    if (selectedId === "") {
      onChange({ id: null, username: "", role: "" });
    } else {
      const selectedUser = users.find(user => user.id === parseInt(selectedId));
      if (selectedUser) {
        onChange({
          id: selectedUser.id,
          username: selectedUser.username,
          role: selectedUser.role
        });
      }
    }
  }

  return (
    <div>
      <label className="mb-1 block text-sm text-texto/80">{label}</label>
      <select
        className="w-full rounded-xl border border-borda bg-fundo px-3 py-2 text-texto focus:outline-none focus:ring-2 focus:ring-azul-claro/30 disabled:opacity-50"
        value={value?.id || ""}
        onChange={handleSelectChange}
        disabled={loading}
      >
        <option value="">{loading ? "Carregando..." : placeholder}</option>
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.username} ({user.role === "ADMIN" ? "Admin" : "Usuário"})
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-xs text-red-400">{error}</p>
      )}
    </div>
  );
}