/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import { ExclamationCircleIcon, CheckCircleIcon } from '@heroicons/react/solid';
import clsx from 'clsx';
import { useId } from 'react';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import ReactSelect from 'react-select';

export type InputGroupProps = {
  label: string;
  id?: string;
  description?: string;
  errorMessage?: string;
  required?: boolean;
  filled?: boolean;
  children: ReactNode;
};

export function InputGroup({
  label,
  description,
  errorMessage,
  filled,
  children,
  ...props
}: InputGroupProps) {
  const autoId = useId();
  const id = props.id ? props.id : autoId;

  return (
    <div className="flex-1">
      <div className="flex justify-between">
        <label
          htmlFor={id}
          id={`${id}-label`}
          className="block text-sm font-medium text-gray-700"
          onClick={() => {
            document
              .querySelector<HTMLElement>(`[aria-labelledby="${id}-label"]`)
              ?.focus();
          }}
        >
          {label}
        </label>
        {!props.required ? (
          <span className="text-sm text-gray-500" id={`${id}-optional`}>
            Optional
          </span>
        ) : null}
      </div>
      <div
        className={clsx('mt-1', {
          'relative rounded-md shadow-sm': errorMessage,
        })}
      >
        {children}
        {filled || errorMessage ? (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            {filled ? (
              <CheckCircleIcon
                className="h-5 w-5 text-green-500"
                aria-hidden="true"
              />
            ) : (
              <ExclamationCircleIcon
                className="h-5 w-5 text-red-500"
                aria-hidden="true"
              />
            )}
          </div>
        ) : null}
      </div>
      {errorMessage ? (
        <p
          role="alert"
          className="mt-2 text-sm text-red-600"
          id={`${id}-error`}
        >
          {errorMessage}
        </p>
      ) : description ? (
        <p className="mt-2 text-sm text-gray-500" id={`${id}-description`}>
          {description}
        </p>
      ) : null}
    </div>
  );
}

export type InputProps<Name = string> = Omit<
  ComponentPropsWithoutRef<'input'>,
  'defaultValue'
> & {
  label: string;
  name: Name;
  defaultValue?: ComponentPropsWithoutRef<'input'>['defaultValue'] | null;
  description?: string;
  errorMessage?: string;
  filled?: boolean;
};

export type SelectProps<Name = string> = Omit<
  ComponentPropsWithoutRef<'select'>,
  'defaultValue'
> & {
  label: string;
  name: Name;
  options: { label: string; value: string }[];
  defaultValue?: ComponentPropsWithoutRef<'select'>['defaultValue'] | null;
  multiple?: boolean;
  description?: string;
  errorMessage?: string;
  filled?: boolean;
};

export function Input<Name = string>({
  label,
  description,
  errorMessage,
  className,
  defaultValue,
  id: inputId,
  ...props
}: InputProps<Name> | SelectProps<Name>) {
  const autoId = useId();
  const id = inputId ? inputId : autoId;

  if ('options' in props) {
    return (
      <Select
        id={id}
        label={label}
        description={description}
        errorMessage={errorMessage}
        defaultValue={defaultValue ?? undefined}
        {...props}
      />
    );
  }

  const { type = 'text' } = props;

  if (type == 'checkbox') {
    return (
      <CheckboxInput
        id={id}
        label={label}
        description={description}
        errorMessage={errorMessage}
        //defaultChecked={defaultValue == true}
        value="true"
        {...props}
      />
    );
  }

  return (
    <InputGroup
      id={id}
      label={label}
      description={description}
      errorMessage={errorMessage}
      {...props}
    >
      <input
        type={type}
        id={id}
        autoCapitalize="none"
        autoCorrect="off"
        autoComplete="off"
        spellCheck={false}
        className={clsx(
          'block w-full rounded-md sm:text-sm',
          {
            'border-red-300 pr-10 text-red-900 placeholder-red-300 focus:border-red-500 focus:outline-none focus:ring-red-500':
              errorMessage,
            'border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500':
              !errorMessage,
          },
          className
        )}
        aria-invalid={errorMessage ? 'true' : undefined}
        aria-errormessage={errorMessage ? `${id}-error` : undefined}
        aria-describedby={describedby({
          id,
          error: !!errorMessage,
          description: !!description,
          required: props.required,
        })}
        defaultValue={defaultValue ?? undefined}
        {...props}
      />
      {props.filled || errorMessage ? (
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          {props.filled ? (
            <CheckCircleIcon
              className="h-5 w-5 text-green-500"
              aria-hidden="true"
            />
          ) : (
            <ExclamationCircleIcon
              className="h-5 w-5 text-red-500"
              aria-hidden="true"
            />
          )}
        </div>
      ) : null}
    </InputGroup>
  );
}

