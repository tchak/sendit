import type { FormControlProps, SelectProps } from './Form';
import type * as EmailTemplate from '~/models/EmailTemplate';
import { Input } from './Form';

const FIELDS: FormControlProps<keyof EmailTemplate.Schema>[] = [
  { label: 'Subject', name: 'subject', required: true },
  { label: 'CSV', name: 'data', type: 'file', required: true },
  { label: 'Email Transport', name: 'transportId', required: true },
];

export function EmailTemplateFields({
  id,
  legend,
  values,
  errors,
  options,
  disabled,
}: {
  id: string;
  legend: string;
  values?: Partial<EmailTemplate.Schema> | null;
  errors?: EmailTemplate.Errors;
  disabled?: boolean;
  options?: Partial<
    Record<keyof EmailTemplate.Schema, SelectProps['options'] | undefined>
  >;
}) {
  const fields = FIELDS.map(({ name, ...props }) => {
    const errorMessage = errors && errors[name]?.message;
    const defaultValue = errorMessage
      ? (errors && errors[name]?.value) ?? (values && values[name]) ?? undefined
      : (values && values[name]) ?? undefined;
    return {
      disabled,
      name,
      id: name,
      errorMessage,
      ...(typeof defaultValue == 'boolean'
        ? { defaultChecked: defaultValue, value: 'true' }
        : { defaultValue }),
      ...props,
      ...(options && options[name] ? { options: options[name] } : undefined),
    };
  });
  return (
    <fieldset className="space-y-4">
      <legend className="text-lg" id={id}>
        {legend}
      </legend>
      <div className="space-y-6">
        {fields.map((props) => (
          <Input key={props.id} {...props} />
        ))}
      </div>
    </fieldset>
  );
}

const UPDATE_FIELDS: FormControlProps<keyof EmailTemplate.UpdateSchema>[] = [
  { label: 'Subject', name: 'subject', required: true },
  { label: 'Body', name: 'body', required: true },
  {
    label: 'Email Column',
    name: 'emailColumns',
    required: true,
    multiple: true,
  },
  { label: 'Email Transport', name: 'transportId', required: true },
];

export function EmailTemplateUpdateFields({
  id,
  legend,
  values,
  errors,
  options,
  disabled,
}: {
  id: string;
  legend: string;
  values?: Partial<EmailTemplate.UpdateSchema> | null;
  errors?: EmailTemplate.UpdateErrors;
  disabled?: boolean;
  options?: Partial<
    Record<keyof EmailTemplate.UpdateSchema, SelectProps['options'] | undefined>
  >;
}) {
  const fields = UPDATE_FIELDS.map(({ name, ...props }) => {
    const errorMessage = errors && errors[name]?.message;
    const defaultValue = errorMessage
      ? (errors && errors[name]?.value) ?? (values && values[name]) ?? undefined
      : (values && values[name]) ?? undefined;
    return {
      disabled,
      name,
      id: name,
      errorMessage,
      ...(typeof defaultValue == 'boolean'
        ? { defaultChecked: defaultValue, value: 'true' }
        : { defaultValue }),
      ...props,
      ...(options && options[name] ? { options: options[name] } : undefined),
    };
  });
  return (
    <fieldset className="space-y-4">
      <legend className="text-lg" id={id}>
        {legend}
      </legend>
      <div className="space-y-6">
        {fields.map((props) => (
          <Input key={props.id} {...props} />
        ))}
      </div>
    </fieldset>
  );
}
