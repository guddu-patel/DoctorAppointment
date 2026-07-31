import { Role, UserStatus } from '@prisma/client';
import { Request } from 'express';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  status: UserStatus;
  doctorId?: string;
  patientId?: string;
  staffId?: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
  type: 'access' | 'refresh';
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
