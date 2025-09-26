import { useState } from "react";
import AppLayout from "../components/AppLayout";
import Button from "../components/Button";
import { createTicket } from "../api/tickets";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function TicketNew() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
    assignedToId: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        priority: form.priority,
        assignedToId: form.assignedToId || undefined,
      };
      const t = await createTicket(payload);
      navigate(`/tickets/${t.id}`, { replace: true });
    } catch (e) {
      setError(e?.message || "Erro ao criar chamado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppLayout current="/tickets/new" onNavigate={(to) => navigate(to)}>
      <section className="mb-6">
        <h1 className="text-2xl font-semibold text-titulo">Novo Chamado</h1>
        <p className="text-texto/70">Abra um chamado descrevendo o problema</p>
      </section>

      <form onSubmit={handleSubmit} className="grid gap-4 max-w-2xl">
        <div>
          <label className="mb-1 block text-sm text-texto/80">Título</label>
          <input
            className="w-full rounded-xl border border-borda bg-transparent px-3 py-2 text-texto focus:outline-none focus:ring-2 focus:ring-azul-claro/30"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-texto/80">Descrição</label>
          <textarea
            rows={6}
            className="w-full rounded-xl border border-borda bg-transparent px-3 py-2 text-texto focus:outline-none focus:ring-2 focus:ring-azul-claro/30"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-texto/80">
              Prioridade
            </label>
            <select
              className="w-full rounded-xl border border-borda bg-transparent px-3 py-2 text-texto focus:outline-none"
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
            >
              <option value="LOW">Baixa</option>
              <option value="MEDIUM">Média</option>
              <option value="HIGH">Alta</option>
              <option value="URGENT">Crítica</option>
            </select>
          </div>

          {user?.role === "ADMIN" && (
            <div>
              <label className="mb-1 block text-sm text-texto/80">
                Atribuir para (ID do usuário)
              </label>
              <input
                className="w-full rounded-xl border border-borda bg-transparent px-3 py-2 text-texto focus:outline-none focus:ring-2 focus:ring-azul-claro/30"
                value={form.assignedToId}
                onChange={(e) =>
                  setForm({ ...form, assignedToId: e.target.value })
                }
                placeholder="Opcional"
              />
            </div>
          )}
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-red-300 text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-2">
          <Button type="submit" loading={loading}>
            Criar
          </Button>
          <button
            type="button"
            className="rounded-xl border border-borda px-4 py-2 text-texto"
            onClick={() => navigate(-1)}
          >
            Cancelar
          </button>
        </div>
      </form>
    </AppLayout>
  );
}
