import fp from "fastify-plugin";
import type { FastifyInstance, FastifyBaseLogger } from "fastify";

export interface LoggerHelpers {
  info: (msg: string, data?: Record<string, unknown>) => void;
  warn: (msg: string, data?: Record<string, unknown>) => void;
  error: (msg: string, error?: Error | Record<string, unknown>) => void;
  debug: (msg: string, data?: Record<string, unknown>) => void;
}

/**
 * Creates logger helper methods that wrap Fastify's Pino logger
 */
function createLoggerHelpers(baseLogger: FastifyBaseLogger): LoggerHelpers {
  return {
    info: (msg: string, data?: Record<string, unknown>) => {
      if (data) {
        baseLogger.info(data, msg);
      } else {
        baseLogger.info(msg);
      }
    },

    warn: (msg: string, data?: Record<string, unknown>) => {
      if (data) {
        baseLogger.warn(data, msg);
      } else {
        baseLogger.warn(msg);
      }
    },

    error: (msg: string, error?: Error | Record<string, unknown>) => {
      if (error instanceof Error) {
        baseLogger.error({ err: error }, msg);
      } else if (error) {
        baseLogger.error(error, msg);
      } else {
        baseLogger.error(msg);
      }
    },

    debug: (msg: string, data?: Record<string, unknown>) => {
      if (data) {
        baseLogger.debug(data, msg);
      } else {
        baseLogger.debug(msg);
      }
    },
  };
}

/**
 * Logger plugin that exposes helper methods for logging
 *
 * Usage:
 *   fastify.logger.info('User created', { userId: '123' });
 *   fastify.logger.error('Failed to create user', error);
 */
export default fp(
  async (fastify: FastifyInstance) => {
    const loggerHelpers = createLoggerHelpers(fastify.log);
    fastify.decorate("logger", loggerHelpers);
  },
  {
    name: "logger-plugin",
  }
);

// Extend FastifyInstance type to include logger helpers
declare module "fastify" {
  interface FastifyInstance {
    logger: LoggerHelpers;
  }
}
