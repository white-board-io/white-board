export type ErrorCode =
  | "VALIDATION_ERROR"
  | "RESOURCE_NOT_FOUND"
  | "DUPLICATE_RESOURCE"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "INTERNAL_ERROR";

export type AppErrorResponse = {
  code: ErrorCode;
  message?: string;
  formatArgs?: Record<string, string | number>;
  details?: Record<string, unknown>;
};

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly formatArgs?: Record<string, string | number>;
  public readonly details?: Record<string, unknown>;

  constructor(
    code: ErrorCode,
    formatArgs?: Record<string, string | number>,
    details?: Record<string, unknown>,
    message?: string,
  ) {
    super(message || code);
    this.name = "AppError";
    this.code = code;
    this.formatArgs = formatArgs;
    this.details = details;
    this.statusCode = this.getStatusCode(code);

    Error.captureStackTrace(this, this.constructor);
  }

  private getStatusCode(code: ErrorCode): number {
    const statusMap: Record<ErrorCode, number> = {
      VALIDATION_ERROR: 400,
      UNAUTHORIZED: 401,
      FORBIDDEN: 403,
      RESOURCE_NOT_FOUND: 404,
      DUPLICATE_RESOURCE: 409,
      INTERNAL_ERROR: 500,
    };
    return statusMap[code];
  }

  toJSON(): AppErrorResponse {
    return {
      code: this.code,
      ...(this.message !== this.code && { message: this.message }),
      ...(this.formatArgs && { formatArgs: this.formatArgs }),
      ...(this.details && { details: this.details }),
    };
  }
}

export const createValidationError = (details?: Record<string, unknown>) =>
  new AppError("VALIDATION_ERROR", undefined, details);

export const createNotFoundError = (resource: string, id?: string) =>
  new AppError("RESOURCE_NOT_FOUND", { resource, ...(id && { id }) });

export const createDuplicateError = (
  resource: string,
  field: string,
  value: string,
) => new AppError("DUPLICATE_RESOURCE", { resource, field, value });

export const createUnauthorizedError = (message?: string) =>
  new AppError(
    "UNAUTHORIZED",
    undefined,
    undefined,
    message || "Authentication required",
  );

export const createForbiddenError = (message?: string) =>
  new AppError("FORBIDDEN", undefined, undefined, message || "Access denied");

export const createInternalError = () => new AppError("INTERNAL_ERROR");

export const createAuthError = (message: string) =>
  new AppError("UNAUTHORIZED", undefined, undefined, message);
