export type ServiceError = {
  code: string;
  value?: string;
  message: string;
};

export type ServiceResult<T> =
  | {
      data: T;
      isSuccess: true;
    }
  | {
      isSuccess: false;
      errors: ServiceError[];
    };
