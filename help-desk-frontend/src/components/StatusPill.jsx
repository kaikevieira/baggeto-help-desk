export function StatusPill({ status }) {
    const map = {
        // Valores em português (legado)
        aberto: "bg-red-500/15 text-red-400",
        andamento: "bg-amber-500/15 text-amber-400",
        aguardando: "bg-sky-500/15 text-sky-400",
        resolvido: "bg-emerald-500/15 text-emerald-400",
        // Valores em inglês (novos)
        OPEN: "bg-red-500/15 text-red-400",
        IN_PROGRESS: "bg-amber-500/15 text-amber-400",
        RESOLVED: "bg-emerald-500/15 text-emerald-400",
        CLOSED: "bg-gray-500/15 text-gray-400",
    };

    const displayText = {
        OPEN: "Aberto",
        IN_PROGRESS: "Em Andamento",
        RESOLVED: "Resolvido",
        CLOSED: "Fechado",
        // Fallback para valores em português
        aberto: "Aberto",
        andamento: "Em Andamento",
        aguardando: "Aguardando",
        resolvido: "Resolvido",
    };

    return (
        <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs ${map[status] || "bg-white/10 text-texto"}`}>
            <span className="h-2 w-2 rounded-full bg-current" />
            {displayText[status] || status?.charAt(0)?.toUpperCase() + status?.slice(1)}
        </span>
    );
}


export function PriorityPill({ priority }) {
    const map = {
        baixa: "border border-borda text-texto",
        media: "bg-azul-escuro/20 text-azul-claro border border-azul-escuro/40",
        alta: "bg-red-500/15 text-red-400",
        critica: "bg-red-600/20 text-red-300",
    };
    return (
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs ${map[priority] || ""}`}>{priority.toUpperCase()}</span>
    );
}

// Export default para compatibilidade
export default StatusPill;