import { ZodError } from "zod";
import type { ServiceError } from "./ServiceResult";

export function mapZodErrors(zodError: ZodError): ServiceError[] {
  return zodError.issues.map((issue) => ({
    code:
      issue.path.length > 0
        ? `INVALID_${issue.path.map((p) => String(p).toUpperCase()).join("_")}`
        : "VALIDATION_ERROR",
    value: issue.path.join(".") || undefined,
    message: issue.message,
  }));
}
