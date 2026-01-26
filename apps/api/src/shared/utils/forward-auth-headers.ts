import type { FastifyReply } from "fastify";

/**
 * Forwards response headers from better-auth to Fastify reply.
 * This is crucial for setting cookies like session tokens.
 *
 * @param responseHeaders - Headers from better-auth Response
 * @param reply - Fastify reply object
 */
export function forwardAuthHeaders(
  responseHeaders: Headers,
  reply: FastifyReply,
): void {
  // Forward all Set-Cookie headers (critical for session management)
  const cookies = responseHeaders.getSetCookie();
  for (const cookie of cookies) {
    reply.header("Set-Cookie", cookie);
  }

  // Optionally forward other relevant headers
  const headersToForward = ["Cache-Control", "Pragma"];
  for (const headerName of headersToForward) {
    const value = responseHeaders.get(headerName);
    if (value) {
      reply.header(headerName, value);
    }
  }
}