function CheckboxInput<Name = string>({
  id,
  label,
  errorMessage,
  description,
  ...props
}: Omit<InputProps<Name>, 'defaultValue'>) {
  return (
    <div className="relative flex items-start">
      <div className="flex h-5 items-center">
        <input
          type="checkbox"
          id={id}
          aria-describedby={describedby({
            id,
            error: !!errorMessage,
            description: !!description,
            required: false,
          })}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          {...props}
        />
      </div>
      <div className="ml-3 text-sm">
        <label htmlFor={id} className="font-medium text-gray-700">
          {label}
        </label>
        {errorMessage ? (
          <p role="alert" className="text-red-600" id={`${id}-error`}>
            {errorMessage}
          </p>
        ) : description ? (
          <p className="text-gray-500" id={`${id}-description`}>
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function Select<Name = string>({
  id,
  label,
  errorMessage,
  description,
  options,
  multiple,
  ...props
}: SelectProps<Name>) {
  return (
    <InputGroup
      id={id}
      label={label}
      description={description}
      errorMessage={errorMessage}
      required={props.required}
    >
      <ReactSelect
        id={`${id}-select`}
        instanceId={`${id}-instance`}
        inputId={id}
        name={props.name}
        className="mt-1 block w-full rounded-md border-gray-300 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
        minMenuHeight={100}
        isMulti={multiple}
        defaultValue={
          multiple
            ? options.filter((option) =>
                Array.isArray(props.defaultValue)
                  ? props.defaultValue.includes(option.value)
                  : option.value == props.defaultValue
              )
            : options.find((option) => option.value == props.defaultValue)
        }
        options={options}
        aria-invalid={errorMessage ? true : undefined}
        aria-errormessage={errorMessage ? `${id}-error` : undefined}
        aria-describedby={describedby({
          id,
          error: !!errorMessage,
          description: !!description,
          required: false,
        })}
        placeholder={props.placeholder}
        isDisabled={props.disabled}
        isClearable={!props.required}
      />
      {errorMessage ? (
        <p
          role="alert"
          className="mt-2 text-sm text-red-600"
          id={`${id}-error`}
        >
          {errorMessage}
        </p>
      ) : description ? (
        <p className="mt-2 text-sm text-gray-500" id={`${id}-description`}>
          {description}
        </p>
      ) : null}
    </InputGroup>
  );
}

function describedby({
  id,
  error,
  description,
  required,
}: {
  id?: string;
  error?: boolean;
  description?: boolean;
  required?: boolean;
}): string | undefined {
  if (!id) {
    return;
  }
  if (error) {
    return `${id}-error`;
  }
  if (description) {
    return required ? `${id}-description` : `${id}-description ${id}-optional`;
  }
  if (!required) {
    return `${id}-optional`;
  }
}

export function Fieldset({
  id,
  legend,
  children,
}: {
  id: string;
  legend: string;
  children: ReactNode;
}) {
  return (
    <fieldset className="space-y-4">
      <legend className="text-lg" id={id}>
        {legend}
      </legend>
      <div className="space-y-6">{children}</div>
    </fieldset>
  );
}
