import { verifyAccessToken } from '../utils/jwt.js';

export function requireAuth(req, res, next) {
  const token = req.cookies?.access_token;
  if (!token) return res.status(401).json({ message: 'Não autenticado' });

  try {
    const payload = verifyAccessToken(token);
    req.user = payload; // { sub, username, role }
    next();
  } catch {
    return res.status(401).json({ message: 'Token inválido/expirado' });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Sem permissão' });
    }
    next();
  };
}
