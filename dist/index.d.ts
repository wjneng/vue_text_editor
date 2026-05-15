import type { App, DefineComponent } from 'vue';

export type RichTextEditorTool =
  | 'heading'
  | 'blockquote'
  | 'codeBlock'
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strike'
  | 'inlineCode'
  | 'fontFamily'
  | 'fontSize'
  | 'textColor'
  | 'backgroundColor'
  | 'unorderedList'
  | 'orderedList'
  | 'list'
  | 'table'
  | 'link'
  | 'divider'
  | 'image'
  | 'video';

export type RichTextEditorImageMode = 'data' | 'url';
export type RichTextEditorVideoMode = 'data' | 'url';

export interface RichTextEditorImageUploadEndPayload {
  file: File;
  src: string;
}

export interface RichTextEditorImageUploadErrorPayload {
  file: File;
  error: unknown;
}

export interface RichTextEditorVideoUploadEndPayload {
  file: File;
  src: string;
}

export interface RichTextEditorVideoUploadErrorPayload {
  file: File;
  error: unknown;
}

export interface RichTextEditorProps {
  modelValue?: string;
  initialValue?: string;
  minHeight?: string;
  label?: string;
  clearable?: boolean;
  enabledTools?: RichTextEditorTool[] | null;
  imageMode?: RichTextEditorImageMode;
  uploadImage?: ((file: File) => Promise<string | { url: string }> | string | { url: string }) | null;
  videoMode?: RichTextEditorVideoMode;
  uploadVideo?: ((file: File) => Promise<string | { url: string }> | string | { url: string }) | null;
  placeholder?: string;
  readonly?: boolean;
  disabled?: boolean;
}

export interface RichTextEditorExpose {
  clear: () => void;
  focus: () => void;
  getHtml: () => string;
  getMarkdown: () => string;
  insertHtml: (html: string) => void;
  insertImage: (src: string, alt?: string) => void;
  insertVideo: (src: string) => void;
  setHtml: (html: string) => void;
}

export const RichTextEditor: DefineComponent<RichTextEditorProps>;

export function editorHtmlToMarkdown(value?: string): string;
export function markdownToEditorHtml(value?: string): string;
export function sanitizeEditorHtml(value?: string): string;
export function taggedTextToEditorHtml(value?: string): string | null;
export function wrapHtmlDocument(content: string): string;

declare const plugin: {
  install(app: App): void;
};

export default plugin;
