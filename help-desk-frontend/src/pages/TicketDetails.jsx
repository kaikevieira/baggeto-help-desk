import { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout";
import Button from "../components/Button";
import { getTicket, listComments, addComment, updateTicket } from "../api/tickets";
import { useNavigate, useParams } from "react-router-dom";

export default function TicketDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [error, setError] = useState("");

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
  useEffect(() => { load(); }, [id]);

  async function saveField(field, value) {
    setSaving(true);
    try {
      const payload =
        field === "cargoWeight" || field === "thirdPartyPayment"
          ? { [field]: value === "" || value == null ? null : Number(value) }
          : { [field]: value };
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
    await addComment(id, newComment.trim());
    setNewComment("");
    const cs = await listComments(id);
    setComments(cs);
  }

  return (
    <AppLayout current="/tickets" onNavigate={(to) => navigate(to)}>
      {loading ? (
        <div className="rounded-2xl border border-borda p-6 text-texto/70">Carregando...</div>
      ) : !ticket ? (
        <div className="rounded-2xl border border-borda p-6 text-red-300">Ticket não encontrado</div>
      ) : (
        <>
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-semibold text-titulo">{ticket.title}</h1>
              <p className="text-sm text-texto/70">
                #{String(ticket.id).slice(0, 6)} • Criado por <strong>{ticket.createdBy?.username}</strong>
              </p>
            </div>
            <Button onClick={() => navigate("/tickets")}>Voltar</Button>
          </div>

          {/* GRID PRINCIPAL: ESQUERDA (Transporte) | DIREITA (Operacional) */}
          <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
            {/* ESQUERDA — TRANSPORTE */}
            <section className="rounded-2xl border border-borda p-5">
              <h2 className="mb-4 text-lg font-medium text-titulo">Transporte</h2>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Origem/Destino só leitura (gravados na criação). Se quiser editar, me avisa que coloco um seletor IBGE aqui também. */}
                <div>
                  <label className="mb-1 block text-sm text-texto/80">Origem</label>
                  <div className="rounded-xl border border-borda px-3 py-2 text-texto/90">
                    {ticket.originCity && ticket.originUF ? `${ticket.originCity}/${ticket.originUF}` : "—"}
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm text-texto/80">Destino</label>
                  <div className="rounded-xl border border-borda px-3 py-2 text-texto/90">
                    {ticket.destinationCity && ticket.destinationUF ? `${ticket.destinationCity}/${ticket.destinationUF}` : "—"}
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm text-texto/80">Tipo de Frete</label>
                  <select
                    className="w-full rounded-xl border border-borda bg-transparent px-3 py-2 text-texto"
                    value={ticket.freightBasis}
                    onChange={(e) => saveField("freightBasis", e.target.value)}
                  >
                    <option value="FULL">Frete Cheio</option>
                    <option value="TON">Frete Tonelada</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm text-texto/80">Modalidade</label>
                  <select
                    className="w-full rounded-xl border border-borda bg-transparent px-3 py-2 text-texto"
                    value={ticket.incoterm}
                    onChange={(e) => saveField("incoterm", e.target.value)}
                  >
                    <option value="CIF">CIF</option>
                    <option value="FOB">FOB</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm text-texto/80">Prazo para pagamento</label>
                  <input
                    className="w-full rounded-xl border border-borda bg-transparent px-3 py-2 text-texto"
                    defaultValue={ticket.paymentTerm || ""}
                    onBlur={(e) => saveField("paymentTerm", e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-texto/80">Tipo de pagamento</label>
                  <input
                    className="w-full rounded-xl border border-borda bg-transparent px-3 py-2 text-texto"
                    defaultValue={ticket.paymentType || ""}
                    onBlur={(e) => saveField("paymentType", e.target.value)}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm text-texto/80">Peso da carga</label>
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    className="w-full rounded-xl border border-borda bg-transparent px-3 py-2 text-texto"
                    defaultValue={ticket.cargoWeight ?? ""}
                    onBlur={(e) => saveField("cargoWeight", e.target.value)}
                  />
                  <p className="mt-1 text-xs text-texto/60">Padrão do banco (ex.: toneladas).</p>
                </div>
                <div>
                  <label className="mb-1 block text-sm text-texto/80">Empresa de faturamento</label>
                  <input
                    className="w-full rounded-xl border border-borda bg-transparent px-3 py-2 text-texto"
                    defaultValue={ticket.billingCompany || ""}
                    onBlur={(e) => saveField("billingCompany", e.target.value)}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm text-texto/80">Placa (Cavalo)</label>
                  <input
                    className="w-full rounded-xl border border-borda bg-transparent px-3 py-2 text-texto"
                    defaultValue={ticket.plateCavalo || ""}
                    onBlur={(e) => saveField("plateCavalo", e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-texto/80">Placa (1ª carreta)</label>
                  <input
                    className="w-full rounded-xl border border-borda bg-transparent px-3 py-2 text-texto"
                    defaultValue={ticket.plateCarreta1 || ""}
                    onBlur={(e) => saveField("plateCarreta1", e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-texto/80">Placa (2ª carreta / Dolly)</label>
                  <input
                    className="w-full rounded-xl border border-borda bg-transparent px-3 py-2 text-texto"
                    defaultValue={ticket.plateCarreta2 || ""}
                    onBlur={(e) => saveField("plateCarreta2", e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-texto/80">Placa (3ª carreta)</label>
                  <input
                    className="w-full rounded-xl border border-borda bg-transparent px-3 py-2 text-texto"
                    defaultValue={ticket.plateCarreta3 || ""}
                    onBlur={(e) => saveField("plateCarreta3", e.target.value)}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm text-texto/80">Propriedade do veículo</label>
                  <select
                    className="w-full rounded-xl border border-borda bg-transparent px-3 py-2 text-texto"
                    value={ticket.fleetType}
                    onChange={(e) => saveField("fleetType", e.target.value)}
                  >
                    <option value="FROTA">Frota</option>
                    <option value="TERCEIRO">Terceiro</option>
                  </select>
                </div>

                {ticket.fleetType === "TERCEIRO" && (
                  <div>
                    <label className="mb-1 block text-sm text-texto/80">Valor p/ terceiro</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="w-full rounded-xl border border-borda bg-transparent px-3 py-2 text-texto"
                      defaultValue={ticket.thirdPartyPayment ?? ""}
                      onBlur={(e) => saveField("thirdPartyPayment", e.target.value)}
                    />
                  </div>
                )}

                <div className="sm:col-span-2">
                  <label className="mb-1 block text-sm text-texto/80">Tomador de serviço</label>
                  <input
                    className="w-full rounded-xl border border-borda bg-transparent px-3 py-2 text-texto"
                    defaultValue={ticket.serviceTaker || ""}
                    onBlur={(e) => saveField("serviceTaker", e.target.value)}
                  />
                </div>
              </div>
            </section>

            {/* DIREITA — OPERACIONAL */}
            <section className="rounded-2xl border border-borda p-5">
              <h2 className="mb-4 text-lg font-medium text-titulo">Operacional</h2>

              <div className="grid gap-4">
                <div>
                  <label className="mb-1 block text-sm text-texto/80">Com quem está (atribuído para)</label>
                  <div className="text-xs text-texto/60 mb-1">
                    Atual: <strong>{ticket.assignedTo?.username || "—"}</strong>
                  </div>
                  <input
                    className="w-full rounded-xl border border-borda bg-transparent px-3 py-2 text-texto"
                    placeholder="ID do usuário (opcional)"
                    defaultValue={ticket.assignedToId || ""}
                    onBlur={(e) => saveField("assignedToId", e.target.value || null)}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm text-texto/80">Status</label>
                  <select
                    className="w-full rounded-xl border border-borda bg-transparent px-3 py-2 text-texto"
                    value={ticket.status}
                    onChange={(e) => saveField("status", e.target.value)}
                  >
                    <option value="OPEN">Aberto</option>
                    <option value="IN_PROGRESS">Em andamento</option>
                    <option value="RESOLVED">Resolvido</option>
                    <option value="CLOSED">Fechado</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm text-texto/80">Prioridade</label>
                  <select
                    className="w-full rounded-xl border border-borda bg-transparent px-3 py-2 text-texto"
                    value={ticket.priority}
                    onChange={(e) => saveField("priority", e.target.value)}
                  >
                    <option value="LOW">Baixa</option>
                    <option value="MEDIUM">Média</option>
                    <option value="HIGH">Alta</option>
                    <option value="URGENT">Crítica</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm text-texto/80">Descrição</label>
                  <textarea
                    rows={6}
                    className="w-full rounded-xl border border-borda bg-transparent px-3 py-2 text-texto"
                    defaultValue={ticket.description || ""}
                    onBlur={(e) => saveField("description", e.target.value)}
                  />
                </div>

                <div className="rounded-xl border border-borda p-3 text-sm text-texto/80">
                  <div><strong>Criado em:</strong> {new Date(ticket.createdAt).toLocaleString()}</div>
                  <div><strong>Atualizado em:</strong> {new Date(ticket.updatedAt).toLocaleString()}</div>
                  <div><strong>Criado por:</strong> {ticket.createdBy?.username}</div>
                </div>

                {saving && <span className="text-sm text-texto/70">Salvando...</span>}
                {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-2 text-red-300 text-sm">{error}</div>}
              </div>
            </section>
          </div>

          {/* COMENTÁRIOS (abaixo das duas colunas) */}
          <section className="mt-6 rounded-2xl border border-borda p-5">
            <h2 className="mb-3 text-lg font-medium text-titulo">Comentários</h2>
            <div className="space-y-3">
              {comments.map((c) => (
                <div key={c.id} className="rounded-xl border border-borda p-3">
                  <p className="text-sm text-texto/80">
                    <strong>{c.author?.username}</strong> • {new Date(c.createdAt).toLocaleString()}
                  </p>
                  <p className="mt-1 text-texto">{c.body}</p>
                </div>
              ))}
              {comments.length === 0 && (
                <div className="rounded-xl border border-borda p-4 text-texto/70">Sem comentários ainda.</div>
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
                {saving && <span className="text-sm text-texto/70">Salvando...</span>}
              </div>
            </form>
          </section>
        </>
      )}
    </AppLayout>
  );
}
