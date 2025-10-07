import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createTicket } from "../api/tickets";
import AppLayout from "../components/AppLayout";
import RouteSelector from "../components/RouteSelector";
import Button from "../components/Button";
import CityUFInput from "../components/CityUFInput";
import CompanySelect from "../components/CompanySelect";
import UserSelect from "../components/UserSelect";
import { useAuth } from "../context/AuthContext.jsx";
import { usePageTitle } from "../hooks/usePageTitle";
import { PageHeaderSkeleton, Skeleton } from "../components/Skeletons";

export default function TicketNew() {
  usePageTitle('Novo Ticket');
  const navigate = useNavigate();
  const { user, initializing } = useAuth();

  const [origin, setOrigin] = useState({ city: "", uf: "SC", ibgeId: undefined });
  const [destination, setDestination] = useState({ city: "", uf: "SC", ibgeId: undefined });
  const [assignedUser, setAssignedUser] = useState({ id: null, username: "", role: "" });
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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const setv = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

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

        assignedToId: assignedUser.id || undefined,
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
      <section className="mb-6">
        <h1 className="text-2xl font-semibold text-titulo">Novo Chamado</h1>
        <p className="text-texto/70">Abra um chamado de transporte</p>
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
                <p className="mt-1 text-xs text-texto/60">Use o mesmo padrão do banco (ex.: toneladas).</p>
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
                      type="number"
                      step="0.01"
                      min="0"
                      className="w-full rounded-xl border border-borda bg-transparent px-3 py-2 text-texto"
                      value={form.thirdPartyPayment}
                      onChange={setv("thirdPartyPayment")}
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

            {user?.role === "ADMIN" && (
              <UserSelect
                label="Atribuir para"
                value={assignedUser}
                onChange={setAssignedUser}
                placeholder="Selecione um usuário (opcional)"
              />
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
    </AppLayout>
  );
}
