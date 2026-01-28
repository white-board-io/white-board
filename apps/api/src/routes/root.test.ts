import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { build } from '../test-utils/helper';
import { FastifyInstance } from 'fastify';

describe('GET /', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await build();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return root object, when request is valid', async () => {
    const res = await app.inject({
      url: '/',
    });
    expect(JSON.parse(res.payload)).toEqual({ root: true });
  });
});
