import { useEffect, useState, useMemo } from "react";
import AppLayout from "../components/AppLayout";
import StatCard from "../components/StatCard";
import TicketsTable from "../components/TicketsTable";
import { summary as apiSummary } from "../api/dashboard";
import { listTickets } from "../api/tickets";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

const statusMap = { OPEN: "aberto", IN_PROGRESS: "andamento", RESOLVED: "resolvido", CLOSED: "resolvido" };
const priorityMap = { LOW: "baixa", MEDIUM: "media", HIGH: "alta", URGENT: "critica" };

export default function Dashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [stats, setStats] = useState({ total: 0, byStatus: { OPEN: 0, IN_PROGRESS: 0, RESOLVED: 0, CLOSED: 0 } });
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const s = await apiSummary();
        setStats(s);
        const list = await listTickets({ page: 1, pageSize: 8 });
        const items = (list.items || []).map((t) => ({
          id: t.id,
          title: t.title,
          client: t.createdBy?.username || "-",
          priority: priorityMap[t.priority] || "media",
          status: statusMap[t.status] || "aberto",
          sla: "-",
          updatedAt: new Date(t.updatedAt).toLocaleString(),
        }));
        setRows(items);
      } catch (e) {
        console.error(e);
        if (e.status === 401) {
          await logout();
          navigate("/login", { replace: true });
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []); // eslint-disable-line

  return (
    <AppLayout current="/dashboard" onNavigate={(to) => navigate(to)} onLogout={logout}>
      <section className="mb-6">
        <h1 className="text-2xl font-semibold text-titulo">Dashboard</h1>
        <p className="text-texto/70">Visão geral dos chamados</p>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Chamados Totais" value={stats.total} trend={0} />
        <StatCard title="Abertos" value={stats.byStatus.OPEN || 0} trend={0} />
        <StatCard title="Em Andamento" value={stats.byStatus.IN_PROGRESS || 0} trend={0} />
        <StatCard title="Resolvidos" value={(stats.byStatus.RESOLVED || 0) + (stats.byStatus.CLOSED || 0)} trend={0} />
      </section>

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-medium text-titulo">Últimos chamados</h2>
        </div>
        {loading ? (
          <div className="rounded-2xl border border-borda p-6 text-texto/70">Carregando...</div>
        ) : (
          <TicketsTable tickets={rows} onView={(id) => navigate(`/tickets/${id}`)} />
        )}
      </section>
    </AppLayout>
  );
}
