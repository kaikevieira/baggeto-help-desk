import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { addComment, getTicket, listComments, updateTicket } from "../api/tickets";
import AppLayout from "../components/AppLayout";
import Button from "../components/Button";
import StatusPill from "../components/StatusPill";
import { useAuth } from "../context/AuthContext.jsx";
import { usePageTitle } from "../hooks/usePageTitle";

export default function TicketDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [ticket, setTicket] = useState(null);
  
  // Título dinâmico baseado no ticket
  usePageTitle(ticket ? `Ticket #${ticket.id} - ${ticket.title}` : `Ticket #${id}`);
  
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => { load(); }, [id]);

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

  // Verifica se o usuário pode editar (proprietário ou admin)
  const canEdit = user && ticket && (user.sub === ticket.createdById || user.role === "ADMIN");
  
  function toggleEdit() {
    if (canEdit) setIsEditing(!isEditing);
  }

  function getPriorityColor(priority) {
    switch (priority) {
      case "URGENT": return "bg-red-500/20 text-red-300 border-red-500/30";
      case "HIGH": return "bg-orange-500/20 text-orange-300 border-orange-500/30";
      case "MEDIUM": return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      case "LOW": return "bg-green-500/20 text-green-300 border-green-500/30";
      default: return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  }

  return (
    <AppLayout current="/tickets" onNavigate={(to) => navigate(to)}>
      {loading ? (
        <div className="rounded-2xl border border-borda p-6 text-texto/70">Carregando...</div>
      ) : !ticket ? (
        <div className="rounded-2xl border border-borda p-6 text-red-300">Ticket não encontrado</div>
      ) : (
        <>
          {/* CABEÇALHO MODERNO */}
          <div className="mb-4 sm:mb-6 rounded-2xl bg-gradient-to-r from-azul-escuro/10 to-azul-claro/10 border border-azul-claro/20 p-3 sm:p-6 max-w-full overflow-hidden">
            <div className="flex flex-col gap-3 mb-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-1 sm:gap-3 mb-2">
                  <h1 className="text-base sm:text-xl lg:text-2xl font-bold text-titulo truncate max-w-full">{ticket.title}</h1>
                  <div className="flex-shrink-0">
                    <StatusPill status={ticket.status} />
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border flex-shrink-0 ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority === "URGENT" ? "Crítica" : 
                     ticket.priority === "HIGH" ? "Alta" :
                     ticket.priority === "MEDIUM" ? "Média" : "Baixa"}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-texto/70">
                  <span className="flex items-center gap-1 flex-shrink-0">
                    <span className="w-2 h-2 bg-azul-claro rounded-full"></span>
                    Ticket #{ticket.id}
                  </span>
                  <span className="truncate min-w-0">Criado por <strong className="text-texto">{ticket.createdBy?.username}</strong></span>
                  <span className="whitespace-nowrap flex-shrink-0">em {new Date(ticket.createdAt).toLocaleDateString('pt-BR')}</span>
                  {ticket.assignedTo && (
                    <span className="truncate min-w-0">Atribuído para <strong className="text-texto">{ticket.assignedTo.username}</strong></span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {canEdit && (
                  <Button 
                    onClick={toggleEdit} 
                    className={`px-2 sm:px-4 py-2 min-w-[70px] sm:min-w-[100px] text-xs sm:text-sm ${isEditing ? 'bg-green-600 hover:bg-green-700' : 'bg-azul-claro hover:bg-azul-claro/80'}`}
                  >
                    {isEditing ? '💾 Salvar' : '✏️ Editar'}
                  </Button>
                )}
                <Button onClick={() => navigate("/tickets")} className="bg-gray-600 hover:bg-gray-700 px-2 sm:px-4 py-2 min-w-[70px] sm:min-w-[100px] text-xs sm:text-sm">
                  ← Voltar
                </Button>
              </div>
            </div>
            {error && (
              <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-red-300 text-sm">
                {error}
              </div>
            )}
          </div>

          {/* GRID PRINCIPAL */}
          <div className="grid gap-3 sm:gap-6 lg:grid-cols-1 xl:grid-cols-[1fr_400px] max-w-full overflow-hidden">
            {/* ESQUERDA — TRANSPORTE */}
            <section className="rounded-2xl border border-borda p-3 sm:p-6 min-w-0 max-w-full overflow-hidden">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-azul-claro/20 flex items-center justify-center">
                  <span className="text-azul-claro text-lg">🚛</span>
                </div>
                <h2 className="text-xl font-semibold text-titulo">Informações de Transporte</h2>
              </div>

              <div className="space-y-6">
                {/* ORIGEM E DESTINO */}
                <div className="rounded-xl p-4 border border-borda">
                  <h3 className="text-sm font-medium text-titulo mb-3 flex items-center gap-2">
                    📍 Rota de Transporte
                  </h3>
                  <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
                    <div className="min-w-0">
                      <label className="mb-2 block text-sm font-medium text-texto/80">Origem</label>
                      <div className="rounded-xl border border-borda bg-fundo/50 px-3 sm:px-4 py-3 text-texto font-medium truncate">
                        {ticket.originCity && ticket.originUF ? `${ticket.originCity}/${ticket.originUF}` : "Não informado"}
                      </div>
                    </div>
                    <div className="min-w-0">
                      <label className="mb-2 block text-sm font-medium text-texto/80">Destino</label>
                      <div className="rounded-xl border border-borda bg-fundo/50 px-3 sm:px-4 py-3 text-texto font-medium truncate">
                        {ticket.destinationCity && ticket.destinationUF ? `${ticket.destinationCity}/${ticket.destinationUF}` : "Não informado"}
                      </div>
                    </div>
                  </div>
                  
                  {/* ROTA POR ESTADOS */}
                  {ticket.route && (
                    <div className="mt-4">
                      <label className="mb-2 block text-sm font-medium text-texto/80">Rota por Estados</label>
                      <div className="rounded-xl border border-azul-claro/30 bg-azul-claro/10 px-3 sm:px-4 py-3">
                        <div className="text-azul-claro font-mono text-lg font-semibold text-center">
                          {ticket.route}
                        </div>
                        <div className="text-xs text-azul-claro/70 text-center mt-1">
                          Roteiro de estados por onde a carga irá passar
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* CONFIGURAÇÕES DE FRETE */}
                <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
                  <div className="min-w-0">
                    <label className="mb-2 block text-sm font-medium text-texto/80">Tipo de Frete</label>
                    <select
                      className={`w-full min-w-0 rounded-xl border border-borda px-3 sm:px-4 py-3 text-texto transition-all ${
                        isEditing ? 'bg-transparent hover:border-azul-claro/50 focus:border-azul-claro focus:ring-2 focus:ring-azul-claro/20' : 'bg-gray-500/10 cursor-not-allowed'
                      }`}
                      value={ticket.freightBasis || "FULL"}
                      onChange={(e) => isEditing && saveField("freightBasis", e.target.value)}
                      disabled={!isEditing}
                    >
                      <option value="FULL">Frete Cheio</option>
                      <option value="TON">Frete Tonelada</option>
                    </select>
                  </div>
                  
                  <div className="min-w-0">
                    <label className="mb-2 block text-sm font-medium text-texto/80">Modalidade</label>
                    <select
                      className={`w-full min-w-0 rounded-xl border border-borda px-3 sm:px-4 py-3 text-texto transition-all ${
                        isEditing ? 'bg-transparent hover:border-azul-claro/50 focus:border-azul-claro focus:ring-2 focus:ring-azul-claro/20' : 'bg-gray-500/10 cursor-not-allowed'
                      }`}
                      value={ticket.incoterm || "CIF"}
                      onChange={(e) => isEditing && saveField("incoterm", e.target.value)}
                      disabled={!isEditing}
                    >
                      <option value="CIF">CIF</option>
                      <option value="FOB">FOB</option>
                    </select>
                  </div>
                  <div className={ticket.fleetType === "TERCEIRO" ? "" : "sm:col-span-2"}>
                      <label className="mb-2 block text-sm font-medium text-texto/80">Tomador de serviço</label>
                      <input
                        className={`w-full rounded-xl border border-borda px-4 py-3 text-texto transition-all ${
                          isEditing ? 'bg-transparent hover:border-azul-claro/50 focus:border-azul-claro focus:ring-2 focus:ring-azul-claro/20' : 'bg-gray-500/10 cursor-not-allowed'
                        }`}
                        defaultValue={ticket.serviceTaker || ""}
                        onBlur={(e) => isEditing && saveField("serviceTaker", e.target.value)}
                        disabled={!isEditing}
                        placeholder="Nome do tomador"
                      />
                    </div>
                </div>

                {/* DESCRIÇÃO */}
                <div className="rounded-xl p-3 sm:p-4 border border-borda max-w-full overflow-hidden">
                  <h3 className="text-sm font-medium text-titulo mb-3 flex items-center gap-2">
                    📝 Descrição do Chamado
                  </h3>
                  <div className="rounded-lg bg-fundo/50 border border-borda px-3 sm:px-4 py-3 max-w-full overflow-hidden">
                    {isEditing ? (
                      <textarea
                        className="w-full min-w-0 bg-transparent border-none resize-none focus:outline-none text-texto"
                        rows={4}
                        defaultValue={ticket.description}
                        onBlur={(e) => saveField("description", e.target.value)}
                      />
                    ) : (
                      <p className="text-texto whitespace-pre-wrap break-words">{ticket.description}</p>
                    )}
                  </div>
                </div>

                {/* INFORMAÇÕES FINANCEIRAS */}
                <div className="rounded-xl p-4 border border-borda">
                  <h3 className="text-sm font-medium text-titulo mb-3 flex items-center gap-2">
                    💰 Informações Financeiras
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-texto/80">Prazo para pagamento</label>
                      <input
                        className={`w-full rounded-xl border border-borda px-4 py-3 text-texto transition-all ${
                          isEditing ? 'bg-transparent hover:border-azul-claro/50 focus:border-azul-claro focus:ring-2 focus:ring-azul-claro/20' : 'bg-gray-500/10 cursor-not-allowed'
                        }`}
                        defaultValue={ticket.paymentTerm || ""}
                        onBlur={(e) => isEditing && saveField("paymentTerm", e.target.value)}
                        disabled={!isEditing}
                        placeholder="Ex: à vista, 15 dias, 30 dias"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-texto/80">Tipo de pagamento</label>
                      <input
                        className={`w-full rounded-xl border border-borda px-4 py-3 text-texto transition-all ${
                          isEditing ? 'bg-transparent hover:border-azul-claro/50 focus:border-azul-claro focus:ring-2 focus:ring-azul-claro/20' : 'bg-gray-500/10 cursor-not-allowed'
                        }`}
                        defaultValue={ticket.paymentType || ""}
                        onBlur={(e) => isEditing && saveField("paymentType", e.target.value)}
                        disabled={!isEditing}
                        placeholder="Ex: PIX, Boleto, TED"
                      />
                    </div>
                  </div>
                </div>

                {/* INFORMAÇÕES DA CARGA */}
                <div className="rounded-xl p-4 border border-borda">
                  <h3 className="text-sm font-medium text-titulo mb-3 flex items-center gap-2">
                    📦 Informações da Carga
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-texto/80">Peso da carga (ton)</label>
                      <input
                        type="number"
                        step="0.001"
                        min="0"
                        className={`w-full rounded-xl border border-borda px-4 py-3 text-texto transition-all ${
                          isEditing ? 'bg-transparent hover:border-azul-claro/50 focus:border-azul-claro focus:ring-2 focus:ring-azul-claro/20' : 'bg-gray-500/10 cursor-not-allowed'
                        }`}
                        defaultValue={ticket.cargoWeight ?? ""}
                        onBlur={(e) => isEditing && saveField("cargoWeight", e.target.value)}
                        disabled={!isEditing}
                        placeholder="Ex: 28.500"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-texto/80">Empresa de faturamento</label>
                      <input
                        className={`w-full rounded-xl border border-borda px-4 py-3 text-texto transition-all ${
                          isEditing ? 'bg-transparent hover:border-azul-claro/50 focus:border-azul-claro focus:ring-2 focus:ring-azul-claro/20' : 'bg-gray-500/10 cursor-not-allowed'
                        }`}
                        defaultValue={ticket.billingCompany || ""}
                        onBlur={(e) => isEditing && saveField("billingCompany", e.target.value)}
                        disabled={!isEditing}
                        placeholder="Nome da empresa"
                      />
                    </div>
                  </div>
                </div>

                {/* INFORMAÇÕES DE VEÍCULOS */}
                <div className="rounded-xl p-4 border border-borda">
                  <h3 className="text-sm font-medium text-titulo mb-3 flex items-center gap-2">
                    🚚 Placas dos Veículos
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-texto/80">Placa (Cavalo)</label>
                      <input
                        className={`w-full rounded-xl border border-borda px-4 py-3 text-texto transition-all font-mono uppercase tracking-wider ${
                          isEditing ? 'bg-transparent hover:border-azul-claro/50 focus:border-azul-claro focus:ring-2 focus:ring-azul-claro/20' : 'bg-gray-500/10 cursor-not-allowed'
                        }`}
                        defaultValue={ticket.plateCavalo || ""}
                        onBlur={(e) => isEditing && saveField("plateCavalo", e.target.value.toUpperCase())}
                        disabled={!isEditing}
                        placeholder="Ex: ABC1234"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-texto/80">Placa (1ª carreta)</label>
                      <input
                        className={`w-full rounded-xl border border-borda px-4 py-3 text-texto transition-all font-mono uppercase tracking-wider ${
                          isEditing ? 'bg-transparent hover:border-azul-claro/50 focus:border-azul-claro focus:ring-2 focus:ring-azul-claro/20' : 'bg-gray-500/10 cursor-not-allowed'
                        }`}
                        defaultValue={ticket.plateCarreta1 || ""}
                        onBlur={(e) => isEditing && saveField("plateCarreta1", e.target.value.toUpperCase())}
                        disabled={!isEditing}
                        placeholder="Ex: ABC1234"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-texto/80">Placa (2ª carreta / Dolly)</label>
                      <input
                        className={`w-full rounded-xl border border-borda px-4 py-3 text-texto transition-all font-mono uppercase tracking-wider ${
                          isEditing ? 'bg-transparent hover:border-azul-claro/50 focus:border-azul-claro focus:ring-2 focus:ring-azul-claro/20' : 'bg-gray-500/10 cursor-not-allowed'
                        }`}
                        defaultValue={ticket.plateCarreta2 || ""}
                        onBlur={(e) => isEditing && saveField("plateCarreta2", e.target.value.toUpperCase())}
                        disabled={!isEditing}
                        placeholder="Ex: ABC1234"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-texto/80">Placa (3ª carreta)</label>
                      <input
                        className={`w-full rounded-xl border border-borda px-4 py-3 text-texto transition-all font-mono uppercase tracking-wider ${
                          isEditing ? 'bg-transparent hover:border-azul-claro/50 focus:border-azul-claro focus:ring-2 focus:ring-azul-claro/20' : 'bg-gray-500/10 cursor-not-allowed'
                        }`}
                        defaultValue={ticket.plateCarreta3 || ""}
                        onBlur={(e) => isEditing && saveField("plateCarreta3", e.target.value.toUpperCase())}
                        disabled={!isEditing}
                        placeholder="Ex: ABC1234"
                      />
                    </div>
                  </div>
                </div>

                {/* TIPO DE FROTA E TERCEIROS */}
                <div className="rounded-xl p-4 border border-borda">
                  <h3 className="text-sm font-medium text-titulo mb-3 flex items-center gap-2">
                    🏢 Propriedade e Terceiros
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-texto/80">Propriedade do veículo</label>
                      <select
                        className={`w-full rounded-xl border border-borda px-4 py-3 text-texto transition-all ${
                          isEditing ? 'bg-transparent hover:border-azul-claro/50 focus:border-azul-claro focus:ring-2 focus:ring-azul-claro/20' : 'bg-gray-500/10 cursor-not-allowed'
                        }`}
                        value={ticket.fleetType || "FROTA"}
                        onChange={(e) => isEditing && saveField("fleetType", e.target.value)}
                        disabled={!isEditing}
                      >
                        <option value="FROTA">Frota</option>
                        <option value="TERCEIRO">Terceiro</option>
                      </select>
                    </div>
                    {ticket.fleetType === "TERCEIRO" && (
                      <div>
                        <label className="mb-2 block text-sm font-medium text-texto/80">Valor p/ terceiro (R$)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          className={`w-full rounded-xl border border-borda px-4 py-3 text-texto transition-all ${
                            isEditing ? 'bg-transparent hover:border-azul-claro/50 focus:border-azul-claro focus:ring-2 focus:ring-azul-claro/20' : 'bg-gray-500/10 cursor-not-allowed'
                          }`}
                          defaultValue={ticket.thirdPartyPayment ?? ""}
                          onBlur={(e) => isEditing && saveField("thirdPartyPayment", e.target.value)}
                          disabled={!isEditing}
                          placeholder="0,00"
                        />
                      </div>
                    )}
                    
                  </div>
                  {/* CAMPOS DE PEDÁGIO E REPRESENTANTES */}
                <div className="flex w-full py-4 gap-4 flex-col md:flex-row">
                  <div className="w-full">
                    <label className="mb-2 block text-sm font-medium text-texto/80">Pedágio</label>
                    <select
                      className={`w-full rounded-xl border border-borda px-4 py-3 text-texto transition-all ${
                        isEditing ? 'bg-transparent hover:border-azul-claro/50 focus:border-azul-claro focus:ring-2 focus:ring-azul-claro/20' : 'bg-gray-500/10 cursor-not-allowed'
                      }`}
                      value={ticket.hasToll || ""}
                      onChange={(e) => isEditing && saveField("hasToll", e.target.value || null)}
                      disabled={!isEditing}
                    >
                      <option value="">Não especificado</option>
                      <option value="COM_PEDAGIO">Com Pedágio</option>
                      <option value="SEM_PEDAGIO">Sem Pedágio</option>
                      <option value="CLIENTE_PAGA_PEDAGIO">Cliente Paga Pedágio</option>
                    </select>
                  </div>

                  <div className="w-full">
                    <label className="mb-2 block text-sm font-medium text-texto/80">Representante do CTE</label>
                    <input
                      className={`w-full rounded-xl border border-borda px-4 py-3 text-texto transition-all ${
                        isEditing ? 'bg-transparent hover:border-azul-claro/50 focus:border-azul-claro focus:ring-2 focus:ring-azul-claro/20' : 'bg-gray-500/10 cursor-not-allowed'
                      }`}
                      defaultValue={ticket.cteRepresentative || ""}
                      onBlur={(e) => isEditing && saveField("cteRepresentative", e.target.value)}
                      disabled={!isEditing}
                      placeholder="Nome do representante"
                    />
                  </div>

                  <div className="w-full">
                    <label className="mb-2 block text-sm font-medium text-texto/80">Representante do Manifesto</label>
                    <input
                      className={`w-full rounded-xl border border-borda px-4 py-3 text-texto transition-all ${
                        isEditing ? 'bg-transparent hover:border-azul-claro/50 focus:border-azul-claro focus:ring-2 focus:ring-azul-claro/20' : 'bg-gray-500/10 cursor-not-allowed'
                      }`}
                      defaultValue={ticket.manifestRepresentative || ""}
                      onBlur={(e) => isEditing && saveField("manifestRepresentative", e.target.value)}
                      disabled={!isEditing}
                      placeholder="Nome do representante"
                    />
                  </div>
                </div>
                </div>
              </div>
            </section>

            {/* DIREITA — OPERACIONAL */}
            <section className="rounded-2xl border border-borda p-3 sm:p-6 min-w-0 max-w-full overflow-hidden">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                  <span className="text-green-400 text-lg">⚙️</span>
                </div>
                <h2 className="text-xl font-semibold text-titulo">Controle Operacional</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-texto/80">Número do Ticket</label>
                  <div className="rounded-xl border border-borda bg-azul-claro/10 px-4 py-3 text-azul-claro font-medium">
                    {ticket.ticketNumber || `#${ticket.id}`}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-texto/80">Status</label>
                  <select
                    className={`w-full rounded-xl border border-borda px-4 py-3 text-texto transition-all ${
                      isEditing ? 'bg-transparent hover:border-azul-claro/50 focus:border-azul-claro focus:ring-2 focus:ring-azul-claro/20' : 'bg-gray-500/10 cursor-not-allowed'
                    }`}
                    value={ticket.status}
                    onChange={(e) => isEditing && saveField("status", e.target.value)}
                    disabled={!isEditing}
                  >
                    <option value="OPEN">Aberto</option>
                    <option value="IN_PROGRESS">Em Andamento</option>
                    <option value="RESOLVED">Resolvido</option>
                    <option value="CLOSED">Fechado</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-texto/80">Prioridade</label>
                  <select
                    className={`w-full rounded-xl border border-borda px-4 py-3 text-texto transition-all ${
                      isEditing ? 'bg-transparent hover:border-azul-claro/50 focus:border-azul-claro focus:ring-2 focus:ring-azul-claro/20' : 'bg-gray-500/10 cursor-not-allowed'
                    }`}
                    value={ticket.priority}
                    onChange={(e) => isEditing && saveField("priority", e.target.value)}
                    disabled={!isEditing}
                  >
                    <option value="LOW">Baixa</option>
                    <option value="MEDIUM">Média</option>
                    <option value="HIGH">Alta</option>
                    <option value="URGENT">Crítica</option>
                  </select>
                </div>

                {ticket.assignedTo && (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-texto/80">Atribuído para</label>
                    <div className="rounded-xl border border-borda bg-azul-claro/10 px-4 py-3 text-azul-claro font-medium">
                      {ticket.assignedTo.username}
                    </div>
                  </div>
                )}


                <div className="pt-4 border-t border-borda">
                  <div className="text-xs text-texto/60 space-y-1">
                    <p><strong>Criado:</strong> {new Date(ticket.createdAt).toLocaleString('pt-BR')}</p>
                    <p><strong>Atualizado:</strong> {new Date(ticket.updatedAt).toLocaleString('pt-BR')}</p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* COMENTÁRIOS */}
          <section className="mt-4 sm:mt-6 rounded-2xl border border-borda p-4 sm:p-6 min-w-0">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                <span className="text-yellow-400 text-lg">💬</span>
              </div>
              <h2 className="text-xl font-semibold text-titulo">Comentários</h2>
            </div>

            <div className="space-y-4">
              {comments.map((c) => (
                <div key={c.id} className="rounded-xl border border-borda bg-fundo/30 p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-azul-claro/20 flex items-center justify-center">
                      <span className="text-azul-claro text-sm font-bold">{c.author?.username?.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="font-medium text-titulo">{c.author?.username}</p>
                      <p className="text-xs text-texto/60">{new Date(c.createdAt).toLocaleString('pt-BR')}</p>
                    </div>
                  </div>
                  <p className="text-texto whitespace-pre-wrap ml-11">{c.body}</p>
                </div>
              ))}
            </div>

            <form onSubmit={submitComment} className="mt-4 sm:mt-6 max-w-full">
              <div className="flex gap-2 sm:gap-3">
                <textarea
                  rows={1}
                  className="flex-1 min-w-0 rounded-xl border border-borda bg-transparent px-3 sm:px-4 py-3 text-texto focus:border-azul-claro focus:ring-2 focus:ring-azul-claro/20 resize-none"
                  placeholder="Adicione um comentário..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <div className="flex-shrink-0">
                  <Button type="submit" disabled={!newComment.trim() || saving} className="px-2 sm:px-4 py-3 min-w-[60px] sm:min-w-[100px] text-xs sm:text-sm">
                    {saving ? "..." : "Enviar"}
                  </Button>
                </div>
              </div>
            </form>
          </section>
        </>
      )}
    </AppLayout>
  );
}