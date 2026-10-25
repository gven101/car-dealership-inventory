import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { AppError } from '../utils/AppError';

export interface AuthPayload {
  id: string;
  role: Role;
}

// Lets TypeScript know req.user can exist
declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) throw new AppError(401, 'Authentication required');

  const token = header.slice('Bearer '.length);
  try {
    // verify() checks the signature AND expiry; throws if either fails
    req.user = jwt.verify(token, process.env.JWT_SECRET as string) as AuthPayload;
  } catch {
    throw new AppError(401, 'Invalid or expired token');
  }
  next();
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  if (req.user?.role !== 'ADMIN') throw new AppError(403, 'Admin access required');
  next();
}