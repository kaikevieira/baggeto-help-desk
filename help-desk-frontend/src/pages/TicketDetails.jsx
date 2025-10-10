import { useEffect, useState, useRef } from "react";
import { FiTruck, FiMapPin, FiEdit2, FiSave, FiChevronLeft, FiFileText, FiDollarSign, FiPackage, FiSettings, FiMessageSquare } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import { addComment, getTicket, listComments, updateTicket, deleteTicket } from "../api/tickets";
import UserSelect from "../components/UserSelect";
import AppLayout from "../components/AppLayout";
import Button from "../components/Button";
import StatusPill from "../components/StatusPill";
import { useAuth } from "../context/AuthContext.jsx";
import { usePageTitle } from "../hooks/usePageTitle";
import { FullPageSkeleton } from "../components/Skeletons";
import CityUFInput from "../components/CityUFInput";
import RouteSelector from "../components/RouteSelector";
import MultiUserSelect from "../components/MultiUserSelect";

export default function TicketDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [ticket, setTicket] = useState(null);
  // rascunho local para modo de edição (todas as alterações só são salvas ao clicar em "Salvar")
  const [draft, setDraft] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  // máscara de frete (BRL)
  const [freightDisplay, setFreightDisplay] = useState("");
  const [freightNumber, setFreightNumber] = useState(null);
  
  // Título dinâmico baseado no ticket
  usePageTitle(ticket ? `Ticket #${ticket.id} - ${ticket.title}` : `Ticket #${id}`);
  
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  // ids iniciais de atribuições para impedir remoção por usuários não autorizados
  const initialAssignedIdsRef = useRef([]);

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

  useEffect(() => {
    // sincroniza máscara de frete com dados do ticket
    // quando NÃO estiver editando, exibe com base no ticket
    if (isEditing) return;
    const val = ticket?.freightValue;
    if (val == null || val === "") {
      setFreightDisplay("");
      setFreightNumber(null);
      return;
    }
    const num = typeof val === 'number' ? val : Number(val);
    if (!isNaN(num)) {
      setFreightNumber(num);
      setFreightDisplay(num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }));
    }
  }, [ticket?.freightValue]);

  // helpers de atribuição
  function buildAssignedListFromTicket(t) {
    const list = [];
    if (t?.assignedTo) list.push(t.assignedTo);
    for (const a of (t?.assignees || [])) {
      if (!list.find((u) => u.id === a.userId) && a.user) list.push(a.user);
    }
    return list;
  }

  function startEdit() {
    if (!ticket) return;
    // construir rascunho completo
    const d = {
      // transporte / rota
      originCity: ticket.originCity || "",
      originUF: ticket.originUF || "",
      originIBGEId: ticket.originIBGEId ?? null,
      destinationCity: ticket.destinationCity || "",
      destinationUF: ticket.destinationUF || "",
      destinationIBGEId: ticket.destinationIBGEId ?? null,
      route: ticket.route || "",
      // frete
      freightBasis: ticket.freightBasis || "FULL",
      incoterm: ticket.incoterm || "CIF",
      serviceTaker: ticket.serviceTaker || "",
      // descrição
      description: ticket.description || "",
      // financeiros
      freightValue: ticket.freightValue == null ? null : Number(ticket.freightValue),
      paymentTerm: ticket.paymentTerm || "",
      paymentType: ticket.paymentType || "",
      // carga
      cargoWeight: ticket.cargoWeight == null ? null : Number(ticket.cargoWeight),
      billingCompany: ticket.billingCompany || "",
      // veículos
      plateCavalo: ticket.plateCavalo || "",
      plateCarreta1: ticket.plateCarreta1 || "",
      plateCarreta2: ticket.plateCarreta2 || "",
      plateCarreta3: ticket.plateCarreta3 || "",
      // frota/terceiros
      fleetType: ticket.fleetType || "FROTA",
      thirdPartyPayment: ticket.thirdPartyPayment == null ? null : Number(ticket.thirdPartyPayment),
      // pedagio/representantes
      hasToll: ticket.hasToll || "",
      cteRepresentative: ticket.cteRepresentative || "",
      manifestRepresentative: ticket.manifestRepresentative || "",
      // operacional
      status: ticket.status,
      priority: ticket.priority,
      // atribuições (lista de objetos usuário para o componente)
      assignedList: buildAssignedListFromTicket(ticket),
    };
    // máscara inicial do frete
    if (d.freightValue == null) {
      setFreightDisplay("");
      setFreightNumber(null);
    } else {
      setFreightNumber(d.freightValue);
      setFreightDisplay(d.freightValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }));
    }
    // ids iniciais para política de "somente adicionar" para atribuídos
    initialAssignedIdsRef.current = buildAssignedListFromTicket(ticket).map(u => u.id);
    setDraft(d);
    setIsEditing(true);
  }

  async function saveDraft() {
    if (!draft || !ticket) { setIsEditing(false); return; }
    // monta payload apenas com diferenças
    const fields = [
      'originCity','originUF','originIBGEId','destinationCity','destinationUF','destinationIBGEId','route',
      'freightBasis','incoterm','serviceTaker','description','freightValue','paymentTerm','paymentType',
      'cargoWeight','billingCompany','plateCavalo','plateCarreta1','plateCarreta2','plateCarreta3',
      'fleetType','thirdPartyPayment','hasToll','cteRepresentative','manifestRepresentative','status','priority'
    ];
    const payload = {};
    for (const key of fields) {
      const prevVal = ticket[key] ?? (key === 'hasToll' ? '' : null);
      const nextVal = draft[key];
      // normalizar números que podem ser string/number
      const norm = v => (v === '' ? '' : (v == null ? null : v));
      if (JSON.stringify(norm(prevVal)) !== JSON.stringify(norm(nextVal))) {
        payload[key] = nextVal === '' ? '' : nextVal;
      }
    }
    // atribuições
    const currentFirst = ticket.assignedTo ? ticket.assignedTo.id : null;
    const currentRestSet = new Set((ticket.assignees || []).map(a => a.userId));
    const proposedFirst = (draft.assignedList && draft.assignedList[0]) ? draft.assignedList[0].id : null;
    const proposedRest = (draft.assignedList || []).slice(1).map(u => u.id);
    const sameFirst = currentFirst === proposedFirst;
    const sameRest = proposedRest.length === currentRestSet.size && proposedRest.every(id => currentRestSet.has(id));
    if (!sameFirst || !sameRest) {
      payload.assignedToId = proposedFirst;
      payload.assignedUserIds = proposedRest;
    }

    if (Object.keys(payload).length === 0) {
      // nada mudou
      setIsEditing(false);
      setDraft(null);
      return;
    }

    // Otimista: aplica visualmente e salva em background
    const prevTicket = ticket;
    const nextTicket = { ...ticket };
    // Atualiza campos simples diretamente do draft
    for (const key of fields) {
      if (Object.prototype.hasOwnProperty.call(payload, key)) {
        nextTicket[key] = draft[key];
      }
    }
    // Atribuições (usa objetos do draft)
    if (Object.prototype.hasOwnProperty.call(payload, 'assignedToId') || Object.prototype.hasOwnProperty.call(payload, 'assignedUserIds')) {
      const list = Array.isArray(draft.assignedList) ? draft.assignedList : [];
      const primary = list[0] || null;
      const rest = list.slice(1);
      nextTicket.assignedToId = primary ? primary.id : null;
      nextTicket.assignedTo = primary || null;
      nextTicket.assignees = rest.map(u => ({ userId: u.id, user: u }));
    }
    // Atualiza UI imediatamente
    setTicket(nextTicket);
    setIsEditing(false);
    setDraft(null);

    // Envia a atualização ao servidor em background e concilia resposta
    setSaving(true);
    try {
      const key = `ticket-save-draft:${id}:${Date.now()}`;
      const updated = await updateTicket(id, payload, { idempotencyKey: key });
      setTicket(updated);
    } catch (e) {
      // Reverte em caso de erro
      setTicket(prevTicket);
      setError(e?.message || "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  async function submitComment(e) {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSaving(true);
    try {
      const key = `comment-create:${id}:${Date.now()}`;
      await addComment(id, newComment.trim(), { idempotencyKey: key });
      setNewComment("");
      const cs = await listComments(id);
      setComments(cs);
    } catch (e) {
      setError(e?.message || "Erro ao comentar");
    } finally {
      setSaving(false);
    }
  }

  // Exclusão do ticket (apenas criador)
  async function confirmDelete() {
    if (deleteLoading) return;
    setDeleteLoading(true);
    setDeleteError("");
    try {
      await deleteTicket(id, { idempotencyKey: `ticket-delete:${id}` });
      setDeleteOpen(false);
      navigate("/tickets", { replace: true });
    } catch (e) {
      setDeleteError(e?.message || "Erro ao excluir o ticket");
    } finally {
      setDeleteLoading(false);
    }
  }

  // Regras:
  // - ADMIN: pode editar qualquer
  // - USER: pode editar apenas se for o criador; se for somente atribuído, é visualização
  // Atenção: no frontend o usuário tem shape { id, username, role }
  // então devemos comparar com user.id (não user.sub)
  const isCreator = user && ticket && user.id === ticket.createdById;
  const isAdmin = user && user.role === "ADMIN";
  const isAssigned = !!(user && ticket && ((ticket.assignedToId && ticket.assignedToId === user.id) || (Array.isArray(ticket.assignees) && ticket.assignees.some(a => a.userId === user.id))));
  const canEditFull = !!(isAdmin || isCreator);
  const canEditOperational = !!(isAdmin || isCreator || isAssigned);
  
  function toggleEdit() {
    if (!canEditOperational) return;
    if (!isEditing) {
      startEdit();
    } else {
      // salvar alterações
      saveDraft();
    }
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
        <FullPageSkeleton />
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
                  {(ticket.assignedTo || (ticket.assignees && ticket.assignees.length)) && (
                    <span className="truncate min-w-0">
                      Atribuído para
                      <strong className="text-texto"> {
                        [
                          ...(ticket.assignedTo ? [ticket.assignedTo.username] : []),
                          ...((ticket.assignees || []).map(a => a.user?.username).filter(Boolean))
                        ].join(', ')
                      } </strong>
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {canEditOperational && (
                  <Button 
                    onClick={toggleEdit} 
                    className={`px-2 sm:px-4 py-2 min-w-[70px] sm:min-w-[100px] text-xs sm:text-sm ${isEditing ? 'bg-green-600 hover:bg-green-700' : 'bg-azul-claro hover:bg-azul-claro/80'}`}
                  >
                    {isEditing ? (saving ? 'Salvando...' : (<span className="inline-flex items-center gap-2"><FiSave />Salvar</span>)) : (<span className="inline-flex items-center gap-2"><FiEdit2 />Editar</span>)}
                  </Button>
                )}
                {isEditing && (
                  <Button onClick={() => { setIsEditing(false); setDraft(null); }} className="bg-gray-600 hover:bg-gray-700 px-2 sm:px-4 py-2 min-w-[70px] sm:min-w-[100px] text-xs sm:text-sm">
                    Cancelar
                  </Button>
                )}
                {isCreator && (
                  <Button onClick={() => setDeleteOpen(true)} className="bg-red-600 hover:bg-red-700 px-2 sm:px-4 py-2 min-w-[70px] sm:min-w-[100px] text-xs sm:text-sm">
                    Excluir
                  </Button>
                )}
                <Button onClick={() => navigate("/tickets")} className="bg-gray-600 hover:bg-gray-700 px-2 sm:px-4 py-2 min-w-[70px] sm:min-w-[100px] text-xs sm:text-sm">
                  <span className="inline-flex items-center gap-2"><FiChevronLeft />Voltar</span>
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
                <div className="w-10 h-10 rounded-xl bg-azul-claro/20 flex items-center justify-center text-azul-claro text-lg">
                  <FiTruck />
                </div>
                <h2 className="text-xl font-semibold text-titulo">Informações de Transporte</h2>
              </div>

              <div className="space-y-6">
                {/* ORIGEM E DESTINO */}
                <div className="rounded-xl p-4 border border-borda">
                  <h3 className="text-sm font-medium text-titulo mb-3 flex items-center gap-2">
                    <FiMapPin /> Rota de Transporte
                  </h3>
                  <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
                    <div className="min-w-0">
                      <label className="mb-2 block text-sm font-medium text-texto/80">Origem</label>
                      {isEditing && canEditFull ? (
                        <CityUFInput
                          value={{ city: draft?.originCity || "", uf: draft?.originUF || "", ibgeId: draft?.originIBGEId || undefined }}
                          onChange={(v) => setDraft((d) => ({ ...d, originCity: v.city, originUF: v.uf, originIBGEId: v.ibgeId }))}
                        />
                      ) : (
                        <div className="rounded-xl border border-borda bg-fundo/50 px-3 sm:px-4 py-3 text-texto font-medium truncate">
                          {ticket.originCity && ticket.originUF ? `${ticket.originCity}/${ticket.originUF}` : "Não informado"}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <label className="mb-2 block text-sm font-medium text-texto/80">Destino</label>
                      {isEditing && canEditFull ? (
                        <CityUFInput
                          value={{ city: draft?.destinationCity || "", uf: draft?.destinationUF || "", ibgeId: draft?.destinationIBGEId || undefined }}
                          onChange={(v) => setDraft((d) => ({ ...d, destinationCity: v.city, destinationUF: v.uf, destinationIBGEId: v.ibgeId }))}
                        />
                      ) : (
                        <div className="rounded-xl border border-borda bg-fundo/50 px-3 sm:px-4 py-3 text-texto font-medium truncate">
                          {ticket.destinationCity && ticket.destinationUF ? `${ticket.destinationCity}/${ticket.destinationUF}` : "Não informado"}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* ROTA POR ESTADOS */}
                  <div className="mt-4">
                    {isEditing && canEditFull ? (
                      <RouteSelector
                        value={draft?.route || ""}
                        onChange={(val) => setDraft((d) => ({ ...d, route: val || "" }))}
                        startUF={draft?.originUF || ticket.originUF || ""}
                        endUF={draft?.destinationUF || ticket.destinationUF || ""}
                      />
                    ) : (
                      <>
                        <label className="mb-2 block text-sm font-medium text-texto/80">Rota por Estados</label>
                        <div className="rounded-xl border border-azul-claro/30 bg-azul-claro/10 px-3 sm:px-4 py-3">
                          <div className="text-azul-claro font-mono text-lg font-semibold text-center">
                            {ticket.route || "—"}
                          </div>
                          <div className="text-xs text-azul-claro/70 text-center mt-1">
                            Roteiro de estados por onde a carga irá passar
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* CONFIGURAÇÕES DE FRETE */}
                <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
                  <div className="min-w-0">
                    <label className="mb-2 block text-sm font-medium text-texto/80">Tipo de Frete</label>
                    <select
                      className={`w-full min-w-0 rounded-xl border border-borda px-3 sm:px-4 py-3 text-texto transition-all ${
                        isEditing && canEditFull ? 'bg-transparent hover:border-azul-claro/50 focus:border-azul-claro focus:ring-2 focus:ring-azul-claro/20' : 'bg-gray-500/10 cursor-not-allowed'
                      }`}
                      value={isEditing ? (draft?.freightBasis || "FULL") : (ticket.freightBasis || "FULL")}
                      onChange={(e) => isEditing && canEditFull && setDraft((d) => ({ ...d, freightBasis: e.target.value }))}
                      disabled={!(isEditing && canEditFull)}
                    >
                      <option value="FULL">Frete Cheio</option>
                      <option value="TON">Frete Tonelada</option>
                    </select>
                  </div>
                  
                  <div className="min-w-0">
                    <label className="mb-2 block text-sm font-medium text-texto/80">Modalidade</label>
                    <select
                      className={`w-full min-w-0 rounded-xl border border-borda px-3 sm:px-4 py-3 text-texto transition-all ${
                        isEditing && canEditFull ? 'bg-transparent hover:border-azul-claro/50 focus:border-azul-claro focus:ring-2 focus:ring-azul-claro/20' : 'bg-gray-500/10 cursor-not-allowed'
                      }`}
                      value={isEditing ? (draft?.incoterm || "CIF") : (ticket.incoterm || "CIF")}
                      onChange={(e) => isEditing && canEditFull && setDraft((d) => ({ ...d, incoterm: e.target.value }))}
                      disabled={!(isEditing && canEditFull)}
                    >
                      <option value="CIF">CIF</option>
                      <option value="FOB">FOB</option>
                    </select>
                  </div>
                  <div className={ticket.fleetType === "TERCEIRO" ? "" : "sm:col-span-2"}>
                      <label className="mb-2 block text-sm font-medium text-texto/80">Tomador de serviço</label>
                      <input
                        className={`w-full rounded-xl border border-borda px-4 py-3 text-texto transition-all ${
                          isEditing && canEditFull ? 'bg-transparent hover:border-azul-claro/50 focus:border-azul-claro focus:ring-2 focus:ring-azul-claro/20' : 'bg-gray-500/10 cursor-not-allowed'
                        }`}
                        value={isEditing ? (draft?.serviceTaker ?? "") : (ticket.serviceTaker ?? "")}
                        onChange={(e) => isEditing && canEditFull && setDraft((d) => ({ ...d, serviceTaker: e.target.value }))}
                        disabled={!(isEditing && canEditFull)}
                        placeholder="Nome do tomador"
                      />
                    </div>
                </div>

                {/* DESCRIÇÃO */}
                <div className="rounded-xl p-3 sm:p-4 border border-borda max-w-full overflow-hidden">
                  <h3 className="text-sm font-medium text-titulo mb-3 flex items-center gap-2">
                    <FiFileText /> Descrição do Chamado
                  </h3>
                  <div className="rounded-lg bg-fundo/50 border border-borda px-3 sm:px-4 py-3 max-w-full overflow-hidden">
                    {isEditing && canEditFull ? (
                      <textarea
                        className="w-full min-w-0 bg-transparent border-none resize-none focus:outline-none text-texto"
                        rows={4}
                        value={draft?.description ?? ""}
                        onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
                      />
                    ) : (
                      <p className="text-texto whitespace-pre-wrap break-words">{ticket.description}</p>
                    )}
                  </div>
                </div>

                {/* INFORMAÇÕES FINANCEIRAS */}
                <div className="rounded-xl p-4 border border-borda">
                  <h3 className="text-sm font-medium text-titulo mb-3 flex items-center gap-2">
                    <FiDollarSign /> Informações Financeiras
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-texto/80">Valor do frete (R$)</label>
                      <input
                        className={`w-full rounded-xl border border-borda px-4 py-3 text-texto transition-all ${
                          isEditing && canEditFull ? 'bg-transparent hover:border-azul-claro/50 focus:border-azul-claro focus:ring-2 focus:ring-azul-claro/20' : 'bg-gray-500/10 cursor-not-allowed'
                        }`}
                        value={freightDisplay}
                        onChange={(e) => {
                          const digits = (e.target.value || "").replace(/\D/g, "");
                          if (!digits) {
                            setFreightDisplay("");
                            setFreightNumber(null);
                            if (isEditing) setDraft((d) => ({ ...d, freightValue: null }));
                          } else {
                            const number = parseInt(digits, 10) / 100;
                            setFreightNumber(number);
                            setFreightDisplay(number.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }));
                            if (isEditing) setDraft((d) => ({ ...d, freightValue: number }));
                          }
                        }}
                        disabled={!(isEditing && canEditFull)}
                        placeholder="R$ 0,00"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-texto/80">Prazo para pagamento</label>
                      <input
                        className={`w-full rounded-xl border border-borda px-4 py-3 text-texto transition-all ${
                          isEditing && canEditFull ? 'bg-transparent hover:border-azul-claro/50 focus:border-azul-claro focus:ring-2 focus:ring-azul-claro/20' : 'bg-gray-500/10 cursor-not-allowed'
                        }`}
                        value={isEditing ? (draft?.paymentTerm ?? "") : (ticket.paymentTerm ?? "")}
                        onChange={(e) => isEditing && canEditFull && setDraft((d) => ({ ...d, paymentTerm: e.target.value }))}
                        disabled={!(isEditing && canEditFull)}
                        placeholder="Ex: à vista, 15 dias, 30 dias"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-texto/80">Tipo de pagamento</label>
                      <input
                        className={`w-full rounded-xl border border-borda px-4 py-3 text-texto transition-all ${
                          isEditing && canEditFull ? 'bg-transparent hover:border-azul-claro/50 focus:border-azul-claro focus:ring-2 focus:ring-azul-claro/20' : 'bg-gray-500/10 cursor-not-allowed'
                        }`}
                        value={isEditing ? (draft?.paymentType ?? "") : (ticket.paymentType ?? "")}
                        onChange={(e) => isEditing && canEditFull && setDraft((d) => ({ ...d, paymentType: e.target.value }))}
                        disabled={!(isEditing && canEditFull)}
                        placeholder="Ex: PIX, Boleto, TED"
                      />
                    </div>
                  </div>
                </div>

                {/* INFORMAÇÕES DA CARGA */}
                <div className="rounded-xl p-4 border border-borda">
                  <h3 className="text-sm font-medium text-titulo mb-3 flex items-center gap-2">
                    <FiPackage /> Informações da Carga
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-texto/80">Peso da carga (ton)</label>
                      <input
                        type="number"
                        step="0.001"
                        min="0"
                        className={`w-full rounded-xl border border-borda px-4 py-3 text-texto transition-all ${
                          isEditing && canEditFull ? 'bg-transparent hover:border-azul-claro/50 focus:border-azul-claro focus:ring-2 focus:ring-azul-claro/20' : 'bg-gray-500/10 cursor-not-allowed'
                        }`}
                        value={isEditing ? (draft?.cargoWeight ?? "") : (ticket.cargoWeight ?? "")}
                        onChange={(e) => isEditing && canEditFull && setDraft((d) => ({ ...d, cargoWeight: e.target.value === '' ? null : Number(e.target.value) }))}
                        disabled={!(isEditing && canEditFull)}
                        placeholder="Ex: 28.500"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-texto/80">Empresa de faturamento</label>
                      <input
                        className={`w-full rounded-xl border border-borda px-4 py-3 text-texto transition-all ${
                          isEditing && canEditFull ? 'bg-transparent hover:border-azul-claro/50 focus:border-azul-claro focus:ring-2 focus:ring-azul-claro/20' : 'bg-gray-500/10 cursor-not-allowed'
                        }`}
                        value={isEditing ? (draft?.billingCompany ?? "") : (ticket.billingCompany ?? "")}
                        onChange={(e) => isEditing && canEditFull && setDraft((d) => ({ ...d, billingCompany: e.target.value }))}
                        disabled={!(isEditing && canEditFull)}
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
                          isEditing && canEditFull ? 'bg-transparent hover:border-azul-claro/50 focus:border-azul-claro focus:ring-2 focus:ring-azul-claro/20' : 'bg-gray-500/10 cursor-not-allowed'
                        }`}
                        value={isEditing ? (draft?.plateCavalo ?? "") : (ticket.plateCavalo ?? "")}
                        onChange={(e) => isEditing && canEditFull && setDraft((d) => ({ ...d, plateCavalo: e.target.value.toUpperCase() }))}
                        disabled={!(isEditing && canEditFull)}
                        placeholder="Ex: ABC1234"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-texto/80">Placa (1ª carreta)</label>
                      <input
                        className={`w-full rounded-xl border border-borda px-4 py-3 text-texto transition-all font-mono uppercase tracking-wider ${
                          isEditing && canEditFull ? 'bg-transparent hover:border-azul-claro/50 focus:border-azul-claro focus:ring-2 focus:ring-azul-claro/20' : 'bg-gray-500/10 cursor-not-allowed'
                        }`}
                        value={isEditing ? (draft?.plateCarreta1 ?? "") : (ticket.plateCarreta1 ?? "")}
                        onChange={(e) => isEditing && canEditFull && setDraft((d) => ({ ...d, plateCarreta1: e.target.value.toUpperCase() }))}
                        disabled={!(isEditing && canEditFull)}
                        placeholder="Ex: ABC1234"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-texto/80">Placa (2ª carreta / Dolly)</label>
                      <input
                        className={`w-full rounded-xl border border-borda px-4 py-3 text-texto transition-all font-mono uppercase tracking-wider ${
                          isEditing && canEditFull ? 'bg-transparent hover:border-azul-claro/50 focus:border-azul-claro focus:ring-2 focus:ring-azul-claro/20' : 'bg-gray-500/10 cursor-not-allowed'
                        }`}
                        value={isEditing ? (draft?.plateCarreta2 ?? "") : (ticket.plateCarreta2 ?? "")}
                        onChange={(e) => isEditing && canEditFull && setDraft((d) => ({ ...d, plateCarreta2: e.target.value.toUpperCase() }))}
                        disabled={!(isEditing && canEditFull)}
                        placeholder="Ex: ABC1234"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-texto/80">Placa (3ª carreta)</label>
                      <input
                        className={`w-full rounded-xl border border-borda px-4 py-3 text-texto transition-all font-mono uppercase tracking-wider ${
                          isEditing && canEditFull ? 'bg-transparent hover:border-azul-claro/50 focus:border-azul-claro focus:ring-2 focus:ring-azul-claro/20' : 'bg-gray-500/10 cursor-not-allowed'
                        }`}
                        value={isEditing ? (draft?.plateCarreta3 ?? "") : (ticket.plateCarreta3 ?? "")}
                        onChange={(e) => isEditing && canEditFull && setDraft((d) => ({ ...d, plateCarreta3: e.target.value.toUpperCase() }))}
                        disabled={!(isEditing && canEditFull)}
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
                          isEditing && canEditFull ? 'bg-transparent hover:border-azul-claro/50 focus:border-azul-claro focus:ring-2 focus:ring-azul-claro/20' : 'bg-gray-500/10 cursor-not-allowed'
                        }`}
                        value={isEditing ? (draft?.fleetType || "FROTA") : (ticket.fleetType || "FROTA")}
                        onChange={(e) => isEditing && canEditFull && setDraft((d) => ({ ...d, fleetType: e.target.value }))}
                        disabled={!(isEditing && canEditFull)}
                      >
                        <option value="FROTA">Frota</option>
                        <option value="TERCEIRO">Terceiro</option>
                      </select>
                    </div>
                    {(isEditing ? draft?.fleetType : ticket.fleetType) === "TERCEIRO" && (
                      <div>
                        <label className="mb-2 block text-sm font-medium text-texto/80">Valor p/ terceiro (R$)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          className={`w-full rounded-xl border border-borda px-4 py-3 text-texto transition-all ${
                            isEditing && canEditFull ? 'bg-transparent hover:border-azul-claro/50 focus:border-azul-claro focus:ring-2 focus:ring-azul-claro/20' : 'bg-gray-500/10 cursor-not-allowed'
                          }`}
                          value={isEditing ? (draft?.thirdPartyPayment ?? "") : (ticket.thirdPartyPayment ?? "")}
                          onChange={(e) => isEditing && canEditFull && setDraft((d) => ({ ...d, thirdPartyPayment: e.target.value === '' ? null : Number(e.target.value) }))}
                          disabled={!(isEditing && canEditFull)}
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
                        isEditing && canEditFull ? 'bg-transparent hover:border-azul-claro/50 focus:border-azul-claro focus:ring-2 focus:ring-azul-claro/20' : 'bg-gray-500/10 cursor-not-allowed'
                      }`}
                      value={isEditing ? (draft?.hasToll ?? "") : (ticket.hasToll ?? "")}
                      onChange={(e) => isEditing && canEditFull && setDraft((d) => ({ ...d, hasToll: e.target.value }))}
                      disabled={!(isEditing && canEditFull)}
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
                        isEditing && canEditFull ? 'bg-transparent hover:border-azul-claro/50 focus:border-azul-claro focus:ring-2 focus:ring-azul-claro/20' : 'bg-gray-500/10 cursor-not-allowed'
                      }`}
                      value={isEditing ? (draft?.cteRepresentative ?? "") : (ticket.cteRepresentative ?? "")}
                      onChange={(e) => isEditing && canEditFull && setDraft((d) => ({ ...d, cteRepresentative: e.target.value }))}
                      disabled={!(isEditing && canEditFull)}
                      placeholder="Nome do representante"
                    />
                  </div>

                  <div className="w-full">
                    <label className="mb-2 block text-sm font-medium text-texto/80">Representante do Manifesto</label>
                    <input
                      className={`w-full rounded-xl border border-borda px-4 py-3 text-texto transition-all ${
                        isEditing && canEditFull ? 'bg-transparent hover:border-azul-claro/50 focus:border-azul-claro focus:ring-2 focus:ring-azul-claro/20' : 'bg-gray-500/10 cursor-not-allowed'
                      }`}
                      value={isEditing ? (draft?.manifestRepresentative ?? "") : (ticket.manifestRepresentative ?? "")}
                      onChange={(e) => isEditing && canEditFull && setDraft((d) => ({ ...d, manifestRepresentative: e.target.value }))}
                      disabled={!(isEditing && canEditFull)}
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
                <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center text-green-400 text-lg">
                  <FiSettings />
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
                      isEditing && canEditOperational ? 'bg-transparent hover:border-azul-claro/50 focus:border-azul-claro focus:ring-2 focus:ring-azul-claro/20' : 'bg-gray-500/10 cursor-not-allowed'
                    }`}
                    value={isEditing ? (draft?.status ?? ticket.status) : ticket.status}
                    onChange={(e) => isEditing && canEditOperational && setDraft((d) => ({ ...d, status: e.target.value }))}
                    disabled={!(isEditing && canEditOperational)}
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
                      isEditing && canEditOperational ? 'bg-transparent hover:border-azul-claro/50 focus:border-azul-claro focus:ring-2 focus:ring-azul-claro/20' : 'bg-gray-500/10 cursor-not-allowed'
                    }`}
                    value={isEditing ? (draft?.priority ?? ticket.priority) : ticket.priority}
                    onChange={(e) => isEditing && canEditOperational && setDraft((d) => ({ ...d, priority: e.target.value }))}
                    disabled={!(isEditing && canEditOperational)}
                  >
                    <option value="LOW">Baixa</option>
                    <option value="MEDIUM">Média</option>
                    <option value="HIGH">Alta</option>
                    <option value="URGENT">Crítica</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-texto/80">Atribuir para</label>
                  <MultiUserSelect
                    label="Atribuir para"
                    value={isEditing ? (draft?.assignedList || []) : buildAssignedListFromTicket(ticket)}
                    onChange={(list) => {
                      if (!isEditing) return;
                      // Admin/Criador: total controle no rascunho
                      if (canEditFull) {
                        setDraft((d) => ({ ...d, assignedList: list || [] }));
                        return;
                      }
                      // Atribuídos: somente adicionar (não remover os iniciais)
                      const proposedIds = (list || []).map(u => u.id).filter(Boolean);
                      const unionIds = Array.from(new Set([ ...initialAssignedIdsRef.current, ...proposedIds ]));
                      // reconstruir objetos usando os disponíveis (lista proposta + atual do rascunho)
                      const currentMap = new Map([...(draft?.assignedList || []).map(u => [u.id, u])]);
                      for (const u of (list || [])) currentMap.set(u.id, u);
                      const rebuilt = unionIds.map(id => currentMap.get(id)).filter(Boolean);
                      setDraft((d) => ({ ...d, assignedList: rebuilt }));
                    }}
                    disabled={!isEditing}
                  />
                </div>


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
                <span className="text-yellow-400 text-lg"><FiMessageSquare /></span>
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
      <DeleteTicketModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={confirmDelete}
        loading={deleteLoading}
        error={deleteError}
      />
    </AppLayout>
  );
}

// Modal simples de confirmação de exclusão
// Colocado no final do arquivo para manter a função principal limpa
export function DeleteTicketModal({ open, onClose, onConfirm, loading, error }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-fundo border border-borda rounded-2xl shadow-2xl w-full max-w-md p-5">
        <h3 className="text-lg font-semibold text-titulo mb-2">Excluir ticket</h3>
        <p className="text-texto/80 mb-4">Tem certeza que deseja excluir este ticket? Esta ação não pode ser desfeita.</p>
        {error && <div className="mb-3 text-sm text-red-400">{error}</div>}
        <div className="flex items-center justify-end gap-2">
          <button onClick={onClose} disabled={loading} className="px-4 py-2 rounded-xl border border-borda text-texto hover:bg-slate-600/30 disabled:opacity-50">Cancelar</button>
          <button onClick={onConfirm} disabled={loading} className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white disabled:opacity-50">{loading ? 'Excluindo...' : 'Excluir'}</button>
        </div>
      </div>
    </div>
  );
}