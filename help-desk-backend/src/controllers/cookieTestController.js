import { ENV } from '../config/env.js';

export const cookieTestController = {
  test: async (req, res) => {
    const userAgent = req.headers['user-agent'] || '';
    const isIOS = userAgent.includes('iPhone') || userAgent.includes('iPad') || userAgent.includes('iPod');
    const isProd = ENV.NODE_ENV === 'production';
    
    // Define um cookie de teste
    const testCookie = {
      httpOnly: true,
      secure: isProd || ENV.COOKIE_SECURE,
      sameSite: 'lax', // lax para same-domain
      path: '/',
      domain: '.transportesbaggeto.com.br', // Domain compartilhado
      maxAge: 1000 * 60 * 5 // 5 minutos
    };
    
    res.cookie('test_cookie', 'ios_test_value', testCookie);
    
    res.json({
      success: true,
      device: isIOS ? 'iOS' : 'Other',
      cookieConfig: testCookie,
      receivedCookies: req.cookies,
      headers: {
        userAgent,
        origin: req.headers.origin,
        referer: req.headers.referer
      }
    });
  },
  
  verify: async (req, res) => {
    const testCookie = req.cookies?.test_cookie;
    const userAgent = req.headers['user-agent'] || '';
    const isIOS = userAgent.includes('iPhone') || userAgent.includes('iPad') || userAgent.includes('iPod');
    
    res.json({
      success: !!testCookie,
      testCookieValue: testCookie,
      device: isIOS ? 'iOS' : 'Other',
      allCookies: req.cookies,
      cookieCount: Object.keys(req.cookies || {}).length
    });
  }
};