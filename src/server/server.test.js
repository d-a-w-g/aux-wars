import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import express from 'express';
import request from 'supertest';

describe('Server', () => {
  let app;

  beforeAll(() => {
    app = express();
    // Add your server routes and middleware here
    app.get('/test', (req, res) => {
      res.json({ message: 'Test successful' });
    });
  });

  it('responds to test route', async () => {
    const response = await request(app).get('/test');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'Test successful' });
  });
}); 