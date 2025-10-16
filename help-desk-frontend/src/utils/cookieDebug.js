// Função para debug de cookies específica para iOS
export const debugCookies = () => {
  const cookies = document.cookie.split(';').reduce((acc, cookie) => {
    const [name, value] = cookie.trim().split('=');
    if (name && value) acc[name] = value;
    return acc;
  }, {});
  
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
               (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  
  console.log('🍪 Cookie Debug:', {
    device: isIOS ? 'iOS' : 'Other',
    cookieCount: Object.keys(cookies).length,
    cookies: cookies,
    hasAccessToken: !!cookies.access_token,
    hasRefreshToken: !!cookies.refresh_token,
    userAgent: navigator.userAgent,
    cookieString: document.cookie
  });
  
  return cookies;
};