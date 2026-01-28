import { describe, it, expect } from 'vitest';
import Fastify from 'fastify';
import Support from './support';

describe('support plugin', () => {
  it('should add someSupport decorator, when registered', async () => {
    const fastify = Fastify();
    void fastify.register(Support);
    await fastify.ready();
    // @ts-ignore
    expect(fastify.someSupport()).toBe('hugs');
  });
});
