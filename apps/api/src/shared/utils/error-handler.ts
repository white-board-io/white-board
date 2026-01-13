import type { FastifyReply, FastifyInstance } from "fastify";
import { AppError } from "../errors/app-error";

/**
 * Creates a reusable error handler for route endpoints
 *
 * Usage in routes:
 *   const handleError = createErrorHandler(fastify);
 *   // then in catch blocks:
 *   return handleError(error, reply);
 */
export function createErrorHandler(fastify: FastifyInstance) {
  return (error: unknown, reply: FastifyReply) => {
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        error: error.toJSON(),
      });
    }

    // Unexpected error
    fastify.logger.error("Unexpected error", error as Error);
    return reply.status(500).send({
      error: {
        code: "INTERNAL_ERROR",
      },
    });
  };
}

/**
 * Type for the error handler function
 */
export type ErrorHandler = ReturnType<typeof createErrorHandler>;
