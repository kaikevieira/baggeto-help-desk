import React from "react";

/**
 * Componente responsivo para tabelas que se transforma em cards em dispositivos menores
 * @param {Object} props
 * @param {Array} props.data - Array de dados para renderizar
 * @param {Array} props.columns - Definição das colunas: [{ key, label, render?, className? }]
 * @param {Function} props.renderCard - Função para renderizar cada item como card em mobile
 * @param {String} props.className - Classes CSS adicionais
 * @param {Object} props.style - Estilos inline
 * @param {String} props.emptyMessage - Mensagem quando não há dados
 * @param {Boolean} props.loading - Estado de carregamento
 * @param {Function} props.renderSkeleton - Função para renderizar skeleton em loading
 */
export default function ResponsiveTable({
  data = [],
  columns = [],
  renderCard,
  className = "",
  style = {},
  emptyMessage = "Nenhum item encontrado.",
  loading = false,
  renderSkeleton,
}) {
  const defaultSkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="rounded-2xl border border-borda p-4 animate-pulse" style={{ backgroundColor: 'var(--color-surface)' }}>
          <div className="h-4 bg-borda rounded mb-2"></div>
          <div className="h-3 bg-borda/70 rounded w-2/3 mb-2"></div>
          <div className="flex gap-2">
            <div className="h-6 bg-borda rounded w-16"></div>
            <div className="h-6 bg-borda rounded w-20"></div>
          </div>
        </div>
      ))}
    </div>
  );

  const SkeletonRow = () => (
    <tr>
      {columns.map((col, idx) => (
        <td key={idx} className="px-4 py-3">
          <div className="h-4 bg-borda/50 rounded animate-pulse"></div>
        </td>
      ))}
    </tr>
  );

  return (
    <>
      {/* Tabela Desktop */}
      <div className={`hidden lg:block overflow-hidden rounded-2xl border border-borda ${className}`} style={{ backgroundColor: 'var(--color-surface)', ...style }}>
        <table className="min-w-full divide-y divide-borda/70">
          <thead className="text-xs uppercase tracking-wide text-texto" style={{ backgroundColor: 'var(--color-surface)' }}>
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className={`px-4 py-3 text-left ${col.className || ''}`}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-borda/60">
            {loading ? (
              <>
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-texto/70">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item, idx) => (
                <tr key={item.id || idx} className="hover:bg-azul-claro/5">
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className={`px-4 py-3 ${col.className || ''}`}>
                      {col.render ? col.render(item, idx) : item[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Cards Mobile/Tablet */}
      <div className={`lg:hidden ${className}`}>
        {loading ? (
          renderSkeleton ? renderSkeleton() : defaultSkeleton()
        ) : data.length === 0 ? (
          <div className="rounded-2xl border border-borda p-8 text-center text-texto/70" style={{ backgroundColor: 'var(--color-surface)' }}>
            {emptyMessage}
          </div>
        ) : (
          <div className="space-y-4">
            {data.map((item, idx) => 
              renderCard ? renderCard(item, idx) : (
                <div 
                  key={item.id || idx}
                  className="rounded-2xl border border-borda p-4 transition-all duration-200 hover:shadow-md hover:border-azul-claro/30" 
                  style={{ backgroundColor: 'var(--color-surface)' }}
                >
                  {columns.map((col, colIdx) => (
                    <div key={colIdx} className="mb-2 last:mb-0">
                      <span className="text-texto/60 text-xs font-medium mr-2">{col.label}:</span>
                      <span className="text-texto text-sm">
                        {col.render ? col.render(item, idx) : item[col.key]}
                      </span>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        )}
      </div>
    </>
  );
}

/**
 * Hook para facilitar a criação de colunas de tabela
 * @param {String} key - Chave do campo no objeto de dados
 * @param {String} label - Label da coluna
 * @param {Function} render - Função opcional para renderização customizada
 * @param {String} className - Classes CSS opcionais para a coluna
 */
export function useTableColumn(key, label, render = null, className = "") {
  return { key, label, render, className };
}

/**
 * Componente para criar cards mobile de forma consistente
 */
export function MobileCard({ children, onClick, className = "" }) {
  return (
    <div 
      className={`rounded-2xl border border-borda p-4 transition-all duration-200 hover:shadow-md hover:border-azul-claro/30 ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={{ backgroundColor: 'var(--color-surface)' }}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

/**
 * Componente para campos de informação nos cards mobile
 */
export function CardField({ label, children, className = "" }) {
  return (
    <div className={`flex items-start gap-2 ${className}`}>
      <span className="text-texto/60 text-xs font-medium min-w-[80px]">{label}:</span>
      <div className="flex-1">{children}</div>
    </div>
  );
}