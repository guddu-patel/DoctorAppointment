import { Response } from 'express';
import { AuthRequest } from '../types';
import { asyncHandler } from '../middlewares/error.middleware';
import { successResponse, paginatedResponse } from '../responses/apiResponse';
import { authService } from '../services/auth.service';
import {
  forgotPasswordSchema,
  loginSchema,
  refreshSchema,
  registerSchema,
} from '../validators/schemas';

export const register = asyncHandler(async (req: AuthRequest, res: Response) => {
  const body = registerSchema.parse(req.body);
  const result = await authService.register(body);
  return successResponse(res, result, 'Registered successfully', 201);
});

export const login = asyncHandler(async (req: AuthRequest, res: Response) => {
  const body = loginSchema.parse(req.body);
  const result = await authService.login(body.email, body.password);
  return successResponse(res, result, 'Logged in successfully');
});

export const refresh = asyncHandler(async (req: AuthRequest, res: Response) => {
  const body = refreshSchema.parse(req.body);
  const result = await authService.refresh(body.refreshToken);
  return successResponse(res, result, 'Token refreshed');
});

export const logout = asyncHandler(async (req: AuthRequest, res: Response) => {
  const header = req.headers.authorization;
  const accessToken = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
  const refreshToken = req.body?.refreshToken as string | undefined;
  const result = await authService.logout(accessToken, refreshToken);
  return successResponse(res, result, 'Logged out');
});

export const me = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await authService.me(req.user!.id);
  return successResponse(res, result);
});

export const forgotPassword = asyncHandler(async (req: AuthRequest, res: Response) => {
  const body = forgotPasswordSchema.parse(req.body);
  const result = await authService.forgotPassword(body.email);
  return successResponse(res, result);
});
