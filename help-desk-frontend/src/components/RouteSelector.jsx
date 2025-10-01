import { useEffect, useState } from 'react';
import BrazilSVGRouteMap from './BrasilSVGRouteMap';

export default function RouteSelector({ value = "", onChange }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempRoute, setTempRoute] = useState(value);

  const openModal = () => {
    setTempRoute(value);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTempRoute(value); // Reverte para o valor original
  };

  const confirmRoute = () => {
    onChange(tempRoute);
    setIsModalOpen(false);
  };

  // Bloqueia scroll da página quando a modal está aberta + ESC para fechar
  useEffect(() => {
    if (isModalOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      const onEsc = (e) => {
        if (e.key === 'Escape') closeModal();
      };
      document.addEventListener('keydown', onEsc);

      return () => {
        document.body.style.overflow = prev || '';
        document.removeEventListener('keydown', onEsc);
      };
    }

    // restaura ao fechar
    return () => {
      document.body.style.overflow = '';
    };
  }, [isModalOpen]);

  const clearRoute = () => {
    setTempRoute("");
  };

  return (
    <>
      {/* Campo compacto com botão */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-titulo mb-1">
          Rota por Estados
        </label>
        
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={openModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-borda bg-transparent text-texto hover:bg-slate-600/30 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            Definir rota
          </button>
          
          {value && (
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 rounded-lg bg-azul-claro/20 border border-azul-claro/30">
                <span className="text-azul-claro font-mono text-sm">{value}</span>
              </div>
              <button
                type="button"
                onClick={() => onChange("")}
                className="p-1 text-red-400 hover:text-red-300 transition-colors"
                title="Limpar rota"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </div>
        
        {!value && (
          <p className="text-xs text-texto/60">
            Clique em "Definir rota" para selecionar os estados da viagem
          </p>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeModal}
          />
          
          {/* Modal Content - Responsivo */}
          <div className="relative bg-fundo border border-borda rounded-2xl shadow-2xl w-full h-full max-w-2xl max-h-[95vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-borda">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-titulo">Definir Rota de Transporte</h2>
                <p className="text-xs sm:text-sm text-texto/70 mt-1">
                  Selecione os estados na ordem que a carga irá passar
                </p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 text-texto/60 hover:text-texto hover:bg-slate-600/30 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Rota atual no topo da modal */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 bg-azul-claro/10 border-b border-borda">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <span className="text-sm text-titulo font-medium">Rota selecionada:</span>
                  <div className="text-azul-claro font-mono text-base sm:text-lg mt-1 break-all">
                    {tempRoute || "Nenhuma rota selecionada"}
                  </div>
                </div>
                {tempRoute && (
                  <button
                    onClick={clearRoute}
                    className="px-3 py-1 text-sm text-red-400 hover:text-red-300 border border-red-400/30 rounded-lg transition-colors self-start sm:self-auto"
                  >
                    Limpar
                  </button>
                )}
              </div>
            </div>

            {/* Mapa - ocupa espaço disponível sem ser cortado */}
            <div className="flex-1 min-h-[320px] max-h-[60vh] p-3 sm:p-4">
              <div className="w-full h-full flex items-center justify-center">
                  <BrazilSVGRouteMap 
                    value={tempRoute} 
                    onChange={setTempRoute}
                    height="clamp(320px, 58vh, 540px)"
                    maxWidth="980px"
                  />
              </div>
            </div>

            {/* Footer com botões */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 p-4 sm:p-6 border-t border-borda bg-fundo/50">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-texto border border-borda rounded-xl hover:bg-slate-600/30 transition-colors order-2 sm:order-1"
              >
                Cancelar
              </button>
              <button
                onClick={confirmRoute}
                className="px-4 py-2 bg-azul-claro text-white rounded-xl hover:bg-azul-claro/80 transition-colors font-medium order-1 sm:order-2"
              >
                Confirmar Rota
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}