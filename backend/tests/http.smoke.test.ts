import { describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../src/app';

describe('HTTP smoke', () => {
  it('GET / returns API metadata', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.version).toBe('v1');
  });

  it('GET /api/v1/health is healthy', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('OK');
  });

  it('unknown route returns 404 envelope', async () => {
    const res = await request(app).get('/api/v1/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('login validation fails for bad payload', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({ email: 'bad' });
    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });
});
