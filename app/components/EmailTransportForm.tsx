import type { Schema } from '~/models/EmailTransport';
import { Input, Fieldset } from './Form';
import { getProps, Values, Errors } from '~/util/form';

export function EmailTransportFields({
  id,
  legend,
  ...props
}: {
  id: string;
  legend: string;
  values?: Values<Schema>;
  errors?: Errors<Schema>;
  disabled?: boolean;
}) {
  return (
    <Fieldset id={id} legend={legend}>
      <Input label="Name" required {...getProps('name', props)} />
      <Input
        label="Email"
        type="email"
        required
        {...getProps<Schema>('email', props)}
      />
      <Input label="Host" required {...getProps('host', props)} />
      <Input label="Port" type="number" required {...getProps('port', props)} />
      <Input label="Username" required {...getProps('username', props)} />
      <Input
        label="Password"
        type="password"
        required
        {...getProps('password', props)}
      />
    </Fieldset>
  );
}
