import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { build } from '../test-utils/helper';
import { FastifyInstance } from 'fastify';

describe('GET /example', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await build();
  });

  afterAll(async () => {
    await app.close();
  });

  it.skip('should return example, when request is valid', async () => {
    const res = await app.inject({
      url: '/example',
    });
    expect(res.payload).toBe('this is an example');
  });
});
