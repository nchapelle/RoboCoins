import jwt from 'jsonwebtoken';
import { env } from './env.js';
import { Request, Response, NextFunction } from 'express';

export type JWTPayload = { userId: string; orgId: string; role: string };

export function signToken(payload: JWTPayload) {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '7d' });
}

export function requireAuth(
  req: Request & { user?: JWTPayload },
  res: Response,
  next: NextFunction
) {
  const h = req.headers.authorization;
  if (!h?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const token = h.slice(7);
    const payload = jwt.verify(token, env.JWT_SECRET) as JWTPayload;
    req.user = payload;
    return next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}