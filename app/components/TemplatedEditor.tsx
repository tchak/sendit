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
import {
  Editor,
  Transforms,
  Range,
  createEditor,
  Descendant,
  Element as SlateElement,
} from 'slate';
import { withHistory } from 'slate-history';
import {
  Slate,
  Editable,
  ReactEditor,
  withReact,
  useSelected,
  useFocused,
  useSlate,
} from 'slate-react';
import clsx from 'clsx';
import { matchSorter } from 'match-sorter';
import { isHotkey } from 'is-hotkey';
import {
  FaBold,
  FaItalic,
  FaUnderline,
  FaUndo,
  FaRedo,
  FaLink,
} from 'react-icons/fa';
import { useId } from '@reach/auto-id';

import type {
  Tag,
  Link,
  FormattedText,
  CustomElement,
} from '~/models/TemplateDocument';
import { isLink, isTag } from '~/models/TemplateDocument';
import { Button } from './Button';
import { InputGroup } from './Form';

const Portal = ({ children }: { children: ReactNode }) => {
  return typeof document === 'object'
    ? createPortal(children, document.body)
    : null;
};

function getDefaultValue(value?: Descendant[]): Descendant[] {
  if (!value || value.length == 0) {
    return [{ type: 'paragraph', children: [{ text: '' }] }];
  }
  return value;
}

function useEditorValue(
  initialValue?: Descendant[]
): [Descendant[], string, (value: Descendant[]) => void] {
  const [value, setValue] = useState<Descendant[]>(() =>
    getDefaultValue(initialValue)
  );
  const [defaultValue, setDefaultValue] = useState(() => JSON.stringify(value));
  return [
    value,
    defaultValue,
    (value: Descendant[]) => {
      setValue(value);
      setDefaultValue(JSON.stringify(value));
    },
  ];
}

