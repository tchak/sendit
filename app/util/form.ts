import { ZodError } from 'zod';

export type Values<Schema> = Partial<Schema>;
export type Errors<Schema> = {
  [Name in keyof Schema]:
    | { message?: string; value?: Schema[Name] }
    | undefined;
};

export function getProps<Schema, Name extends keyof Schema = keyof Schema>(
  name: Name,
  {
    values,
    errors,
    disabled,
  }: {
    values?: Values<Schema>;
    errors?: Errors<Schema>;
    disabled?: boolean;
  }
) {
  const errorMessage = errors && errors[name]?.message;
  const defaultValue: Partial<Schema>[Name] = errorMessage
    ? (errors && errors[name]?.value) ?? (values && values[name]) ?? undefined
    : (values && values[name]) ?? undefined;
  return {
    disabled,
    name,
    id: name,
    errorMessage,
    defaultValue,
  };
}

export function getErrors<Schema>(
  error: ZodError<Schema>,
  formData: FormData
): Errors<Schema> {
  const errors: Record<string, unknown> = {};
  const issues = Object.fromEntries(
    error.issues.map(({ message, path }) => [path[0], message])
  );
  for (const [name, value] of formData) {
    errors[name] = { value: String(value), message: issues[name] };
  }
  return errors as Errors<Schema>;
}
