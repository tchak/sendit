import {
  useMemo,
  useCallback,
  useRef,
  useEffect,
  useState,
  ReactNode,
  PropsWithChildren,
} from 'react';
import { createPortal } from 'react-dom';
import { Editor, Transforms, Range, createEditor, Descendant } from 'slate';
import { withHistory } from 'slate-history';
import {
  Slate,
  Editable,
  ReactEditor,
  withReact,
  useSelected,
  useFocused,
} from 'slate-react';
import clsx from 'clsx';

import type { Tag, CustomElement } from '~/models/TemplateDocument';

const Portal = ({ children }: { children: ReactNode }) => {
  return typeof document === 'object'
    ? createPortal(children, document.body)
    : null;
};

export function TemplatedEditor<Name extends string = string>({
  id,
  label,
  tags,
  name,
  defaultValue: initialValue,
  errorMessage,
  className,
  ...props
}: {
  id?: string;
  label: string;
  name?: Name;
  placeholder?: string;
  tags: string[];
  defaultValue?: Descendant[];
  errorMessage?: string;
  className?: string;
  required?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState<Descendant[]>(initialValue ?? []);
  const [defaultValue, setDefaultValue] = useState(
    JSON.stringify(initialValue)
  );
  const [target, setTarget] = useState<Range | undefined | null>();
  const [index, setIndex] = useState(0);
  const [search, setSearch] = useState('');
  const renderElement = useCallback((props) => <Element {...props} />, []);
  const editor = useMemo(
    () => withTags(withReact(withHistory(createEditor()))),
    []
  );

  const chars = tags
    .filter((c) => c.toLowerCase().startsWith(search.toLowerCase()))
    .slice(0, 10);

  const onKeyDown = useCallback(
    (event) => {
      if (target) {
        switch (event.key) {
          case 'ArrowDown':
            event.preventDefault();
            setIndex(index >= chars.length - 1 ? 0 : index + 1);
            break;
          case 'ArrowUp':
            event.preventDefault();
            setIndex(index <= 0 ? chars.length - 1 : index - 1);
            break;
          case 'Tab':
          case 'Enter':
            event.preventDefault();
            Transforms.select(editor, target);
            insertTag(editor, chars[index]);
            setTarget(null);
            break;
          case 'Escape':
            event.preventDefault();
            setTarget(null);
            break;
        }
      }
    },
    [index, search, target]
  );

  useEffect(() => {
    if (target && chars.length > 0) {
      const el = ref.current;
      const domRange = ReactEditor.toDOMRange(editor, target);
      const rect = domRange.getBoundingClientRect();
      if (el) {
        el.style.top = `${rect.top + window.pageYOffset + 24}px`;
        el.style.left = `${rect.left + window.pageXOffset}px`;
      }
    }
  }, [chars.length, editor, index, search, target]);

  return (
    <>
      <Slate
        editor={editor}
        value={value}
        onChange={(value) => {
          setValue(value);
          setDefaultValue(JSON.stringify(value));
          const { selection } = editor;

          if (selection && Range.isCollapsed(selection)) {
            const [start] = Range.edges(selection);
            const wordBefore = Editor.before(editor, start, { unit: 'word' });
            const before = wordBefore && Editor.before(editor, wordBefore);
            const beforeRange = before && Editor.range(editor, before, start);
            const beforeText =
              beforeRange && Editor.string(editor, beforeRange);
            const beforeMatch = beforeText && beforeText.match(/^\{(\w+)$/);
            const after = Editor.after(editor, start);
            const afterRange = Editor.range(editor, start, after);
            const afterText = Editor.string(editor, afterRange);
            const afterMatch = afterText.match(/^(\s|$)/);

            if (beforeMatch && afterMatch) {
              setTarget(beforeRange);
              setSearch(beforeMatch[1]);
              setIndex(0);
              return;
            }
          }

          setTarget(null);
        }}
      >
        <div>
          <div className="flex justify-between">
            <label
              htmlFor={id}
              className="block text-sm font-medium text-gray-700"
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
            <Editable
              className={clsx(
                'sm:text-sm rounded-md block w-full border p-2',
                {
                  'pr-10 border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500':
                    errorMessage,
                  'shadow-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300':
                    !errorMessage,
                },
                className
              )}
              renderElement={renderElement}
              onKeyDown={onKeyDown}
              placeholder={props.placeholder}
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck="false"
            />
            <ul className="mt-1">
              {tags.map((tag) => (
                <span className="mr-1 mb-0.5 inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-gray-100 text-gray-800">
                  {tag}
                </span>
              ))}
            </ul>
          </div>
        </div>
        {target && chars.length > 0 && (
          <Portal>
            <div
              ref={ref}
              className="absolute p-1 z-10 rounded-md bg-white shadow-md"
              style={{
                top: '-9999px',
                left: '-9999px',
              }}
            >
              {chars.map((char, i) => (
                <div
                  key={char}
                  className="rounded-md p-0.5"
                  style={{
                    background: i === index ? '#B4D5FF' : 'transparent',
                  }}
                >
                  {char}
                </div>
              ))}
            </div>
          </Portal>
        )}
      </Slate>
      <input type="hidden" name={name} defaultValue={defaultValue} />
    </>
  );
}

const withTags = (editor: Editor) => {
  const { isInline, isVoid } = editor;

  editor.isInline = (element) => {
    return element.type === 'tag' ? true : isInline(element);
  };

  editor.isVoid = (element) => {
    return element.type === 'tag' ? true : isVoid(element);
  };

  return editor;
};

const insertTag = (editor: Editor, tag: string) => {
  const node: Tag = {
    type: 'tag',
    tag,
    children: [{ text: '' }],
  };
  Transforms.insertNodes(editor, node);
  Transforms.move(editor);
};

type ElementProps = {
  element: CustomElement;
  attributes: PropsWithChildren<'span'>;
  children?: ReactNode;
};

const Element = (props: ElementProps) => {
  const { attributes, children, element } = props;
  switch (element.type) {
    case 'tag':
      return <TagElement {...props} element={element} />;
    default:
      return <p {...attributes}>{children}</p>;
  }
};

const TagElement = ({
  attributes,
  children,
  element,
}: ElementProps & { element: Tag }) => {
  const selected = useSelected();
  const focused = useFocused();
  return (
    <span
      {...attributes}
      contentEditable={false}
      className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-gray-100 text-gray-800"
      style={{
        boxShadow: selected && focused ? '0 0 0 2px #B4D5FF' : 'none',
      }}
    >
      {element.tag}
      {children}
    </span>
  );
};
