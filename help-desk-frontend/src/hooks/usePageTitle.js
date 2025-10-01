import { useEffect } from 'react';

/**
 * Hook para definir o título da página
 * @param {string} title - O título da página
 * @param {string} baseName - Nome base da aplicação (opcional)
 */
export function usePageTitle(title, baseName = 'Help Desk') {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title ? `${title} - ${baseName}` : baseName;
    
    // Cleanup: restaura título anterior quando componente desmonta
    return () => {
      document.title = previousTitle;
    };
  }, [title, baseName]);
}