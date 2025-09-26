import { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout";
import Button from "../components/Button";
import { addComment, getTicket, listComments, updateTicket } from "../api/tickets";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const statusMapToPt = {
  OPEN: "aberto",
  IN_PROGRESS: "andamento",
  RESOLVED: "resolvido",
  CLOSED: "resolvido",
};
const statusMapFromPt = {
  aberto: "OPEN",
  andamento: "IN_PROGRESS",
  resolvido: "RESOLVED",
  fechado: "CLOSED",
};
const priorityToPt = {
  LOW: "baixa",
  MEDIUM: "media",
  HIGH: "alta",
  URGENT: "critica",
};
const priorityFromPt = {
  baixa: "LOW",
  media: "MEDIUM",
  alta: "HIGH",
  critica: "URGENT",
};

export default function TicketDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [newComment, setNewComment] = useState("");

  async function load() {
    setLoading(true);
    try {
      const t = await getTicket(id);
      setTicket(t);
      const cs = await listComments(id);
      setComments(cs);
    } catch (e) {
      setError(e?.message || "Erro ao carregar ticket");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  async function saveField(field, value) {
    setSaving(true);
    try {
      const payload = { [field]: value };
      const updated = await updateTicket(id, payload);
      setTicket(updated);
    } catch (e) {
      setError(e?.message || "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  async function submitComment(e) {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await addComment(id, newComment.trim());
      setNewComment("");
      const cs = await listComments(id);
      setComments(cs);
    } catch (e) {
      setError(e?.message || "Erro ao comentar");
    }
  }

  const statusPt = statusMapToPt[ticket?.status] || "aberto";
  const priorityPt = priorityToPt[ticket?.priority] || "media";

  return (
    <AppLayout current="/tickets" onNavigate={(to) => navigate(to)}>
      {loading ? (
        <div className="rounded-2xl border border-borda p-6 text-texto/70">
          Carregando...
        </div>
      ) : !ticket ? (
        <div className="rounded-2xl border border-borda p-6 text-red-300">
          Ticket não encontrado
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <section className="rounded-2xl border border-borda p-5">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h1 className="text-xl font-semibold text-titulo">
                  {ticket.title}
                </h1>
                <p className="text-sm text-texto/70">
                  #{String(ticket.id).slice(0, 6)} • Criado por{" "}
                  <strong>{ticket.createdBy?.username}</strong>
                </p>
              </div>
              <Button onClick={() => navigate("/tickets")}>Voltar</Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm text-texto/80">
                  Status
                </label>
                <select
                  className="w-full rounded-xl border border-borda bg-transparent px-3 py-2 text-texto"
                  value={statusPt}
                  onChange={(e) =>
                    saveField("status", statusMapFromPt[e.target.value])
                  }
                >
                  <option value="aberto">Aberto</option>
                  <option value="andamento">Em andamento</option>
                  <option value="resolvido">Resolvido</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm text-texto/80">
                  Prioridade
                </label>
                <select
                  className="w-full rounded-xl border border-borda bg-transparent px-3 py-2 text-texto"
                  value={priorityPt}
                  onChange={(e) =>
                    saveField("priority", priorityFromPt[e.target.value])
                  }
                >
                  <option value="baixa">Baixa</option>
                  <option value="media">Média</option>
                  <option value="alta">Alta</option>
                  <option value="critica">Crítica</option>
                </select>
              </div>
              {user?.role === "ADMIN" && (
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-sm text-texto/80">
                    Atribuído para (ID do usuário)
                  </label>
                  <input
                    className="w-full rounded-xl border border-borda bg-transparent px-3 py-2 text-texto"
                    value={ticket.assignedToId || ""}
                    onChange={(e) =>
                      saveField("assignedToId", e.target.value || null)
                    }
                    placeholder="Opcional"
                  />
                </div>
              )}
            </div>

            <div className="mt-6">
              <h2 className="text-lg font-medium text-titulo">Descrição</h2>
              <p className="mt-2 whitespace-pre-wrap text-texto/90">
                {ticket.description}
              </p>
            </div>

            <div className="mt-6">
              <h2 className="text-lg font-medium text-titulo">Comentários</h2>
              <div className="mt-3 space-y-3">
                {comments.map((c) => (
                  <div key={c.id} className="rounded-xl border border-borda p-3">
                    <p className="text-sm text-texto/80">
                      <strong>{c.author?.username}</strong> •{" "}
                      {new Date(c.createdAt).toLocaleString()}
                    </p>
                    <p className="mt-1 text-texto">{c.body}</p>
                  </div>
                ))}
                {comments.length === 0 && (
                  <div className="rounded-xl border border-borda p-4 text-texto/70">
                    Sem comentários ainda.
                  </div>
                )}
              </div>

              <form onSubmit={submitComment} className="mt-3 grid gap-2">
                <textarea
                  rows={3}
                  className="w-full rounded-xl border border-borda bg-transparent px-3 py-2 text-texto"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Escreva um comentário..."
                />
                <div className="flex gap-2">
                  <Button type="submit">Comentar</Button>
                  {saving && (
                    <span className="text-sm text-texto/70">Salvando...</span>
                  )}
                </div>
              </form>
            </div>
          </section>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-borda p-4">
              <h3 className="text-sm font-semibold text-titulo">Informações</h3>
              <ul className="mt-2 text-sm text-texto/80 space-y-1">
                <li>
                  <strong>Criado em:</strong>{" "}
                  {new Date(ticket.createdAt).toLocaleString()}
                </li>
                <li>
                  <strong>Atualizado em:</strong>{" "}
                  {new Date(ticket.updatedAt).toLocaleString()}
                </li>
                <li>
                  <strong>Criado por:</strong> {ticket.createdBy?.username}
                </li>
                <li>
                  <strong>Atribuído para:</strong>{" "}
                  {ticket.assignedTo?.username || "-"}
                </li>
              </ul>
            </div>
          </aside>
        </div>
      )}
    </AppLayout>
  );
}
