import React from "react";
import { StatusPill, PriorityPill } from "./StatusPill";

export default function TicketsTable({ tickets = [], onView }) {
  return (
    <>
      {/* Tabela Desktop */}
      <div className="hidden lg:block overflow-hidden rounded-2xl border border-borda" style={{ backgroundColor: 'var(--color-surface)' }}>
        <table className="min-w-full divide-y divide-borda/70">
          <thead className="text-xs uppercase tracking-wide text-texto" style={{ backgroundColor: 'var(--color-surface)' }}>
            <tr>
              <th className="px-4 py-3 text-left">Nº Chamado</th>
              <th className="px-4 py-3 text-left">Título</th>
              <th className="px-4 py-3 text-left">Atribuído para</th>
              <th className="px-4 py-3 text-left">Prioridade</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Atualizado</th>
              <th className="px-2 py-3 text-center w-[80px]">Ações</th>
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
                          {u.fullName || u.username}
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
                <td className="px-2 py-2 text-center">
                  <button
                    className="inline-flex items-center gap-1 rounded-md bg-azul-escuro/15 hover:bg-azul-escuro/25 border border-azul-escuro/40 px-2.5 py-1 text-[11px] text-azul-claro transition-colors"
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

      {/* Cards Mobile/Tablet */}
      <div className="lg:hidden space-y-4">
        {tickets.map((t) => (
          <div 
            key={t.id} 
            className="rounded-2xl border border-borda p-4 transition-all duration-200 hover:shadow-md hover:border-azul-claro/30" 
            style={{ backgroundColor: 'var(--color-surface)' }}
          >
            {/* Header do Card */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-texto font-mono text-sm bg-azul-claro/10 px-2 py-1 rounded-md border border-azul-claro/30">
                    #{t.ticketNumber || t.id}
                  </span>
                  <div className="flex gap-2">
                    <PriorityPill priority={t.priority} />
                    <StatusPill status={t.status} />
                  </div>
                </div>
                <h3 className="text-titulo font-medium text-base leading-tight">
                  {t.title}
                </h3>
              </div>
              <button
                className="ml-3 inline-flex items-center gap-1 rounded-lg bg-azul-escuro/15 hover:bg-azul-escuro/25 border border-azul-escuro/40 px-3 py-2 text-xs text-azul-claro transition-colors"
                onClick={() => onView && onView(t.id)}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Ver
              </button>
            </div>

            {/* Informações do Card */}
            <div className="space-y-2">
              {/* Atribuído para */}
              <div className="flex items-start gap-2">
                <span className="text-texto/60 text-xs font-medium min-w-[80px]">Atribuído:</span>
                <div className="flex-1">
                  {Array.isArray(t.assignees) && t.assignees.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {t.assignees.map((u) => (
                        <span key={u.id} className="px-2 py-0.5 text-xs rounded-md bg-azul-claro/20 text-azul-claro border border-azul-claro/30">
                          {u.fullName || u.username}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-texto/50 text-xs">Não atribuído</span>
                  )}
                </div>
              </div>

              {/* Data de atualização */}
              <div className="flex items-center gap-2">
                <span className="text-texto/60 text-xs font-medium min-w-[80px]">Atualizado:</span>
                <span className="text-texto/70 text-xs">{t.updatedAt}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
