import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface JwtPayload {
  id: number;
  email: string;
  empresa_id: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({
        error: 'Token não fornecido'
      });
      return;
    }

    const parts = authHeader.split(' ');

    if (parts.length !== 2) {
      res.status(401).json({
        error: 'Token inválido'
      });
      return;
    }

    const [scheme, token] = parts;

    if (!scheme || !/^Bearer$/i.test(scheme)) {
      res.status(401).json({
        error: 'Token mal formatado'
      });
      return;
    }

    if (!token) {
      res.status(401).json({
        error: 'Token não fornecido'
      });
      return;
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error('JWT_SECRET não configurado');
    }

    const decoded = jwt.verify(token, secret) as JwtPayload;

    req.user = decoded;

    next();
  } catch (error) {
    res.status(401).json({
      error: 'Token inválido ou expirado'
    });
  }
};
