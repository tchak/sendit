import type { Schema } from '~/models/EmailTemplate';
import { Input, Fieldset, SelectProps, FileInput } from './Form';
import { TemplatedEditor } from './TemplatedEditor';
import { getProps, Values, Errors } from '~/util/form';

export function EmailTemplateFields({
  id,
  legend,
  transports,
  ...props
}: {
  id: string;
  legend: string;
  transports: SelectProps['options'];
  values?: Values<Schema>;
  errors?: Errors<Schema>;
  disabled?: boolean;
}) {
  return (
    <Fieldset id={id} legend={legend}>
      <Input label="Subject" required {...getProps('subject', props)} />
      <FileInput
        label="CSV"
        type="file"
        required
        {...getProps('data', props)}
      />
      <Input
        label="Email Transport"
        required
        options={transports}
        {...getProps('transportId', props)}
      />
    </Fieldset>
  );
}

export function EmailTemplateUpdateFields({
  id,
  legend,
  transports,
  fields,
  tags,
  ...props
}: {
  id: string;
  legend: string;
  transports: SelectProps['options'];
  fields: SelectProps['options'];
  tags: string[];
  values?: Values<Schema>;
  errors?: Errors<Schema>;
  disabled?: boolean;
}) {
  return (
    <Fieldset id={id} legend={legend}>
      <Input label="Subject" required {...getProps('subject', props)} />
      <TemplatedEditor
        label="Body"
        tags={tags}
        required
        {...getProps('body', props)}
      />
      <Input
        label="Email Column"
        required
        multiple
        options={fields}
        {...getProps('emailColumns', props)}
      />
      <Input
        label="Email Transport"
        required
        options={transports}
        {...getProps('transportId', props)}
      />
    </Fieldset>
  );
}
