// Rate limiter simples em memória (adequado para 1 instância)
// Para produção horizontal, mover para Redis.

const WINDOW_MS = 60 * 1000; // 1 min
const LIMIT_GENERAL = 120; // por janela
const LIMIT_MUTATING = 30; // POST/PUT/PATCH/DELETE

const MUTATING = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

const buckets = new Map(); // key -> { count, resetAt }

function bucketFor(key) {
  const now = Date.now();
  let b = buckets.get(key);
  if (!b || b.resetAt <= now) {
    b = { count: 0, resetAt: now + WINDOW_MS };
    buckets.set(key, b);
  }
  return b;
}

export function rateLimitMiddleware(req, res, next) {
  // Exclui SSE de notificações para não bloquear stream
  if (req.path.startsWith('/notifications/stream')) return next();

  const id = req.user?.sub ? `user:${req.user.sub}` : (req.ip ? `ip:${req.ip}` : 'anon');
  const mutating = MUTATING.has(req.method);
  const limit = mutating ? LIMIT_MUTATING : LIMIT_GENERAL;

  const b = bucketFor(id);
  b.count += 1;
  const remaining = Math.max(0, limit - b.count);

  res.setHeader('X-RateLimit-Limit', String(limit));
  res.setHeader('X-RateLimit-Remaining', String(Math.max(0, remaining)));
  res.setHeader('X-RateLimit-Reset', String(Math.ceil(b.resetAt / 1000)));

  if (b.count > limit) {
    res.status(429).json({ message: 'Too Many Requests' });
    return;
  }
  next();
}
