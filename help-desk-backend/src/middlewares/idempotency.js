import crypto from 'crypto';
import { prisma } from '../db.js';
import { verifyAccessToken } from '../utils/jwt.js';

const MUTATING = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const TTL_SECONDS = 10 * 60; // 10 minutos

function stableStringify(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return '[' + value.map(v => stableStringify(v)).join(',') + ']';
  const keys = Object.keys(value).sort();
  const body = keys.map(k => `${JSON.stringify(k)}:${stableStringify(value[k])}`).join(',');
  return `{${body}}`;
}

function hashBody(body) {
  try {
    const s = typeof body === 'string' ? body : stableStringify(body ?? {});
    return crypto.createHash('sha256').update(s).digest('hex');
  } catch {
    return undefined;
  }
}

export async function idempotencyMiddleware(req, res, next) {
  if (!MUTATING.has(req.method)) return next();

  const providedKey = req.header('Idempotency-Key');
  let scope;
  if (req.user?.sub) {
    scope = `user:${req.user.sub}`;
  } else if (req.cookies?.access_token) {
    try {
      const payload = verifyAccessToken(req.cookies.access_token);
      if (payload?.sub) scope = `user:${payload.sub}`;
    } catch {}
  }
  if (!scope && req.ip) scope = `ip:${req.ip}`;
  const path = req.path;
  const method = req.method;
  const bodyHash = hashBody(req.body);

  if (!scope) return next();

  const now = new Date();
  const expiresAt = new Date(now.getTime() + TTL_SECONDS * 1000);
  const derivedKey = `${method}:${path}:${bodyHash || 'nohash'}`;
  const key = providedKey || derivedKey;

  try {
    // Dedupe por corpo mesmo se o cliente enviar chaves diferentes
    if (bodyHash) {
      const prior = await prisma.idempotencyRecord.findFirst({
        where: { scope, method, path, bodyHash, expiresAt: { gt: now }, status: { not: null } },
        orderBy: { id: 'desc' },
      });
      if (prior && prior.status != null && prior.response != null) {
        res.status(prior.status).json(prior.response);
        return;
      }
    }

    // Verifica se já existe
    const existing = await prisma.idempotencyRecord.findUnique({ where: { key_scope: { key, scope } } });
    if (existing && existing.expiresAt > now) {
      if (existing.status != null && existing.response != null) {
        res.status(existing.status).json(existing.response);
        return;
      }
      // Em andamento
      res.status(409).json({ message: 'Duplicate request in progress' });
      return;
    }

    // Tenta reclamar a chave (create). Se houver conflito, responde conforme existente.
    try {
      await prisma.idempotencyRecord.create({
        data: { key, scope, method, path, bodyHash, expiresAt },
      });
    } catch (err) {
      // Conflito de unicidade
      const dup = await prisma.idempotencyRecord.findUnique({ where: { key_scope: { key, scope } } });
      if (dup && dup.expiresAt > now) {
        if (dup.status != null && dup.response != null) {
          res.status(dup.status).json(dup.response);
          return;
        }
        res.status(409).json({ message: 'Duplicate request in progress' });
        return;
      }
      // Senão, segue o fluxo
    }

    // Envolve res.json para gravar a resposta
    const originalJson = res.json.bind(res);
    res.json = async (payload) => {
      try {
        const status = res.statusCode || 200;
        await prisma.idempotencyRecord.update({
          where: { key_scope: { key, scope } },
          data: { status, response: payload, expiresAt },
        });
      } catch (e) {
        console.error('Idempotency persist error:', e?.message);
      }
      return originalJson(payload);
    };

    return next();
  } catch (e) {
    console.error('Idempotency middleware error:', e?.message);
    return next();
  }
}
