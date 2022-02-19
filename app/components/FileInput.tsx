import type { ComponentPropsWithoutRef } from 'react';
import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { DocumentDownloadIcon, XCircleIcon } from '@heroicons/react/outline';
import clsx from 'clsx';

import { InputGroup } from './Form';

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
  name,
  defaultValue,
  description,
  errorMessage,
  accept,

  ...props
}: FileProps<Name, Value>) {
  const [file, setFile] = useState<File>();
  const [text, setText] = useState<string>();
  const onDrop = useCallback((acceptedFiles) => {
    setFile(acceptedFiles[0]);
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept,
  });

  useEffect(() => {
    if (file) {
      file.text().then((text) => setText(text));
    }
  }, [file]);

  return (
    <InputGroup
      id={id}
      label={label}
      description={description}
      errorMessage={errorMessage}
      required={props.required}
    >
      <div
        {...getRootProps()}
        className={clsx(
          'mt-1 max-w-lg flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md relative',
          { 'border-blue-300': isDragActive }
        )}
      >
        {file ? (
          <div className="absolute top-2 left-2 flex items-center">
            <p className="text-sm">{file.name}</p>
            {text ? <input type="hidden" name={name} value={text} /> : null}
            <button
              type="button"
              className="ml-1"
              onClick={(event) => {
                event.stopPropagation();
                setText(undefined);
                setFile(undefined);
              }}
            >
              <XCircleIcon className="w-5 h-5 hover:text-red-500" />
            </button>
          </div>
        ) : null}
        <div className="space-y-1 text-center">
          <DocumentDownloadIcon className="mx-auto h-12 w-12 text-gray-400" />
          <div className="flex text-sm text-gray-600">
            <label
              htmlFor={id}
              className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
            >
              <span>Upload a file</span>
              <input className="sr-only" {...getInputProps()} />
            </label>
            <p className="pl-1">or drag and drop</p>
          </div>
        </div>
      </div>
    </InputGroup>
  );
}
