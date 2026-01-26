import { ZodError } from "zod";
import type { ServiceError } from "./ServiceResult";

export function mapZodErrors(zodError: ZodError): ServiceError[] {
  return zodError.issues.map((issue) => ({
    code: issue.message,
    value: issue.path.join(".") || undefined,
  }));
}
