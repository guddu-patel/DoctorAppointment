import { describe, expect, it } from 'vitest';
import type { Response } from 'express';
import { errorResponse, paginatedResponse, successResponse } from '../src/responses/apiResponse';

function mockRes() {
  const res = {
    statusCode: 0,
    body: null as unknown,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
  };
  return res as unknown as Response & { statusCode: number; body: Record<string, unknown> };
}

describe('api responses', () => {
  it('successResponse wraps data', () => {
    const res = mockRes();
    successResponse(res, { id: 1 }, 'Created', 201);
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Created');
    expect(res.body.data).toEqual({ id: 1 });
    expect(typeof res.body.timestamp).toBe('string');
  });

  it('errorResponse includes errors', () => {
    const res = mockRes();
    errorResponse(res, 'Nope', 400, ['x']);
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toEqual(['x']);
  });

  it('paginatedResponse computes totalPages', () => {
    const res = mockRes();
    paginatedResponse(res, [1, 2], { page: 1, limit: 10, total: 25 });
    expect(res.statusCode).toBe(200);
    expect(res.body.meta).toEqual({ page: 1, limit: 10, total: 25, totalPages: 3 });
  });

  it('paginatedResponse handles zero total', () => {
    const res = mockRes();
    paginatedResponse(res, [], { page: 1, limit: 10, total: 0 });
    expect((res.body.meta as { totalPages: number }).totalPages).toBe(1);
  });
});
