import Fastify from "fastify";
import appPlugin from "../app";

export async function build() {
  const app = Fastify();
  await app.register(appPlugin);
  await app.ready();
  return app;
}
