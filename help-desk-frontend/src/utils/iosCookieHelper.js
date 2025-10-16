// Utilitário específico para forçar cookies no iOS Safari
export const forceIOSCookies = async () => {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
               (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
               
  if (!isIOS) return;
  
  try {
    // Força uma requisição simples para estabelecer cookies
    const response = await fetch(`${window.location.origin}/`, {
      method: 'HEAD',
      credentials: 'include',
      cache: 'no-cache'
    });
    
    console.log('🍪 iOS: Forced cookie establishment');
  } catch (error) {
    console.warn('🍪 iOS: Failed to force cookies:', error);
  }
};

// Função para verificar se cookies estão funcionando no iOS
export const testIOSCookies = () => {
  const testCookieName = 'ios_test_cookie';
  const testValue = 'test_' + Date.now();
  
  // Define um cookie de teste
  document.cookie = `${testCookieName}=${testValue}; path=/; SameSite=Strict`;
  
  // Verifica se o cookie foi salvo
  const saved = document.cookie.includes(`${testCookieName}=${testValue}`);
  
  console.log('🧪 iOS Cookie Test:', { saved, testValue });
  
  // Limpa o cookie de teste
  document.cookie = `${testCookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  
  return saved;
};