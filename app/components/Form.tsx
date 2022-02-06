import { ExclamationCircleIcon, CheckCircleIcon } from '@heroicons/react/solid';
import { DocumentDownloadIcon } from '@heroicons/react/outline';
import clsx from 'clsx';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { useCallback, useState, useEffect } from 'react';
import { useId } from '@reach/auto-id';
import ReactSelect from 'react-select';
import { Link, LinkProps } from 'remix';
import { useDropzone } from 'react-dropzone';

export type ButtonClassNameProps = {
  isActive?: boolean;
  primary?: boolean;
  full?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

export function buttonClassName({
  isActive = false,
  size = 'md',
  primary = false,
  full = false,
  className,
}: ButtonClassNameProps) {
  return clsx(
    'inline-flex items-center border shadow-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
    primary ? 'border-transparent text-white' : 'border-gray-300 text-gray-700',
    primary
      ? isActive
        ? 'bg-blue-700'
        : 'bg-blue-600 hover:bg-blue-700'
      : isActive
      ? 'bg-gray-200 hover:bg-gray-50'
      : 'bg-white hover:bg-gray-50',
    {
      'px-2.5 py-1.5 text-xs rounded': size == 'sm',
      'px-3 py-2 text-sm leading-4 rounded-md': size == 'md',
      'px-4 py-2 text-sm rounded-md': size == 'lg',
      'w-full flex justify-center': full,
    },
    className
  );
}

export type ButtonProps = ButtonClassNameProps &
  ComponentPropsWithoutRef<'button'>;

export function Button({
  children,
  size,
  primary,
  full,
  className,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClassName({ size, primary, full, className })}
      {...props}
    >
      {children}
    </button>
  );
}

export type ButtonLinkProps = ButtonClassNameProps & LinkProps;

export function LinkButton({
  children,
  size,
  primary,
  full,
  className,
  to,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      to={to}
      className={buttonClassName({ size, primary, full, className })}
      {...props}
    >
      {children}
    </Link>
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
  filled,
  className,
  defaultValue,
  id: inputId,
  ...props
}: InputProps<Name> | SelectProps<Name>) {
  const id = useId(inputId);

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
    <div>
      <div className="flex justify-between">
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
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
        <input
          type={type}
          id={id}
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
          className={clsx(
            'sm:text-sm rounded-md block w-full',
            {
              'pr-10 border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500':
                errorMessage,
              'shadow-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300':
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
        {filled || errorMessage ? (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
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

function CheckboxInput<Name = string>({
  id,
  label,
  errorMessage,
  description,
  ...props
}: Omit<InputProps<Name>, 'defaultValue'>) {
  return (
    <div className="relative flex items-start">
      <div className="flex items-center h-5">
        <input
          type="checkbox"
          id={id}
          aria-describedby={describedby({
            id,
            error: !!errorMessage,
            description: !!description,
            required: false,
          })}
          className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
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

function SelectedFile({ file, name }: { file: File; name: string }) {
  const [valueAsText, setValueAsText] = useState<string>();
  useEffect(() => {
    const reader = new FileReader();
    reader.onload = () => {
      setValueAsText(reader.result as string);
    };
    reader.readAsText(file);
  }, [file]);
  return (
    <div>
      <p>{file.name}</p>
      <input name={name} type="hidden" defaultValue={valueAsText} />
    </div>
  );
}

export type FileProps<Name = string, Value = never> = Omit<
  ComponentPropsWithoutRef<'input'>,
  'defaultValue'
> & {
  label: string;
  name: Name;
  defaultValue?: Value;
  description?: string;
  errorMessage?: string;
  filled?: boolean;
};

export function FileInput<Name = string, Value = never>({
  id,
  label,
  defaultValue,
  ...props
}: FileProps<Name, Value>) {
  const [files, setFiles] = useState<File[]>();
  const onDrop = useCallback((acceptedFiles) => {
    setFiles(acceptedFiles);
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });
  return (
    <div>
      <div className="flex justify-between">
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        {!props.required ? (
          <span className="text-sm text-gray-500" id={`${id}-optional`}>
            Optional
          </span>
        ) : null}
      </div>
      {files ? (
        <SelectedFile file={files[0]} name={props.name as string} />
      ) : (
        <div
          {...getRootProps()}
          className="mt-1 max-w-lg flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md"
        >
          <div className="space-y-1 text-center">
            <DocumentDownloadIcon className="mx-auto h-12 w-12 text-gray-400" />
            <div className="flex text-sm text-gray-600">
              <label
                htmlFor={id}
                className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
              >
                <span>Upload a file</span>
                <input className="sr-only" {...props} {...getInputProps()} />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500">CSV</p>
          </div>
        </div>
      )}
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
    <div>
      <div className="flex justify-between">
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        {!props.required ? (
          <span className="text-sm text-gray-500" id={`${id}-optional`}>
            Optional
          </span>
        ) : null}
      </div>
      <ReactSelect
        inputId={id}
        name={props.name}
        className="mt-1 block w-full text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
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
    </div>
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
