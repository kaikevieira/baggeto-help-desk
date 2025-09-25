import React, { useMemo } from "react";
import AppLayout from "../components/AppLayout";
import StatCard from "../components/StatCard";
import TicketsTable from "../components/TicketsTable";


export default function Dashboard() {
    // Dados mockados — substitua por requisições reais
    const tickets = useMemo(() => ([
        { id: 1024, title: "Erro ao acessar WTS", client: "Financeiro", priority: "alta", status: "aberto", sla: "8h", updatedAt: "há 12 min" },
        { id: 1023, title: "Impressora sem comunicação", client: "Faturamento", priority: "media", status: "andamento", sla: "12h", updatedAt: "há 35 min" },
        { id: 1022, title: "VPN instável FG-40F", client: "Diretoria", priority: "critica", status: "aguardando", sla: "4h", updatedAt: "há 1h" },
        { id: 1021, title: "Zabbix alerta disco", client: "TI", priority: "alta", status: "andamento", sla: "6h", updatedAt: "há 2h" },
        { id: 1019, title: "E-mail não sincroniza", client: "Comercial", priority: "baixa", status: "resolvido", sla: "24h", updatedAt: "hoje" },
    ]), []);


    const stats = useMemo(() => ({
        abertos: tickets.filter(t => t.status === "aberto").length,
        andamento: tickets.filter(t => t.status === "andamento").length,
        aguardando: tickets.filter(t => t.status === "aguardando").length,
        resolvidosHoje: tickets.filter(t => t.status === "resolvido").length,
    }), [tickets]);


    return (
        <AppLayout current="dashboard" onNavigate={path => console.log("navigate:", path)}>
            {/* Topbar */}
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-titulo">Dashboard</h1>
                    <p className="text-sm text-texto">Visão geral dos chamados e SLAs</p>
                </div>
                <div className="flex items-center gap-2">
                    <input
                        type="search"
                        placeholder="Buscar chamados..."
                        className="w-64 rounded-xl border border-borda bg-[#101010] px-3 py-2 text-sm text-titulo placeholder:text-texto/60 focus:border-azul-claro focus:outline-none focus:ring-2 focus:ring-azul-claro/20"
                    />
                    <button className="rounded-xl border border-borda px-3 py-2 text-sm text-texto hover:bg-white/5">Filtrar</button>
                    <button className="rounded-xl bg-azul-escuro px-3 py-2 text-sm text-white hover:bg-azul-claro">Novo</button>
                </div>
            </div>


            {/* Cards de métrica */}
            <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Abertos" value={stats.abertos} trend={6} hint="últimas 24h" />
                <StatCard title="Em andamento" value={stats.andamento} trend={-3} hint="vs. ontem" />
                <StatCard title="Aguardando" value={stats.aguardando} trend={2} hint="pendências do cliente" />
                <StatCard title="Resolvidos (hoje)" value={stats.resolvidosHoje} trend={8} hint="taxa de resolução" />
            </section>


            {/* Seção Chamados recentes */}
            <section className="grid gap-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-titulo">Chamados recentes</h2>
                    <div className="flex items-center gap-2 text-sm">
                        <span className="rounded-lg border border-borda px-2 py-1">Todos</span>
                        <span className="rounded-lg border border-borda px-2 py-1">Meus</span>
                        <span className="rounded-lg border border-borda px-2 py-1">Equipe</span>
                    </div>
                </div>
                <TicketsTable tickets={tickets} />
            </section>
        </AppLayout>
    );
}