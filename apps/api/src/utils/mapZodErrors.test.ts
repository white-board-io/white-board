import { describe, it, expect } from 'vitest';
import { mapZodErrors } from './mapZodErrors';
import { ZodError, ZodIssue } from 'zod';

describe('mapZodErrors', () => {
  it('should return formatted errors, when ZodError is provided', () => {
    const issues: ZodIssue[] = [
      {
        code: 'invalid_type',
        expected: 'string',
        received: 'number',
        path: ['user', 'name'],
        message: 'Expected string, received number',
      },
      {
        code: 'too_small',
        minimum: 5,
        type: 'string',
        inclusive: true,
        path: ['password'],
        message: 'String must contain at least 5 character(s)',
        exact: false,
      },
    ];
    const error = new ZodError(issues);

    const result = mapZodErrors(error);

    expect(result).toEqual([
      {
        code: 'Expected string, received number',
        value: 'user.name',
      },
      {
        code: 'String must contain at least 5 character(s)',
        value: 'password',
      },
    ]);
  });
});
