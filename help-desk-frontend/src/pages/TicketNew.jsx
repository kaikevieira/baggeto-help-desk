import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createTicket } from "../api/tickets";
import AppLayout from "../components/AppLayout";
import RouteSelector from "../components/RouteSelector";
import Button from "../components/Button";
import CityUFInput from "../components/CityUFInput";
import CompanySelect from "../components/CompanySelect";
import MultiUserSelect from "../components/MultiUserSelect";
import { useAuth } from "../context/AuthContext.jsx";
import { usePageTitle } from "../hooks/usePageTitle";
import { PageHeaderSkeleton, Skeleton } from "../components/Skeletons";
import { listTemplates, createTemplate, updateTemplate, deleteTemplate } from "../api/templates";

export default function TicketNew() {
  usePageTitle('Novo Ticket');
  const navigate = useNavigate();
  const { user, initializing } = useAuth();

  const [origin, setOrigin] = useState({ city: "", uf: "SC", ibgeId: undefined });
  const [destination, setDestination] = useState({ city: "", uf: "SC", ibgeId: undefined });
  const [assignedList, setAssignedList] = useState([]); // unified: first = primary, rest = additional
  const [route, setRoute] = useState(""); // Rota por estados (ex: "SP > PR > SC")

  const [form, setForm] = useState({
    title: "",
    description: "",
    // Operacional
    status: "OPEN",
    priority: "MEDIUM",
    // Transporte
    freightBasis: "FULL",
    incoterm: "CIF",
    paymentTerm: "",
    paymentType: "",
  freightValue: "",
    cargoWeight: "",
    billingCompany: "",
    plateCavalo: "",
    plateCarreta1: "",
    plateCarreta2: "",
    plateCarreta3: "",
    fleetType: "FROTA",
    thirdPartyPayment: "",
    serviceTaker: "",
    // Novos campos para terceiros
    hasToll: "COM_PEDAGIO", // COM_PEDAGIO, SEM_PEDAGIO, CLIENTE_PAGA_PEDAGIO
    cteRepresentative: "",
    manifestRepresentative: "",
  });

  // Máscara monetária (BRL) para pagamento a terceiro
  const [thirdPartyPaymentDisplay, setThirdPartyPaymentDisplay] = useState("");
  const [freightValueDisplay, setFreightValueDisplay] = useState("");

  useEffect(() => {
    const val = form.thirdPartyPayment;
    if (val === "" || val == null) {
      setThirdPartyPaymentDisplay("");
      return;
    }
    const num = typeof val === "number" ? val : Number(val);
    if (!isNaN(num)) {
      setThirdPartyPaymentDisplay(
        num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
      );
    }
  }, [form.thirdPartyPayment]);

  useEffect(() => {
    const val = form.freightValue;
    if (val === "" || val == null) {
      setFreightValueDisplay("");
      return;
    }
    const num = typeof val === "number" ? val : Number(val);
    if (!isNaN(num)) {
      setFreightValueDisplay(num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }));
    }
  }, [form.freightValue]);

  function onChangeThirdPartyPayment(e) {
    const input = e.target.value || "";
    // Mantém apenas dígitos (centavos como duas casas)
    const digits = input.replace(/\D/g, "");
    if (!digits) {
      setThirdPartyPaymentDisplay("");
      setForm((f) => ({ ...f, thirdPartyPayment: "" }));
      return;
    }
    const number = parseInt(digits, 10) / 100;
    setThirdPartyPaymentDisplay(
      number.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
    );
    setForm((f) => ({ ...f, thirdPartyPayment: number }));
  }

  function onChangeFreightValue(e) {
    const input = e.target.value || "";
    const digits = input.replace(/\D/g, "");
    if (!digits) {
      setFreightValueDisplay("");
      setForm((f) => ({ ...f, freightValue: "" }));
      return;
    }
    const number = parseInt(digits, 10) / 100;
    setFreightValueDisplay(number.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }));
    setForm((f) => ({ ...f, freightValue: number }));
  }

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const setv = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  // ===============================
  // Modelos (Templates) de Ticket
  // ===============================
  const [templates, setTemplates] = useState([]);
  const [tplOpen, setTplOpen] = useState(false);
  const [tplLoading, setTplLoading] = useState(false);
  const [tplError, setTplError] = useState("");
  const [activeTemplateId, setActiveTemplateId] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState("create"); // 'create' | 'rename' | 'delete'
  const [modalName, setModalName] = useState("");
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [modalError, setModalError] = useState("");
  const [modalLoading, setModalLoading] = useState(false);
  const dropdownRef = useRef(null);
  const [busyTplIds, setBusyTplIds] = useState(() => new Set());

  function setTplBusy(id, busy) {
    setBusyTplIds(prev => {
      const next = new Set(prev);
      if (busy) next.add(id); else next.delete(id);
      return next;
    });
  }

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    function onDocClick(e) {
      if (!dropdownRef.current) return;
      if (tplOpen && !dropdownRef.current.contains(e.target)) {
        setTplOpen(false);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [tplOpen]);

  async function loadTemplates() {
    setTplLoading(true);
    setTplError("");
    try {
      const list = await listTemplates();
      setTemplates(Array.isArray(list) ? list : []);
    } catch (e) {
      setTplError("Erro ao carregar modelos");
      console.error(e);
    } finally {
      setTplLoading(false);
    }
  }

  function buildTemplateData() {
    return {
      form,
      origin,
      destination,
      route,
      assignedList,
    };
  }

  function applyTemplate(tpl) {
    try {
      const data = tpl?.data || tpl; // aceita objeto de dados diretamente
      if (!data) return;
      // Campos principais
      if (data.form) setForm((prev) => ({ ...prev, ...data.form }));
      if (data.origin) setOrigin(data.origin);
      if (data.destination) setDestination(data.destination);
    if (typeof data.route === 'string') setRoute(data.route);
    if (Array.isArray(data.assignedList)) setAssignedList(data.assignedList);
      setActiveTemplateId(tpl.id ?? null);
    } catch (e) {
      console.error('Falha ao aplicar modelo', e);
    }
  }

  function openCreateTemplateModal() {
    setModalType('create');
    setModalName('');
    setEditingTemplate(null);
    setModalError("");
    setModalOpen(true);
  }

  function openRenameTemplateModal(tpl) {
    setModalType('rename');
    setModalName(tpl?.name || '');
    setEditingTemplate(tpl);
    setModalError("");
    setModalOpen(true);
  }

  function openDeleteTemplateModal(tpl) {
    setModalType('delete');
    setEditingTemplate(tpl);
    setModalError("");
    setModalOpen(true);
  }

  async function handleModalConfirm() {
    try {
      if (modalLoading) return;
      setModalLoading(true);
      if (!modalName.trim()) return;
      if (modalType === 'create') {
        const created = await createTemplate({ name: modalName.trim(), data: buildTemplateData() });
        setTemplates((arr) => [created, ...arr]);
        setActiveTemplateId(created.id);
      } else if (modalType === 'rename' && editingTemplate) {
        const updated = await updateTemplate(editingTemplate.id, { name: modalName.trim(), data: editingTemplate.data });
        setTemplates((arr) => arr.map((t) => t.id === editingTemplate.id ? updated : t));
      }
      setModalOpen(false);
    } catch (e) {
      console.error(e);
      alert('Não foi possível salvar o modelo.');
    } finally {
      setModalLoading(false);
    }
  }

  async function handleUpdateWithCurrent(tpl) {
    try {
      if (busyTplIds.has(tpl.id)) return;
      setTplBusy(tpl.id, true);
      const updated = await updateTemplate(tpl.id, { name: tpl.name, data: buildTemplateData() });
      setTemplates((arr) => arr.map((t) => t.id === tpl.id ? updated : t));
      setActiveTemplateId(tpl.id);
    } catch (e) {
      console.error(e);
      alert('Falha ao atualizar o modelo.');
    } finally {
      setTplBusy(tpl.id, false);
    }
  }

  async function performDeleteTemplate() {
    if (!editingTemplate) return;
    setModalLoading(true);
    setModalError("");
    try {
      await deleteTemplate(editingTemplate.id);
      setTemplates((arr) => arr.filter((t) => t.id !== editingTemplate.id));
      if (activeTemplateId === editingTemplate.id) setActiveTemplateId(null);
      setModalOpen(false);
    } catch (e) {
      console.error(e);
      setModalError('Falha ao remover o modelo.');
    } finally {
      setModalLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        priority: form.priority,
  status: form.status || 'OPEN',

        originCity: origin.city || undefined,
        originUF: origin.uf || undefined,
        originIBGEId: origin.ibgeId || undefined,
        destinationCity: destination.city || undefined,
        destinationUF: destination.uf || undefined,
        destinationIBGEId: destination.ibgeId || undefined,
        
        // Rota por estados
        route: route || undefined,

        freightBasis: form.freightBasis,
        incoterm: form.incoterm,
        paymentTerm: form.paymentTerm || undefined,
        paymentType: form.paymentType || undefined,
  freightValue: form.freightValue ? Number(form.freightValue) : undefined,
        cargoWeight: form.cargoWeight ? Number(form.cargoWeight) : undefined,
        billingCompany: form.billingCompany || undefined,
        plateCavalo: form.plateCavalo || undefined,
        plateCarreta1: form.plateCarreta1 || undefined,
        plateCarreta2: form.plateCarreta2 || undefined,
        plateCarreta3: form.plateCarreta3 || undefined,
        fleetType: form.fleetType,
        thirdPartyPayment:
          form.fleetType === "TERCEIRO" && form.thirdPartyPayment
            ? Number(form.thirdPartyPayment)
            : undefined,
        serviceTaker: form.serviceTaker || undefined,
        hasToll: form.fleetType === "TERCEIRO" ? form.hasToll : undefined,
        cteRepresentative: form.cteRepresentative || undefined,
        manifestRepresentative: form.manifestRepresentative || undefined,

  assignedToId: (assignedList && assignedList[0]?.id) || undefined,
  assignedUserIds: (assignedList || []).slice(1).map(u => u.id).filter(Boolean),
      };

  const t = await createTicket(payload);
      navigate(`/tickets/${t.id}`, { replace: true });
    } catch (e) {
      setError(e?.message || "Erro ao criar chamado");
    } finally {
      setLoading(false);
    }
  }

  if (initializing) {
    return (
      <AppLayout onNavigate={(to) => navigate(to)}>
        <PageHeaderSkeleton />
        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <div className="rounded-2xl border border-borda p-5">
            <Skeleton className="h-5 w-40 mb-4" />
            <div className="grid gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-borda p-5">
            <Skeleton className="h-5 w-40 mb-4" />
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full mb-3" />
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout onNavigate={(to) => navigate(to)}>
      <section className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-titulo">Novo Chamado</h1>
          <p className="text-texto/70">Abra um chamado de transporte</p>
        </div>

        {/* Dropdown de Modelos */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setTplOpen((v) => !v)}
            className="rounded-xl border border-borda px-4 py-2 text-texto hover:bg-borda/20"
            aria-haspopup="menu"
            aria-expanded={tplOpen}
          >
            Modelos
          </button>

          {tplOpen && (
            <div className="absolute right-0 z-20 mt-2 w-80 overflow-hidden rounded-xl border border-borda bg-fundo shadow-xl">
              <div className="p-3 border-b border-borda flex items-center justify-between">
                <span className="text-sm text-texto/70">Seus modelos</span>
                <button
                  type="button"
                  onClick={openCreateTemplateModal}
                  className="text-xs rounded-lg border border-azul-claro/30 px-2 py-1 text-azul-claro hover:bg-azul-claro/10 disabled:opacity-60"
                  disabled={modalOpen || modalLoading}
                >
                  Salvar atual
                </button>
              </div>

              <div className="max-h-80 overflow-auto p-2">
                <button
                  type="button"
                  className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-sm hover:bg-borda/20"
                  onClick={() => { setActiveTemplateId(null); applyTemplate({ data: { form: defaultForm(), origin: defaultOrigin(), destination: defaultDestination(), route: "", assignedList: [] } }); setTplOpen(false); }}
                >
                  <span>Padrão (vazio)</span>
                </button>

                {tplLoading && (
                  <div className="px-2 py-2 text-sm text-texto/70">Carregando...</div>
                )}
                {tplError && (
                  <div className="px-2 py-2 text-sm text-red-400">{tplError}</div>
                )}
                {!tplLoading && !tplError && templates.length === 0 && (
                  <div className="px-2 py-2 text-sm text-texto/60">Nenhum modelo salvo ainda.</div>
                )}

                {templates.map((tpl) => (
                  <div key={tpl.id} className={`group rounded-lg px-2 py-2 ${activeTemplateId === tpl.id ? 'bg-azul-claro/10' : 'hover:bg-borda/20'}`}>
                    <div className="flex items-center justify-between gap-2">
                      <button
                        type="button"
                        className="truncate text-left text-sm text-texto"
                        onClick={() => { applyTemplate(tpl); setTplOpen(false); }}
                        title="Aplicar modelo"
                      >
                        {tpl.name}
                      </button>
                      <div className="flex items-center gap-1 opacity-100">
                        <button
                          type="button"
                          className="rounded-md px-2 py-1 text-xs text-texto/80 hover:bg-borda/30 disabled:opacity-60"
                          onClick={() => handleUpdateWithCurrent(tpl)}
                          disabled={busyTplIds.has(tpl.id)}
                          title="Atualizar com o formulário atual"
                        >
                          {busyTplIds.has(tpl.id) ? 'Atualizando...' : 'Atualizar'}
                        </button>
                        <button
                          type="button"
                          className="rounded-md px-2 py-1 text-xs text-texto/80 hover:bg-borda/30 disabled:opacity-60"
                          onClick={() => openRenameTemplateModal(tpl)}
                          disabled={busyTplIds.has(tpl.id)}
                          title="Renomear modelo"
                        >
                          Renomear
                        </button>
                        <button
                          type="button"
                          className="rounded-md px-2 py-1 text-xs text-red-400 hover:bg-red-500/10 disabled:opacity-60"
                          onClick={() => openDeleteTemplateModal(tpl)}
                          disabled={busyTplIds.has(tpl.id)}
                          title="Excluir modelo"
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1.6fr_1fr] relative">
        {loading && (
          <div className="absolute inset-0 z-10 rounded-2xl bg-black/40 backdrop-blur-sm grid place-items-center">
            <div className="flex items-center gap-3 text-texto">
              <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-azul-claro" />
              Salvando...
            </div>
          </div>
        )}
        {/* ESQUERDA — TRANSPORTE */}
        <section className="rounded-2xl border border-borda p-5">
          <h2 className="mb-4 text-lg font-medium text-titulo">Transporte</h2>

          <div className="grid gap-4">
            <div>
              <label className="mb-1 block text-sm text-texto/80">Título</label>
              <input
                className="w-full rounded-xl border border-borda bg-transparent px-3 py-2 text-texto focus:outline-none focus:ring-2 focus:ring-azul-claro/30"
                value={form.title}
                onChange={setv("title")}
                required
              />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <CityUFInput label="Origem (Cidade/UF)" value={origin} onChange={setOrigin} defaultUF="SC" />
              <CityUFInput label="Destino (Cidade/UF)" value={destination} onChange={setDestination} defaultUF="SC" />
            </div>

            {/* Seletor de Rota por Estados */}
            <div>
              <RouteSelector 
                value={route} 
                onChange={setRoute}
                startUF={origin?.uf}
                endUF={destination?.uf}
              />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm text-texto/80">Tipo de Frete</label>
                <div className="flex gap-3">
                  <label className="inline-flex items-center gap-2 text-sm">
                    <input type="radio" name="freightBasis" value="FULL" checked={form.freightBasis === "FULL"} onChange={setv("freightBasis")} />
                    Frete Cheio
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm">
                    <input type="radio" name="freightBasis" value="TON" checked={form.freightBasis === "TON"} onChange={setv("freightBasis")} />
                    Frete Tonelada
                  </label>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm text-texto/80">Modalidade (CIF/FOB)</label>
                <div className="flex gap-3">
                  <label className="inline-flex items-center gap-2 text-sm">
                    <input type="radio" name="incoterm" value="CIF" checked={form.incoterm === "CIF"} onChange={setv("incoterm")} />
                    CIF
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm">
                    <input type="radio" name="incoterm" value="FOB" checked={form.incoterm === "FOB"} onChange={setv("incoterm")} />
                    FOB
                  </label>
                </div>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm text-texto/80">Valor do frete</label>
                <input
                  type="text"
                  inputMode="numeric"
                  className="w-full rounded-xl border border-borda bg-transparent px-3 py-2 text-texto"
                  placeholder="R$ 0,00"
                  value={freightValueDisplay}
                  onChange={onChangeFreightValue}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-texto/80">Prazo para pagamento</label>
                <input
                  className="w-full rounded-xl border border-borda bg-transparent px-3 py-2 text-texto"
                  placeholder="ex.: à vista, 15 dias, 30 dias"
                  value={form.paymentTerm}
                  onChange={setv("paymentTerm")}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-texto/80">Tipo de pagamento</label>
                <input
                  className="w-full rounded-xl border border-borda bg-transparent px-3 py-2 text-texto"
                  placeholder="ex.: PIX, Boleto, TED"
                  value={form.paymentType}
                  onChange={setv("paymentType")}
                />
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm text-texto/80">Peso da carga</label>
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  className="w-full rounded-xl border border-borda bg-transparent px-3 py-2 text-texto"
                  placeholder="ex.: 28.500"
                  value={form.cargoWeight}
                  onChange={setv("cargoWeight")}
                />
              </div>
              <div>
                <CompanySelect
                  label="Empresa de faturamento"
                  value={form.billingCompany}
                  onChange={(val) => setForm((f) => ({ ...f, billingCompany: val }))}
                  placeholder="Selecione a empresa"
                />
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm text-texto/80">Placa (Cavalo)</label>
                <input className="w-full rounded-xl border border-borda bg-transparent px-3 py-2 text-texto" value={form.plateCavalo} onChange={setv("plateCavalo")} />
              </div>
              <div>
                <label className="mb-1 block text-sm text-texto/80">Placa (1ª carreta)</label>
                <input className="w-full rounded-xl border border-borda bg-transparent px-3 py-2 text-texto" value={form.plateCarreta1} onChange={setv("plateCarreta1")} />
              </div>
              <div>
                <label className="mb-1 block text-sm text-texto/80">Placa (2ª carreta / Dolly)</label>
                <input className="w-full rounded-xl border border-borda bg-transparent px-3 py-2 text-texto" value={form.plateCarreta2} onChange={setv("plateCarreta2")} />
              </div>
              <div>
                <label className="mb-1 block text-sm text-texto/80">Placa (3ª carreta)</label>
                <input className="w-full rounded-xl border border-borda bg-transparent px-3 py-2 text-texto" value={form.plateCarreta3} onChange={setv("plateCarreta3")} />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm text-texto/80">Propriedade do veículo</label>
              <div className="flex gap-3">
                <label className="inline-flex items-center gap-2 text-sm">
                  <input type="radio" name="fleetType" value="FROTA" checked={form.fleetType === "FROTA"} onChange={setv("fleetType")} />
                  Frota
                </label>
                <label className="inline-flex items-center gap-2 text-sm">
                  <input type="radio" name="fleetType" value="TERCEIRO" checked={form.fleetType === "TERCEIRO"} onChange={setv("fleetType")} />
                  Terceiro
                </label>
              </div>
              {form.fleetType === "TERCEIRO" && (
                <div className="mt-3 space-y-3">
                  <div>
                    <label className="mb-1 block text-sm text-texto/80">Valor de pagamento p/ terceiro</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="w-full rounded-xl border border-borda bg-transparent px-3 py-2 text-texto"
                      placeholder="R$ 0,00"
                      value={thirdPartyPaymentDisplay}
                      onChange={onChangeThirdPartyPayment}
                    />
                  </div>
                  
                  <div>
                    <label className="mb-1 block text-sm text-texto/80">Frete inclui pedágio?</label>
                    <div className="flex flex-wrap gap-3">
                      <label className="inline-flex items-center gap-2 text-sm">
                        <input 
                          type="radio" 
                          name="hasToll" 
                          value="COM_PEDAGIO" 
                          checked={form.hasToll === "COM_PEDAGIO"} 
                          onChange={() => setForm(f => ({ ...f, hasToll: "COM_PEDAGIO" }))} 
                        />
                        Com pedágio
                      </label>
                      <label className="inline-flex items-center gap-2 text-sm">
                        <input 
                          type="radio" 
                          name="hasToll" 
                          value="SEM_PEDAGIO" 
                          checked={form.hasToll === "SEM_PEDAGIO"} 
                          onChange={() => setForm(f => ({ ...f, hasToll: "SEM_PEDAGIO" }))} 
                        />
                        Sem pedágio
                      </label>
                      <label className="inline-flex items-center gap-2 text-sm">
                        <input 
                          type="radio" 
                          name="hasToll" 
                          value="CLIENTE_PAGA_PEDAGIO" 
                          checked={form.hasToll === "CLIENTE_PAGA_PEDAGIO"} 
                          onChange={() => setForm(f => ({ ...f, hasToll: "CLIENTE_PAGA_PEDAGIO" }))} 
                        />
                        Cliente paga pedágio
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm text-texto/80">Tomador de serviço</label>
              <input
                className="w-full rounded-xl border border-borda bg-transparent px-3 py-2 text-texto"
                value={form.serviceTaker}
                onChange={setv("serviceTaker")}
              />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm text-texto/80">Representante do CTE</label>
                <input
                  className="w-full rounded-xl border border-borda bg-transparent px-3 py-2 text-texto"
                  placeholder="Nome do representante"
                  value={form.cteRepresentative}
                  onChange={setv("cteRepresentative")}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-texto/80">Representante do manifesto</label>
                <input
                  className="w-full rounded-xl border border-borda bg-transparent px-3 py-2 text-texto"
                  placeholder="Nome do representante"
                  value={form.manifestRepresentative}
                  onChange={setv("manifestRepresentative")}
                />
              </div>
            </div>
          </div>
        </section>

        {/* DIREITA — OPERACIONAL */}
        <section className="rounded-2xl border border-borda p-5">
          <h2 className="mb-4 text-lg font-medium text-titulo">Operacional</h2>

          <div className="grid gap-4">
            <div>
              <label className="mb-1 block text-sm text-texto/80">Status</label>
              <select
                className="w-full rounded-xl border border-borda bg-transparent px-3 py-2 text-texto"
                value={form.status}
                onChange={setv("status")}
              >
                <option value="OPEN">Aberto</option>
                <option value="IN_PROGRESS">Em Andamento</option>
                <option value="RESOLVED">Resolvido</option>
                <option value="CLOSED">Fechado</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm text-texto/80">Prioridade</label>
              <select
                className="w-full rounded-xl border border-borda bg-transparent px-3 py-2 text-texto"
                value={form.priority}
                onChange={setv("priority")}
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
                rows={8}
                className="w-full rounded-xl border border-borda bg-transparent px-3 py-2 text-texto"
                value={form.description}
                onChange={setv("description")}
                required
              />
            </div>

            {user && (
              <div className="space-y-3">
                <MultiUserSelect
                  label="Atribuir para"
                  value={assignedList}
                  onChange={setAssignedList}
                />
              </div>
            )}

            <div className="flex gap-2">
              <Button type="submit" loading={loading}>Criar</Button>
              <button type="button" className="rounded-xl border border-borda px-4 py-2 text-texto" onClick={() => navigate(-1)}>
                Cancelar
              </button>
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-red-300 text-sm">
                {error}
              </div>
            )}
          </div>
        </section>
      </form>

      {/* Modal simples para criar/renomear modelo */}
      {modalOpen && (
        <div className="fixed inset-0 z-30 grid place-items-center bg-black/50 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-2xl border border-borda bg-fundo p-4 shadow-2xl">
            {modalType !== 'delete' ? (
              <>
                <h3 className="mb-3 text-lg font-medium text-titulo">
                  {modalType === 'create' ? 'Salvar modelo' : 'Renomear modelo'}
                </h3>
                <label className="mb-1 block text-sm text-texto/80">Nome do modelo</label>
                <input
                  className="mb-3 w-full rounded-xl border border-borda bg-transparent px-3 py-2 text-texto"
                  value={modalName}
                  onChange={(e) => setModalName(e.target.value)}
                  autoFocus
                />
                {modalError && (
                  <div className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 p-2 text-sm text-red-300">{modalError}</div>
                )}
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    className="rounded-xl border border-borda px-4 py-2 text-texto"
                    onClick={() => setModalOpen(false)}
                  >
                    Cancelar
                  </button>
                  <Button type="button" onClick={handleModalConfirm} disabled={modalLoading}>
                    Salvar
                  </Button>
                </div>
              </>
            ) : (
              <>
                <h3 className="mb-3 text-lg font-medium text-titulo">Excluir modelo</h3>
                <p className="mb-4 text-sm text-texto/80">
                  Tem certeza que deseja excluir o modelo <span className="font-medium text-texto">"{editingTemplate?.name}"</span>?
                  Esta ação não pode ser desfeita.
                </p>
                {modalError && (
                  <div className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 p-2 text-sm text-red-300">{modalError}</div>
                )}
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    className="rounded-xl border border-borda px-4 py-2 text-texto"
                    onClick={() => setModalOpen(false)}
                    disabled={modalLoading}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-red-300 hover:bg-red-500/20 disabled:opacity-60"
                    onClick={performDeleteTemplate}
                    disabled={modalLoading}
                  >
                    {modalLoading ? 'Excluindo...' : 'Excluir'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </AppLayout>
  );
}

// Valores padrão para reset rápido via menu "Padrão (vazio)"
function defaultForm() {
  return {
    title: "",
    description: "",
    status: "OPEN",
    priority: "MEDIUM",
    freightBasis: "FULL",
    incoterm: "CIF",
    paymentTerm: "",
    paymentType: "",
    cargoWeight: "",
    billingCompany: "",
    plateCavalo: "",
    plateCarreta1: "",
    plateCarreta2: "",
    plateCarreta3: "",
    fleetType: "FROTA",
    thirdPartyPayment: "",
    serviceTaker: "",
    hasToll: "COM_PEDAGIO",
    cteRepresentative: "",
    manifestRepresentative: "",
  };
}

function defaultOrigin() { return { city: "", uf: "SC", ibgeId: undefined }; }
function defaultDestination() { return { city: "", uf: "SC", ibgeId: undefined }; }
