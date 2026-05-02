import './components/rich-text-editor.css';

import RichTextEditor from './components/RichTextEditor.vue';

export { RichTextEditor };
export {
  editorHtmlToMarkdown,
  markdownToEditorHtml,
  sanitizeEditorHtml,
  taggedTextToEditorHtml,
  wrapHtmlDocument
} from './editor/richText';

export default {
  install(app) {
    app.component('RichTextEditor', RichTextEditor);
  }
};
