import React from "react";
import { StatusPill, PriorityPill } from "./StatusPill";


export default function TicketsTable({ tickets = [] }) {
    return (
        <div className="overflow-hidden rounded-2xl border border-borda">
            <table className="min-w-full divide-y divide-borda/70">
                <thead className="bg-[#151515] text-xs uppercase tracking-wide text-texto">
                    <tr>
                        <th className="px-4 py-3 text-left">#</th>
                        <th className="px-4 py-3 text-left">Título</th>
                        <th className="px-4 py-3 text-left">Cliente</th>
                        <th className="px-4 py-3 text-left">Prioridade</th>
                        <th className="px-4 py-3 text-left">Status</th>
                        <th className="px-4 py-3 text-left">SLA</th>
                        <th className="px-4 py-3 text-left">Atualizado</th>
                        <th className="px-4 py-3" />
                    </tr>
                </thead>
                <tbody className="divide-y divide-borda/70 bg-[#121212] text-sm">
                    {tickets.map((t) => (
                        <tr key={t.id} className="hover:bg-white/5">
                            <td className="px-4 py-3 text-texto/80">{t.id}</td>
                            <td className="px-4 py-3 text-titulo">{t.title}</td>
                            <td className="px-4 py-3 text-texto">{t.client}</td>
                            <td className="px-4 py-3"><PriorityPill priority={t.priority} /></td>
                            <td className="px-4 py-3"><StatusPill status={t.status} /></td>
                            <td className="px-4 py-3 text-texto/80">{t.sla}</td>
                            <td className="px-4 py-3 text-texto/70">{t.updatedAt}</td>
                            <td className="px-4 py-3">
                                <button className="rounded-lg border border-borda px-3 py-1 text-xs text-texto hover:bg-white/5">Ver</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}