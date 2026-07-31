import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../exceptions/AppError';
import { errorResponse } from '../responses/apiResponse';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return errorResponse(res, err.message, err.statusCode, err.errors);
  }

  if (err instanceof ZodError) {
    return errorResponse(
      res,
      'Validation failed',
      422,
      err.errors.map((e) => ({ path: e.path.join('.'), message: e.message }))
    );
  }

  console.error('[Unhandled Error]', err);
  return errorResponse(res, 'Internal server error', 500);
}

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export function notFoundHandler(_req: Request, res: Response) {
  return errorResponse(res, 'Route not found', 404);
}
