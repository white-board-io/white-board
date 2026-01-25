export type ValidationResult =
  | {
      isValid: true;
    }
  | {
      isValid: false;
      errors: {
        code: string;
        value?: string;
        message: string;
      }[];
    };
