import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: [
      { find: /^@utils\/(.*)/, replacement: path.resolve(__dirname, './src/utils/$1') },
    ],
  },
  test: {
    environment: 'node',
    include: ['src/**/*.{test,spec}.ts'],
    server: {
      deps: {
        inline: [/@repo\/.*/],
      },
    },
    env: {
      DATABASE_URL: 'postgres://postgres:postgres@localhost:5432/test',
      NODE_ENV: 'test',
    },
  },
});
