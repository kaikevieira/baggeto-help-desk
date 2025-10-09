import React from "react";
import { StatusPill, PriorityPill } from "./StatusPill";

export default function TicketsTable({ tickets = [], onView }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-borda" style={{ backgroundColor: 'var(--color-surface)' }}>
      <table className="min-w-full divide-y divide-borda/70">
        <thead className="text-xs uppercase tracking-wide text-texto" style={{ backgroundColor: 'var(--color-surface)' }}>
          <tr>
            <th className="px-4 py-3 text-left">Nº Chamado</th>
            <th className="px-4 py-3 text-left">Título</th>
            <th className="px-4 py-3 text-left">Atribuído para</th>
            <th className="px-4 py-3 text-left">Prioridade</th>
            <th className="px-4 py-3 text-left">Status</th>
            <th className="px-4 py-3 text-left">Atualizado</th>
            <th className="px-4 py-3 text-center">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-borda/60">
          {tickets.map((t) => (
            <tr key={t.id} className="hover:bg-azul-claro/5">
              <td className="px-4 py-3 text-texto font-mono text-sm">
                #{t.ticketNumber || t.id}
              </td>
              <td className="px-4 py-3 text-texto font-medium">{t.title}</td>
              <td className="px-4 py-3 text-texto">
                {Array.isArray(t.assignees) && t.assignees.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {t.assignees.map((u) => (
                      <span key={u.id} className="px-2 py-0.5 text-xs rounded-md bg-azul-claro/20 text-azul-claro border border-azul-claro/30">
                        {u.username}
                      </span>
                    ))}
                  </div>
                ) : (
                  '-'
                )}
              </td>
              <td className="px-4 py-3">
                <PriorityPill priority={t.priority} />
              </td>
              <td className="px-4 py-3">
                <StatusPill status={t.status} />
              </td>
              <td className="px-4 py-3 text-texto/70 text-sm">{t.updatedAt}</td>
              <td className="px-4 py-3 text-center">
                <button
                  className="inline-flex items-center gap-1 rounded-lg bg-azul-escuro/20 hover:bg-azul-escuro/30 border border-azul-escuro/40 px-3 py-1.5 text-xs text-azul-claro transition-colors"
                  onClick={() => onView && onView(t.id)}
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Ver
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
