import type { FormControlProps, SelectProps } from './Form';
import type { Schema, Errors } from '~/models/EmailTransport';
import { Input } from './form';

const FIELDS: FormControlProps<keyof Schema>[] = [
  { label: 'Name', name: 'name', required: true },
  { label: 'Email', name: 'email', type: 'email', required: true },
  { label: 'Host', name: 'host', required: true },
  { label: 'Port', name: 'port', type: 'number', required: true },
  { label: 'Username', name: 'username', required: true },
  { label: 'Password', name: 'password', type: 'password', required: true },
];

export function EmailTransportFields({
  id,
  legend,
  values,
  errors,
  options,
  disabled,
}: {
  id: string;
  legend: string;
  values?: Partial<Schema> | null;
  errors?: Errors;
  disabled?: boolean;
  options?: Partial<Record<keyof Schema, SelectProps['options'] | undefined>>;
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
