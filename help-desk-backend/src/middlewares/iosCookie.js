// Middleware específico para iOS Safari que força configurações de cookie
export const iosCookieMiddleware = (req, res, next) => {
  const userAgent = req.headers['user-agent'] || '';
  const isIOS = userAgent.includes('iPhone') || userAgent.includes('iPad') || userAgent.includes('iPod');
  
  if (isIOS) {
    // Override do método cookie para iOS
    const originalCookie = res.cookie.bind(res);
    
    res.cookie = function(name, value, options = {}) {
      const iosOptions = {
        ...options,
        httpOnly: true,
        secure: true, // Forçar secure para iOS
        sameSite: 'none', // none é necessário para CORS no iOS
        domain: undefined, // Remove domain
        path: '/'
      };
      
      console.log(`🍪 iOS Cookie Set: ${name}`, iosOptions);
      
      return originalCookie(name, value, iosOptions);
    };
    
    // Adiciona headers específicos para iOS
    res.set({
      'Access-Control-Allow-Credentials': 'true',
      'Vary': 'Origin'
    });
  }
  
  next();
};

export default iosCookieMiddleware;