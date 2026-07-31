import { describe, expect, it } from 'vitest';
import {
  AppError,
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from '../src/exceptions/AppError';

describe('AppError hierarchy', () => {
  it('sets operational flag and status codes', () => {
    expect(new BadRequestError().statusCode).toBe(400);
    expect(new UnauthorizedError().statusCode).toBe(401);
    expect(new ForbiddenError().statusCode).toBe(403);
    expect(new NotFoundError('Missing').statusCode).toBe(404);
    expect(new NotFoundError('Missing').message).toBe('Missing');
    expect(new ConflictError().statusCode).toBe(409);
    expect(new ValidationError('Invalid', [{ field: 'email' }]).statusCode).toBe(422);
    expect(new ValidationError('Invalid', [{ field: 'email' }]).errors).toEqual([{ field: 'email' }]);
    expect(new AppError('boom').isOperational).toBe(true);
  });
});
