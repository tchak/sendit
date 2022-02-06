import { BaseEditor } from 'slate';
import { ReactEditor } from 'slate-react';
import { HistoryEditor } from 'slate-history';
import { z } from 'zod';

const FormattedText = z.object({
  text: z.string(),
  bold: z.boolean().optional(),
  italic: z.boolean().optional(),
  code: z.boolean().optional(),
  underline: z.boolean().optional(),
});
export type FormattedText = z.infer<typeof FormattedText>;

const Tag = z.object({
  type: z.literal('tag'),
  tag: z.string(),
  children: FormattedText.array(),
});
export type Tag = z.infer<typeof Tag>;

const Link = z.object({
  type: z.literal('link'),
  url: z.string(),
  children: z.union([FormattedText, Tag]).array(),
});
export type Link = z.infer<typeof Link>;

export const Descendant = z.union([Link, Tag, FormattedText]);
export type Descendant = z.infer<typeof Descendant>;

const ListItem = z.object({
  type: z.literal('list-item'),
  children: Descendant.array(),
});
export type ListItem = z.infer<typeof ListItem>;

const NumberedList = z.object({
  type: z.literal('numbered-list'),
  children: ListItem.array(),
});
export type NumberedList = z.infer<typeof NumberedList>;

const BulletedList = z.object({
  type: z.literal('bulleted-list'),
  children: ListItem.array(),
});
export type BulletedList = z.infer<typeof BulletedList>;

const Paragraph = z.object({
  type: z.literal('paragraph'),
  children: Descendant.array(),
});
export type Paragraph = z.infer<typeof Paragraph>;

const Quote = z.object({
  type: z.literal('quote'),
  children: Descendant.array(),
});
export type Quote = z.infer<typeof Quote>;

const Block = z.union([Paragraph, Quote, NumberedList, BulletedList]);
export type Block = z.infer<typeof Block>;
export const Document = Block.array();
export type Document = z.infer<typeof Document>;

export type CustomElement =
  | Paragraph
  | Quote
  | BulletedList
  | NumberedList
  | ListItem
  | Link
  | Tag;

export function isList(node: Block): node is NumberedList | BulletedList {
  return node.type == 'numbered-list' || node.type == 'bulleted-list';
}
export function isTag(node: Descendant): node is Tag {
  return 'type' in node && node.type == 'tag';
}
export function isLink(node: Descendant): node is Link {
  return 'type' in node && node.type == 'link';
}
export function isText(node: Descendant): node is FormattedText {
  return 'text' in node;
}

declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor & HistoryEditor;
    Element: CustomElement;
    Text: FormattedText;
  }
}