export function TemplatedEditor<Name extends string = string>({
  id: inputId,
  label,
  tags,
  name,
  defaultValue: initialValue,
  description,
  errorMessage,
  className,
  ...props
}: {
  label: string;
  id?: string;
  name?: Name;
  placeholder?: string;
  tags: string[];
  defaultValue?: Descendant[];
  description?: string;
  errorMessage?: string;
  className?: string;
  required?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [value, defaultValue, setValue] = useEditorValue(initialValue);
  const [target, setTarget] = useState<Range | undefined | null>();
  const [index, setIndex] = useState(0);
  const [search, setSearch] = useState('');
  const renderLeaf = useCallback((props) => <Leaf {...props} />, []);
  const renderElement = useCallback((props) => <Element {...props} />, []);
  const editor = useMemo(
    () => withInline(withReact(withHistory(createEditor()))),
    []
  );
  const id = useId(inputId);

  const filteredTags = matchSorter(tags, search).slice(0, 10);

  const selectTag = useCallback(
    (tag: string) => {
      if (target) {
        Transforms.select(editor, target);
      }
      insertTag(editor, tag);
      setTarget(null);
    },
    [target, editor]
  );

  const onKeyDown = useCallback(
    (event) => {
      if (target) {
        switch (event.key) {
          case 'ArrowDown':
            event.preventDefault();
            setIndex(index >= filteredTags.length - 1 ? 0 : index + 1);
            break;
          case 'ArrowUp':
            event.preventDefault();
            setIndex(index <= 0 ? filteredTags.length - 1 : index - 1);
            break;
          case 'Tab':
          case 'Enter':
            event.preventDefault();
            selectTag(filteredTags[index]);
            break;
          case 'Escape':
            event.preventDefault();
            setTarget(null);
            break;
        }
      } else {
        if (isHotkey('mod+b', event)) {
          toggleMark(editor, 'bold');
        } else if (isHotkey('mod+i', event)) {
          toggleMark(editor, 'italic');
        } else if (isHotkey('mod+u', event)) {
          toggleMark(editor, 'underline');
        } else if (isHotkey('mod+`', event)) {
          toggleMark(editor, 'code');
        } else if (isHotkey('mod+n', event)) {
          removeMark(editor);
        }
      }
    },
    [index, search, target]
  );

  useEffect(() => {
    if (target && filteredTags.length > 0) {
      const el = ref.current;
      const domRange = ReactEditor.toDOMRange(editor, target);
      const rect = domRange.getBoundingClientRect();
      if (el) {
        el.style.top = `${rect.top + window.pageYOffset + 24}px`;
        el.style.left = `${rect.left + window.pageXOffset}px`;
      }
    }
  }, [filteredTags.length, editor, index, search, target]);

  return (
    <>
      <Slate
        editor={editor}
        value={value}
        onChange={(value) => {
          setValue(value);
          const { selection } = editor;

          if (selection && Range.isCollapsed(selection)) {
            const [start] = Range.edges(selection);
            const wordBefore = Editor.before(editor, start, { unit: 'word' });
            const before = wordBefore && Editor.before(editor, wordBefore);
            const beforeRange = before && Editor.range(editor, before, start);
            const beforeText =
              beforeRange && Editor.string(editor, beforeRange);
            const beforeMatch = beforeText && beforeText.match(/^\/(\w+)$/);
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
        <InputGroup
          id={id}
          label={label}
          description={description}
          errorMessage={errorMessage}
          required={props.required}
        >
          <Toolbar />

          <div
            className={clsx('mt-1', {
              'relative rounded-md shadow-sm': errorMessage,
            })}
          >
            <Editable
              aria-labelledby={`${id}-label`}
              className={clsx(
                'block min-h-[9rem] w-full rounded-md border p-2 sm:text-sm',
                {
                  'border-red-300 pr-10 text-red-900 placeholder-red-300 focus:border-red-500 focus:outline-none focus:ring-red-500':
                    errorMessage,
                  'border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500':
                    !errorMessage,
                },
                className
              )}
              renderLeaf={renderLeaf}
              renderElement={renderElement}
              onKeyDown={onKeyDown}
              placeholder={props.placeholder}
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck="false"
            />
            <ul role="list" className="mt-1">
              {tags.map((tag) => (
                <li key={tag} className="inline-flex">
                  <button
                    type="button"
                    onMouseDown={(event) => {
                      event.preventDefault();
                      selectTag(tag);
                    }}
                    className="mr-1 mb-0.5 items-center rounded-md bg-gray-100 px-2.5 py-0.5 text-sm font-medium text-gray-800"
                  >
                    {tag}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </InputGroup>
        {target && filteredTags.length > 0 && (
          <Portal>
            <div
              ref={ref}
              className="absolute z-10 rounded-md bg-white p-1 shadow-md"
              style={{
                top: '-9999px',
                left: '-9999px',
              }}
            >
              {filteredTags.map((tag, i) => (
                <button
                  key={tag}
                  type="button"
                  onMouseDown={(event) => {
                    event.preventDefault();
                    selectTag(tag);
                  }}
                  className={clsx(
                    'block w-full rounded-md px-1 py-0.5 text-left',
                    {
                      'bg-blue-200': i == index,
                    }
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>
          </Portal>
        )}
      </Slate>
      <input type="hidden" name={name} defaultValue={defaultValue} />
    </>
  );
}

const expression = /^https?:\/\//;
const regex = new RegExp(expression);
const isUrl = (text: string) => regex.test(text);

const withInline = (editor: Editor) => {
  const { isInline, isVoid, insertData } = editor;

  editor.isInline = (element) => {
    return isTag(element) || isLink(element) ? true : isInline(element);
  };

  editor.isVoid = (element) => {
    return isTag(element) ? true : isVoid(element);
  };

  editor.insertData = (data) => {
    const text = data.getData('text/plain');

    if (text && isUrl(text)) {
      wrapLink(editor, text);
    } else {
      insertData(data);
    }
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

const insertLink = (editor: Editor, url: string) => {
  if (editor.selection) {
    wrapLink(editor, url);
  }
};

const unwrapLink = (editor: Editor) => {
  Transforms.unwrapNodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === 'link',
  });
};

const wrapLink = (editor: Editor, url: string) => {
  if (isLinkActive(editor)) {
    unwrapLink(editor);
  }

  const { selection } = editor;
  const isCollapsed = selection && Range.isCollapsed(selection);
  const link: Link = {
    type: 'link',
    url,
    children: isCollapsed ? [{ text: url }] : [],
  };

  if (isCollapsed) {
    Transforms.insertNodes(editor, link);
  } else {
    Transforms.wrapNodes(editor, link, { split: true });
    Transforms.collapse(editor, { edge: 'end' });
  }
};

const removeMark = (editor: Editor) => {
  if (isMarkActive(editor, 'bold')) {
    Editor.removeMark(editor, 'bold');
  }
  if (isMarkActive(editor, 'italic')) {
    Editor.removeMark(editor, 'italic');
  }
  if (isMarkActive(editor, 'code')) {
    Editor.removeMark(editor, 'code');
  }
  if (isMarkActive(editor, 'underline')) {
    Editor.removeMark(editor, 'underline');
  }
};

const toggleMark = (
  editor: Editor,
  format: keyof Omit<FormattedText, 'text'>
) => {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

const isLinkActive = (editor: Editor) => {
  const [link] = Editor.nodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === 'link',
  });
  return !!link;
};

const isMarkActive = (
  editor: Editor,
  format: keyof Omit<FormattedText, 'text'>
) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

type ElementProps = {
  element: CustomElement;
  attributes: PropsWithChildren<'span'>;
  children?: ReactNode;
};

type LeafProps = {
  leaf: FormattedText;
  attributes: PropsWithChildren<'span'>;
  children?: ReactNode;
};

const Leaf = ({ attributes, children, leaf }: LeafProps) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }

  if (leaf.code) {
    children = <code>{children}</code>;
  }

  if (leaf.italic) {
    children = <em>{children}</em>;
  }

  if (leaf.underline) {
    children = <u>{children}</u>;
  }

  return (
    <span
      style={leaf.text == '' ? { paddingLeft: '0.1px' } : undefined}
      {...attributes}
    >
      {children}
    </span>
  );
};

const Element = (props: ElementProps) => {
  const { attributes, children, element } = props;
  switch (element.type) {
    case 'tag':
      return <TagElement {...props} element={element} />;
    case 'link':
      return <LinkElement {...props} element={element} />;
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
      className={clsx(
        'inline-flex items-center rounded-md bg-gray-100 px-2.5 py-0.5 text-sm font-medium text-gray-800',
        {
          'outline-none ring-2 ring-blue-300': selected && focused,
        }
      )}
    >
      {element.tag}
      {children}
    </span>
  );
};

const LinkElement = ({
  attributes,
  children,
  element,
}: ElementProps & { element: Link }) => {
  const selected = useSelected();
  const focused = useFocused();
  return (
    <a
      {...attributes}
      href={element.url}
      className={clsx('rounded-md text-blue-300 underline', {
        'outline-none ring-2 ring-blue-300 ring-offset-2': selected && focused,
      })}
    >
      <InlineChromiumBugfix />
      {children}
      <InlineChromiumBugfix />
    </a>
  );
};

// Put this at the start and end of an inline component to work around this Chromium bug:
// https://bugs.chromium.org/p/chromium/issues/detail?id=1249405
const InlineChromiumBugfix = () => (
  <span contentEditable={false} style={{ fontSize: 0 }}>
    ${String.fromCodePoint(160) /* Non-breaking space */}
  </span>
);

function Toolbar() {
  const editor = useSlate();
  const canUndo = editor.history.undos.length > 1;
  const canRedo = editor.history.redos.length > 0;

  return (
    <div className="mt-1 flex items-center justify-between">
      <div className="flex items-center">
        <Button
          onMouseDown={(event) => {
            event.preventDefault();
            toggleMark(editor, 'bold');
          }}
          isActive={isMarkActive(editor, 'bold')}
          size="sm"
          className="mr-1"
          aria-label="Bold"
          label="Bold"
        >
          <FaBold />
        </Button>
        <Button
          onMouseDown={(event) => {
            event.preventDefault();
            toggleMark(editor, 'italic');
          }}
          isActive={isMarkActive(editor, 'italic')}
          size="sm"
          className="mr-1"
          aria-label="Italic"
          label="Italic"
        >
          <FaItalic />
        </Button>
        <Button
          onMouseDown={(event) => {
            event.preventDefault();
            toggleMark(editor, 'underline');
          }}
          isActive={isMarkActive(editor, 'underline')}
          size="sm"
          className="mr-3"
          aria-label="Underline"
          label="Underline"
        >
          <FaUnderline />
        </Button>
        <Button
          onMouseDown={(event) => {
            event.preventDefault();
            if (isLinkActive(editor)) {
              unwrapLink(editor);
            } else {
              const url = window.prompt('Enter the URL of the link:');
              if (url) {
                insertLink(editor, url);
              }
            }
          }}
          isActive={isLinkActive(editor)}
          size="sm"
          aria-label="Link"
          label="Link"
        >
          <FaLink />
        </Button>
      </div>

      <div className="flex items-center">
        <Button
          onMouseDown={(event) => {
            event.preventDefault();
            editor.undo();
          }}
          size="sm"
          className="mr-1"
          disabled={!canUndo}
          aria-label="Undo"
          label="Undo"
        >
          <FaUndo />
        </Button>
        <Button
          onMouseDown={(event) => {
            event.preventDefault();
            editor.redo();
          }}
          size="sm"
          disabled={!canRedo}
          aria-label="Redo"
          label="Redo"
        >
          <FaRedo />
        </Button>
      </div>
    </div>
  );
}
