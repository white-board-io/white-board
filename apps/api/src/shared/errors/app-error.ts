/**
 * Error codes for i18n support
 * Client-side can use these codes to look up translated messages
 */
export type ErrorCode =
  | "VALIDATION_ERROR"
  | "RESOURCE_NOT_FOUND"
  | "DUPLICATE_RESOURCE"
  | "INTERNAL_ERROR";

export interface AppErrorResponse {
  code: ErrorCode;
  formatArgs?: Record<string, string | number>;
  details?: Record<string, unknown>;
}

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly formatArgs?: Record<string, string | number>;
  public readonly details?: Record<string, unknown>;

  constructor(
    code: ErrorCode,
    formatArgs?: Record<string, string | number>,
    details?: Record<string, unknown>
  ) {
    super(code); // Use code as message for logging
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
      RESOURCE_NOT_FOUND: 404,
      DUPLICATE_RESOURCE: 409,
      INTERNAL_ERROR: 500,
    };
    return statusMap[code];
  }

  toJSON(): AppErrorResponse {
    return {
      code: this.code,
      ...(this.formatArgs && { formatArgs: this.formatArgs }),
      ...(this.details && { details: this.details }),
    };
  }
}

// Factory functions for common errors
export const createValidationError = (details?: Record<string, unknown>) =>
  new AppError("VALIDATION_ERROR", undefined, details);

export const createNotFoundError = (resource: string, id?: string) =>
  new AppError("RESOURCE_NOT_FOUND", { resource, ...(id && { id }) });

export const createDuplicateError = (
  resource: string,
  field: string,
  value: string
) => new AppError("DUPLICATE_RESOURCE", { resource, field, value });

export const createInternalError = () => new AppError("INTERNAL_ERROR");
