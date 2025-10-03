import { useEffect, useMemo, useState } from "react";
import AppLayout from "../components/AppLayout";
import TicketsTable from "../components/TicketsTable";
import Button from "../components/Button";
import { listTickets } from "../api/tickets";
import { useNavigate } from "react-router-dom";
import { usePageTitle } from "../hooks/usePageTitle";
import { PageHeaderSkeleton, SkeletonTable } from "../components/Skeletons";

const statusFilterToApi = {
  Todos: undefined,
  Abertos: "OPEN",
  "Em Andamento": "IN_PROGRESS",
  Resolvidos: "RESOLVED",
};
const statusLabels = Object.keys(statusFilterToApi);

export default function Tickets() {
  usePageTitle('Tickets');
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [tab, setTab] = useState("Todos");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [data, setData] = useState({ items: [], count: 0, pages: 1 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await listTickets({
          page,
          pageSize,
          status: statusFilterToApi[tab],
          q,
        });
        setData(res);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [q, tab, page, pageSize]);

  const rows = useMemo(() => {
    const statusMap = {
      OPEN: "aberto",
      IN_PROGRESS: "andamento",
      RESOLVED: "resolvido",
      CLOSED: "resolvido",
    };
    const priorityMap = {
      LOW: "baixa",
      MEDIUM: "media",
      HIGH: "alta",
      URGENT: "critica",
    };
    return (data.items || []).map((t) => ({
      id: t.id,
      ticketNumber: t.ticketNumber,
      title: t.title,
      assignedTo: t.assignedTo?.username || '-',
      priority: priorityMap[t.priority] || "media",
      status: statusMap[t.status] || "aberto",
      updatedAt: new Date(t.updatedAt).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
    }));
  }, [data]);

  return (
    <AppLayout current="/tickets" onNavigate={(to) => navigate(to)}>
      <section className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-titulo">Chamados</h1>
          <p className="text-texto/70">Lista de chamados com filtros e paginação</p>
        </div>
        <Button onClick={() => navigate("/tickets/new")} className="">Novo chamado</Button>
      </section>

      <section className="mb-4 grid gap-3 sm:grid-cols-[1fr_auto]">
        <input
          value={q}
          onChange={(e) => {
            setPage(1);
            setQ(e.target.value);
          }}
          placeholder="Buscar por número, título, descrição ou empresa..."
          className="w-full rounded-xl border border-borda bg-transparent px-3 py-2 text-texto placeholder:text-texto/50 focus:outline-none focus:ring-2 focus:ring-azul-claro/30"
        />
        <div className="flex items-center gap-2">
          {statusLabels.map((label) => (
            <button
              key={label}
              onClick={() => {
                setPage(1);
                setTab(label);
              }}
              className={`rounded-xl px-3 py-2 text-sm border ${
                tab === label
                  ? "border-azul-escuro/40 bg-azul-escuro/20 text-titulo"
                  : "border-borda text-texto hover:bg-white/5"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {loading ? (
        <>
          <PageHeaderSkeleton />
          <SkeletonTable rows={8} />
        </>
      ) : (
        <TicketsTable
          tickets={rows}
          onView={(id) => navigate(`/tickets/${id}`)}
        />
      )}

      <section className="mt-4 flex items-center justify-between text-sm text-texto/80">
        <span>Total: {data.count}</span>
        <div className="flex items-center gap-2">
          <button
            className="rounded-lg border border-borda px-3 py-1 disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            Anterior
          </button>
          <span>
            Página {page} de {data.pages || 1}
          </span>
          <button
            className="rounded-lg border border-borda px-3 py-1 disabled:opacity-50"
            onClick={() => setPage((p) => Math.min(data.pages || 1, p + 1))}
            disabled={page >= (data.pages || 1)}
          >
            Próxima
          </button>
        </div>
      </section>
    </AppLayout>
  );
}
