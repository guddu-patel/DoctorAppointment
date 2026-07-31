import { Response } from 'express';

export function successResponse<T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode = 200
) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
}

export function errorResponse(
  res: Response,
  message: string,
  statusCode = 500,
  errors?: unknown
) {
  return res.status(statusCode).json({
    success: false,
    message,
    errors: errors ?? null,
    timestamp: new Date().toISOString(),
  });
}

export function paginatedResponse<T>(
  res: Response,
  data: T[],
  meta: { page: number; limit: number; total: number },
  message = 'Success'
) {
  return res.status(200).json({
    success: true,
    message,
    data,
    meta: {
      ...meta,
      totalPages: Math.ceil(meta.total / meta.limit) || 1,
    },
    timestamp: new Date().toISOString(),
  });
}
