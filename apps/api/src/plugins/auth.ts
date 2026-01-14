import fp from "fastify-plugin";
import type { FastifyPluginAsync, FastifyRequest } from "fastify";
import { auth } from "@repo/auth";

type SessionData = Awaited<ReturnType<typeof auth.api.getSession>>;

declare module "fastify" {
  interface FastifyInstance {
    auth: typeof auth;
  }
  interface FastifyRequest {
    user?: NonNullable<SessionData>["user"] | null;
    session?: NonNullable<SessionData>["session"] | null;
  }
}

const authPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.decorate("auth", auth);
  fastify.decorateRequest("user", null);
  fastify.decorateRequest("session", null);

  fastify.addHook("preHandler", async (request: FastifyRequest) => {
    try {
      const url = new URL(
        request.url,
        `http://${request.headers.host || "localhost"}`
      );

      const headers = new Headers();
      Object.entries(request.headers).forEach(([key, value]) => {
        if (value) {
          if (Array.isArray(value)) {
            value.forEach((v) => headers.append(key, v));
          } else {
            headers.append(key, value);
          }
        }
      });

      const req = new Request(url.toString(), {
        method: request.method,
        headers,
      });

      const sessionData = await auth.api.getSession({ headers: req.headers });

      if (sessionData) {
        request.user = sessionData.user;
        request.session = sessionData.session;
      }
    } catch (err) {
      fastify.log.debug({ err }, "Failed to get session");
    }
  });
};

export default fp(authPlugin, {
  name: "auth",
});
