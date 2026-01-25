import type { FastifyReply } from "fastify";
import type { ServiceResult } from "./ServiceResult";

export function handleServiceResult<T>(
  result: ServiceResult<T> & { responseHeaders?: Headers },
  reply: FastifyReply,
  successStatus: number = 200,
) {
  if (result.isSuccess) {
    if (result.responseHeaders) {
      result.responseHeaders.forEach((value, key) => {
        reply.header(key, value);
      });
    }
    return reply
      .status(successStatus)
      .send({ success: true, data: result.data });
  }

  const firstError = result.errors[0];
  const statusCode = mapErrorCodeToStatus(firstError?.code);

  return reply.status(statusCode).send({
    success: false,
    error: {
      code: firstError?.code || "UNKNOWN_ERROR",
      message: firstError?.message || "An error occurred",
      details: result.errors,
    },
  });
}

function mapErrorCodeToStatus(code?: string): number {
  switch (code) {
    case "VALIDATION_ERROR":
      return 400;
    case "UNAUTHORIZED":
      return 401;
    case "FORBIDDEN":
      return 403;
    case "RESOURCE_NOT_FOUND":
      return 404;
    case "DUPLICATE_RESOURCE":
      return 409;
    case "INTERNAL_ERROR":
      return 500;
    default:
      return 400;
  }
}
