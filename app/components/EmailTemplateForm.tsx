import { useEffect, useState } from 'react';
import { useActionData, Link } from 'remix';

import type { Schema } from '~/models/EmailTemplate';
import { Input, Fieldset, SelectProps } from './Form';
import { Button } from './Button';
import { FileInput } from './FileInput';
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
        multiple={false}
        accept={{ 'text/csv': ['.csv'] }}
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
  templateId,
  id,
  legend,
  transports,
  fields,
  tags,
  ...props
}: {
  templateId: string;
  id: string;
  legend: string;
  transports: SelectProps['options'];
  fields: SelectProps['options'];
  tags: string[];
  values?: Values<Schema>;
  errors?: Errors<Schema>;
  disabled?: boolean;
}) {
  const actionData = useActionData<{ dataUpdated: boolean }>();
  const [replaceData, setReplaceData] = useState(false);

  useEffect(() => {
    if (actionData?.dataUpdated) {
      setReplaceData(false);
    }
  }, [actionData]);

  return (
    <Fieldset id={id} legend={legend}>
      <div className="flex justify-between gap-3">
        <Input
          label='"To" Column'
          required
          multiple
          options={fields}
          {...getProps('emailColumns', props)}
          id="toColumn"
        />
        <Input
          label="Sendmail Transport"
          required
          options={transports}
          {...getProps('transportId', props)}
        />
      </div>
      {replaceData ? (
        <FileInput
          label="CSV"
          type="file"
          required
          multiple={false}
          accept={{ 'text/csv': ['*.csv'] }}
          {...getProps('data', props)}
        />
      ) : (
        <div>
          <Button
            size="sm"
            onClick={(event) => {
              event.preventDefault();
              setReplaceData(true);
            }}
            className="block"
          >
            Replace data (CSV)
          </Button>
          <Link
            className="mt-1 block text-blue-300 underline hover:text-blue-400"
            to={`/templates/${templateId}/data`}
          >
            data
          </Link>
        </div>
      )}
      <Input label="Subject" required {...getProps('subject', props)} />
      <TemplatedEditor
        label="Body"
        tags={tags}
        required
        {...getProps('body', props)}
      />
    </Fieldset>
  );
}
