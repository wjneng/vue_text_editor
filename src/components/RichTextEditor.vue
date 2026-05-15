<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { isClickBelowLastLine, shouldResetBlockOnEnter } from '../editor/keyBehavior';
import { clipboardContentToEditorHtml, editorHtmlToMarkdown, sanitizeEditorHtml, taggedTextToEditorHtml } from '../editor/richText';
import { appendTableColumnHtml, appendTableRowHtml } from '../editor/tableEditing';

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  initialValue: {
    type: String,
    default: '<p><br></p>'
  },
  minHeight: {
    type: String,
    default: '580px'
  },
  label: {
    type: String,
    default: '编辑'
  },
  clearable: {
    type: Boolean,
    default: true
  },
  enabledTools: {
    type: Array,
    default: null
  },
  imageMode: {
    type: String,
    default: 'data',
    validator: (value) => ['data', 'url'].includes(value)
  },
  uploadImage: {
    type: Function,
    default: null
  },
  videoMode: {
    type: String,
    default: 'data',
    validator: (value) => ['data', 'url'].includes(value)
  },
  uploadVideo: {
    type: Function,
    default: null
  },
  placeholder: {
    type: String,
    default: ''
  },
  readonly: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits([
  'update:modelValue',
  'change',
  'focus',
  'blur',
  'image-upload-start',
  'image-upload-end',
  'image-upload-error',
  'video-upload-start',
  'video-upload-end',
  'video-upload-error'
]);

const editorRef = ref(null);
const rootRef = ref(null);
const fileInputRef = ref(null);
const videoInputRef = ref(null);
const textColorInputRef = ref(null);
const backgroundColorInputRef = ref(null);
const savedRange = ref(null);
const pendingFontFamilyRange = ref(null);
const pendingFontSizeRange = ref(null);
const pendingTextColorRange = ref(null);
const pendingBackgroundColorRange = ref(null);
const selectedTextBlock = ref('p');
const textBlockMenuOpen = ref(false);
const fontFamilyMenuOpen = ref(false);
const fontSizeMenuOpen = ref(false);
const imageMenuOpen = ref(false);
const imageUrlValue = ref('');
const videoMenuOpen = ref(false);
const videoUrlValue = ref('');
const linkDialogOpen = ref(false);
const linkUrlValue = ref('');
const linkTextValue = ref('');
const linkImageHtml = ref('');
const imageUploading = ref(false);
const videoUploading = ref(false);
const activeTooltip = ref('');
const activeTable = ref(null);
const currentHtml = ref(sanitizeEditorHtml(props.modelValue || props.initialValue));
const defaultTextColor = '#172026';
const currentTextColor = ref(defaultTextColor);
const defaultBackgroundColor = '#fff3bf';
const currentBackgroundColor = ref(defaultBackgroundColor);
const currentFontFamily = ref('system-ui, sans-serif');
const currentFontSize = ref('16px');
const hasSelectedText = ref(false);
const initialRenderHtml = currentHtml.value;

const textBlockOptions = [
  { label: '正文', value: 'p' },
  { label: 'H1', value: 'h1' },
  { label: 'H2', value: 'h2' },
  { label: 'H3', value: 'h3' },
  { label: 'H4', value: 'h4' },
  { label: 'H5', value: 'h5' },
  { label: 'H6', value: 'h6' }
];

const blockTools = [
  { key: 'blockquote', label: '引用', icon: '❝', command: 'formatBlock', value: 'blockquote' },
  { key: 'codeBlock', label: '代码块', icon: '{ }', command: 'formatBlock', value: 'pre' }
];

const inlineTools = [
  { key: 'bold', label: 'B', command: 'bold', title: '加粗' },
  { key: 'italic', label: 'I', command: 'italic', title: '斜体' },
  { key: 'underline', label: 'U', command: 'underline', title: '下划线' },
  { key: 'strike', label: 'S', command: 'strikeThrough', title: '删除线' },
  { key: 'inlineCode', label: '</>', command: 'formatBlock', value: 'p', wrap: 'code', title: '行内代码' }
];

const fontSizeOptions = [
  { label: '12', value: '12px' },
  { label: '14', value: '14px' },
  { label: '16', value: '16px' },
  { label: '18', value: '18px' },
  { label: '20', value: '20px' },
  { label: '24', value: '24px' },
  { label: '28', value: '28px' },
  { label: '32', value: '32px' }
];

const fontFamilyOptions = [
  { label: '默认', value: 'system-ui, sans-serif' },
  { label: '苹方', value: "'PingFang SC', sans-serif" },
  { label: '微软雅黑', value: "'Microsoft YaHei', 'PingFang SC', sans-serif" },
  { label: '黑体', value: 'SimHei, sans-serif' },
  { label: '宋体', value: 'SimSun, serif' },
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: '等宽', value: "'SFMono-Regular', Consolas, 'Liberation Mono', monospace" }
];

const allToolKeys = [
  'heading',
  'blockquote',
  'codeBlock',
  'bold',
  'italic',
  'underline',
  'strike',
  'inlineCode',
  'fontFamily',
  'fontSize',
  'textColor',
  'backgroundColor',
  'unorderedList',
  'orderedList',
  'table',
  'link',
  'divider',
  'image',
  'video'
];

const enabledToolSet = computed(() => new Set(
  Array.isArray(props.enabledTools) && props.enabledTools.length
    ? normalizeEnabledTools(props.enabledTools)
    : allToolKeys
));

const enabledTextBlockOptions = computed(() => (
  enabledToolSet.value.has('heading') ? textBlockOptions : textBlockOptions.slice(0, 1)
));

const visibleBlockTools = computed(() => blockTools.filter((tool) => enabledToolSet.value.has(tool.key)));
const visibleInlineTools = computed(() => inlineTools.filter((tool) => enabledToolSet.value.has(tool.key)));
const showTextBlockSelect = computed(() => enabledToolSet.value.has('heading'));
const showUnorderedListTool = computed(() => enabledToolSet.value.has('unorderedList'));
const showOrderedListTool = computed(() => enabledToolSet.value.has('orderedList'));
const showTableTool = computed(() => enabledToolSet.value.has('table'));
const showTableActions = computed(() => showTableTool.value && Boolean(activeTable.value));
const showLinkTool = computed(() => enabledToolSet.value.has('link'));
const showDividerTool = computed(() => enabledToolSet.value.has('divider'));
const showImageTool = computed(() => enabledToolSet.value.has('image'));
const showVideoTool = computed(() => enabledToolSet.value.has('video'));
const showFontFamilyTool = computed(() => enabledToolSet.value.has('fontFamily'));
const showFontSizeTool = computed(() => enabledToolSet.value.has('fontSize'));
const showTextColorTool = computed(() => enabledToolSet.value.has('textColor'));
const showBackgroundColorTool = computed(() => enabledToolSet.value.has('backgroundColor'));
const canApplyFontFamily = computed(() => isEditable.value && hasSelectedText.value);
const canApplyFontSize = computed(() => isEditable.value && hasSelectedText.value);
const canApplyTextColor = computed(() => isEditable.value && hasSelectedText.value);
const canApplyBackgroundColor = computed(() => isEditable.value && hasSelectedText.value);

const selectedTextBlockLabel = computed(
  () => enabledTextBlockOptions.value.find((option) => option.value === selectedTextBlock.value)?.label || '正文'
);
const currentFontFamilyLabel = computed(
  () => fontFamilyOptions.find((option) => option.value === currentFontFamily.value)?.label || '默认'
);

const editorStyle = computed(() => ({
  minHeight: props.minHeight
}));
const isEditable = computed(() => !props.readonly && !props.disabled);

watch(
  () => props.modelValue,
  (value) => {
    const sanitized = sanitizeEditorHtml(value || props.initialValue);
    if (sanitized === currentHtml.value) {
      return;
    }

    currentHtml.value = sanitized;
    if (editorRef.value && editorRef.value.innerHTML !== sanitized) {
      editorRef.value.innerHTML = sanitized;
    }
  }
);

onMounted(() => {
  document.addEventListener('pointerdown', handleOutsidePointerDown);
  document.addEventListener('selectionchange', handleSelectionChange);
});

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', handleOutsidePointerDown);
  document.removeEventListener('selectionchange', handleSelectionChange);
});

function runCommand(tool) {
  if (!isEditable.value) {
    return;
  }
  hideTooltip();
  focusEditor();
  if (tool.wrap === 'code') {
    wrapSelectionWithCode();
    syncEditorHtml();
    return;
  }

  document.execCommand(tool.command, false, tool.value);
  syncEditorHtml();
  saveSelection();
}

function applyTextBlockStyle(value) {
  if (!isEditable.value) {
    return;
  }
  hideTooltip();
  if (!value) {
    return;
  }

  selectedTextBlock.value = value;
  textBlockMenuOpen.value = false;
  runCommand({ command: 'formatBlock', value });
}

function toggleTextBlockMenu() {
  if (!isEditable.value) {
    return;
  }
  hideTooltip();
  saveSelection();
  fontFamilyMenuOpen.value = false;
  fontSizeMenuOpen.value = false;
  imageMenuOpen.value = false;
  videoMenuOpen.value = false;
  linkDialogOpen.value = false;
  textBlockMenuOpen.value = !textBlockMenuOpen.value;
}

function handleOutsidePointerDown(event) {
  if (!textBlockMenuOpen.value && !fontFamilyMenuOpen.value && !fontSizeMenuOpen.value && !imageMenuOpen.value && !videoMenuOpen.value && !linkDialogOpen.value) {
    return;
  }

  if (!rootRef.value?.contains(event.target)) {
    closeToolbarMenus();
  }
}

function closeToolbarMenus() {
  textBlockMenuOpen.value = false;
  fontFamilyMenuOpen.value = false;
  fontSizeMenuOpen.value = false;
  imageMenuOpen.value = false;
  videoMenuOpen.value = false;
  linkDialogOpen.value = false;
}

function showTooltip(label) {
  activeTooltip.value = label;
}

function hideTooltip() {
  activeTooltip.value = '';
}

function handleTooltipTouchStart(label) {
  showTooltip(label);
}

function normalizeEnabledTools(tools) {
  const normalized = new Set(tools);
  if (normalized.has('list')) {
    normalized.add('unorderedList');
    normalized.add('orderedList');
  }
  return [...normalized];
}

function clearEditor() {
  if (!isEditable.value) {
    return;
  }
  if (editorRef.value) {
    editorRef.value.innerHTML = '<p><br></p>';
  }
  setEditorHtml('<p><br></p>');
  currentTextColor.value = defaultTextColor;
  currentBackgroundColor.value = defaultBackgroundColor;
  currentFontFamily.value = 'system-ui, sans-serif';
  currentFontSize.value = '16px';
  focusEditor();
}

function syncEditorHtml() {
  if (!isEditable.value) {
    return;
  }
  if (!editorRef.value) {
    return;
  }

  const convertedHtml = taggedTextToEditorHtml(editorRef.value.innerText);
  if (convertedHtml) {
    editorRef.value.innerHTML = convertedHtml;
  }

  setEditorHtml(editorRef.value.innerHTML);
}

function setEditorHtml(value) {
  const sanitized = sanitizeEditorHtml(value);
  currentHtml.value = sanitized;
  emit('update:modelValue', sanitized);
  emit('change', sanitized);
}

function saveSelection() {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0 || !editorRef.value) {
    hasSelectedText.value = false;
    return;
  }

  const range = selection.getRangeAt(0);
  if (editorRef.value.contains(range.commonAncestorContainer)) {
    savedRange.value = range.cloneRange();
    hasSelectedText.value = isTextRangeSelected(range);
    updateActiveTable(range.commonAncestorContainer);
    updateFontFamilyFromRange(range);
    return;
  }

  hasSelectedText.value = false;
}

function handleSelectionChange() {
  if (!editorRef.value) {
    hasSelectedText.value = false;
    return;
  }

  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    hasSelectedText.value = false;
    return;
  }

  const range = selection.getRangeAt(0);
  if (editorRef.value.contains(range.commonAncestorContainer)) {
    hasSelectedText.value = isTextRangeSelected(range);
    updateFontFamilyFromRange(range);
    return;
  }

  hasSelectedText.value = false;
}

function handlePaste(event) {
  if (!isEditable.value) {
    return;
  }
  const html = event.clipboardData?.getData('text/html');
  const text = event.clipboardData?.getData('text/plain');
  const converted = clipboardContentToEditorHtml({ html, text });

  if (!converted) {
    return;
  }

  event.preventDefault();
  insertHtmlAtCursor(converted);
  syncEditorHtml();
}

function handleEditorKeydown(event) {
  if (!isEditable.value) {
    return;
  }
  if (event.key !== 'Enter' || event.shiftKey) {
    return;
  }

  const currentBlock = findCurrentBlock();
  if (!currentBlock || !shouldResetBlockOnEnter(currentBlock.tagName)) {
    return;
  }

  event.preventDefault();
  insertPlainParagraphAfter(currentBlock);
  syncEditorHtml();
}

function handleEditorClick(event) {
  if (!isEditable.value) {
    return;
  }
  const clickedTagName = event.target?.tagName?.toLowerCase();
  if (clickedTagName === 'img' || clickedTagName === 'video') {
    selectNode(event.target);
    saveSelection();
    return;
  }

  if (event.target !== editorRef.value) {
    saveSelection();
    return;
  }

  const lastChild = findLastContentChild();
  if (!lastChild) {
    ensureTrailingParagraph();
    return;
  }

  if (
    isClickBelowLastLine(
      editorRef.value.getBoundingClientRect(),
      lastChild.getBoundingClientRect(),
      event.clientY
    )
  ) {
    ensureTrailingParagraph();
  } else {
    saveSelection();
  }
}

function openImagePicker() {
  if (!isEditable.value) {
    return;
  }
  imageMenuOpen.value = false;
  saveSelection();
  focusEditor();
  fileInputRef.value?.click();
}

function handleImageButtonClick() {
  if (!isEditable.value) {
    return;
  }
  hideTooltip();
  saveSelection();
  textBlockMenuOpen.value = false;
  videoMenuOpen.value = false;
  imageMenuOpen.value = !imageMenuOpen.value;
}

function insertImageUrl() {
  if (!isEditable.value) {
    return;
  }
  hideTooltip();
  const url = imageUrlValue.value.trim();
  if (!url) {
    return;
  }

  imageMenuOpen.value = false;
  imageUrlValue.value = '';
  insertImage(url, '图片链接');
  syncEditorHtml();
}

async function handleImageUpload(event) {
  if (!isEditable.value) {
    return;
  }
  const file = event.target.files?.[0];
  if (!file) {
    return;
  }

  try {
    imageUploading.value = true;
    emit('image-upload-start', file);
    const src = props.imageMode === 'url' ? await uploadImageToUrl(file) : await fileToDataUrl(file);
    const alt = file.name.replace(/\.[^.]+$/, '') || '图片';
    insertImage(src, alt);
    syncEditorHtml();
    emit('image-upload-end', { file, src });
  } catch (error) {
    emit('image-upload-error', { file, error });
  } finally {
    imageUploading.value = false;
    event.target.value = '';
  }
}

function openVideoPicker() {
  if (!isEditable.value) {
    return;
  }
  videoMenuOpen.value = false;
  saveSelection();
  focusEditor();
  videoInputRef.value?.click();
}

function handleVideoButtonClick() {
  if (!isEditable.value) {
    return;
  }
  hideTooltip();
  saveSelection();
  textBlockMenuOpen.value = false;
  imageMenuOpen.value = false;
  videoMenuOpen.value = !videoMenuOpen.value;
}

function insertVideoUrl() {
  if (!isEditable.value) {
    return;
  }
  hideTooltip();
  const url = videoUrlValue.value.trim();
  if (!url) {
    return;
  }

  videoMenuOpen.value = false;
  videoUrlValue.value = '';
  insertVideo(url);
  syncEditorHtml();
}

async function handleVideoUpload(event) {
  if (!isEditable.value) {
    return;
  }
  const file = event.target.files?.[0];
  if (!file) {
    return;
  }

  try {
    videoUploading.value = true;
    emit('video-upload-start', file);
    const src = props.videoMode === 'url' ? await uploadVideoToUrl(file) : await fileToDataUrl(file);
    insertVideo(src);
    syncEditorHtml();
    emit('video-upload-end', { file, src });
  } catch (error) {
    emit('video-upload-error', { file, error });
  } finally {
    videoUploading.value = false;
    event.target.value = '';
  }
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error || new Error('图片读取失败'));
    reader.readAsDataURL(file);
  });
}

async function uploadImageToUrl(file) {
  if (!props.uploadImage) {
    throw new Error('imageMode 为 url 时必须传入 uploadImage(file) 函数');
  }

  const result = await props.uploadImage(file);
  const url = typeof result === 'string' ? result : result?.url;
  if (!url) {
    throw new Error('uploadImage 必须返回图片 URL 字符串，或返回包含 url 字段的对象');
  }

  return url;
}

function insertImage(src, alt = '图片') {
  insertHtmlAtCursor(`<img src="${escapeAttribute(src)}" alt="${escapeAttribute(alt)}">`);
}

async function uploadVideoToUrl(file) {
  if (!props.uploadVideo) {
    throw new Error('videoMode 为 url 时必须传入 uploadVideo(file) 函数');
  }

  const result = await props.uploadVideo(file);
  const url = typeof result === 'string' ? result : result?.url;
  if (!url) {
    throw new Error('uploadVideo 必须返回视频 URL 字符串，或返回包含 url 字段的对象');
  }

  return url;
}

function insertVideo(src) {
  insertHtmlAtCursor(`<video src="${escapeAttribute(src)}" controls></video>`);
}

function insertHtmlAtCursor(html) {
  if (!isEditable.value) {
    return;
  }
  focusEditor();
  restoreSelection();
  document.execCommand('insertHTML', false, sanitizeEditorHtml(html));
  saveSelection();
}

function wrapSelectionWithCode() {
  if (!isEditable.value) {
    return;
  }
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
    document.execCommand('insertHTML', false, '<code>代码</code>');
    return;
  }

  const range = selection.getRangeAt(0);
  const code = document.createElement('code');
  code.textContent = range.toString();
  range.deleteContents();
  range.insertNode(code);
  selection.removeAllRanges();
}

function toggleFontFamilyMenu() {
  if (!canApplyFontFamily.value) {
    return;
  }
  hideTooltip();
  saveSelection();
  if (!canApplyFontFamily.value) {
    return;
  }
  pendingFontFamilyRange.value = savedRange.value?.cloneRange() || null;
  textBlockMenuOpen.value = false;
  fontSizeMenuOpen.value = false;
  imageMenuOpen.value = false;
  videoMenuOpen.value = false;
  linkDialogOpen.value = false;
  fontFamilyMenuOpen.value = !fontFamilyMenuOpen.value;
}

function applyFontFamily(fontFamily) {
  if (!isEditable.value || !isSafeFontFamily(fontFamily) || !isTextRangeSelected(pendingFontFamilyRange.value)) {
    return;
  }

  currentFontFamily.value = fontFamily;
  savedRange.value = pendingFontFamilyRange.value.cloneRange();
  fontFamilyMenuOpen.value = false;
  applyInlineStyle({ fontFamily });
}

function updateFontFamilyFromRange(range) {
  if (!range || !editorRef.value) {
    currentFontFamily.value = 'system-ui, sans-serif';
    return;
  }

  if (!range.collapsed) {
    const selectedFontFamilies = collectFontFamiliesInRange(range);
    currentFontFamily.value = selectedFontFamilies.size === 1
      ? [...selectedFontFamilies][0]
      : 'system-ui, sans-serif';
    return;
  }

  const node = range.startContainer?.nodeType === Node.TEXT_NODE
    ? range.startContainer.parentElement
    : range.startContainer;
  const fontFamily = findFontFamilyOnNode(node);
  currentFontFamily.value = fontFamily || 'system-ui, sans-serif';
}

function findFontFamilyOnNode(node) {
  let current = node;
  while (current && current !== editorRef.value) {
    if (current.nodeType === Node.ELEMENT_NODE) {
      const fontFamily = normalizeFontFamilyValue(current.style?.fontFamily || '');
      if (fontFamily) {
        return fontFamily;
      }
    }
    current = current.parentElement;
  }

  return '';
}

function collectFontFamiliesInRange(range) {
  const fontFamilies = new Set();
  const commonAncestor = range.commonAncestorContainer.nodeType === Node.TEXT_NODE
    ? range.commonAncestorContainer.parentElement
    : range.commonAncestorContainer;
  const walker = document.createTreeWalker(
    commonAncestor,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        if (!node.textContent.trim() || !range.intersectsNode(node)) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );

  const startNode = commonAncestor.nodeType === Node.TEXT_NODE ? commonAncestor : walker.nextNode();
  let currentNode = startNode;
  while (currentNode) {
    fontFamilies.add(findFontFamilyOnNode(currentNode.parentElement) || 'system-ui, sans-serif');
    currentNode = walker.nextNode();
  }

  return fontFamilies;
}

function toggleFontSizeMenu() {
  if (!canApplyFontSize.value) {
    return;
  }
  hideTooltip();
  saveSelection();
  if (!canApplyFontSize.value) {
    return;
  }
  pendingFontSizeRange.value = savedRange.value?.cloneRange() || null;
  textBlockMenuOpen.value = false;
  fontFamilyMenuOpen.value = false;
  imageMenuOpen.value = false;
  videoMenuOpen.value = false;
  linkDialogOpen.value = false;
  fontSizeMenuOpen.value = !fontSizeMenuOpen.value;
}

function applyFontSize(size) {
  if (!isEditable.value || !isSafeFontSize(size) || !isTextRangeSelected(pendingFontSizeRange.value)) {
    return;
  }

  currentFontSize.value = size;
  savedRange.value = pendingFontSizeRange.value.cloneRange();
  fontSizeMenuOpen.value = false;
  applyInlineStyle({ fontSize: size });
}

function openTextColorPicker() {
  if (!canApplyTextColor.value) {
    return;
  }
  hideTooltip();
  saveSelection();
  if (!canApplyTextColor.value) {
    return;
  }
  pendingTextColorRange.value = savedRange.value?.cloneRange() || null;
  closeToolbarMenus();
  textColorInputRef.value?.click();
}

function handleTextColorInput(event) {
  applyTextColor(event.target.value);
}

function applyTextColor(color) {
  if (!isEditable.value || !isSafeColor(color) || !isTextRangeSelected(pendingTextColorRange.value)) {
    return;
  }

  currentTextColor.value = normalizeColorValue(color);
  savedRange.value = pendingTextColorRange.value.cloneRange();
  applyInlineStyle({ color });
}

function openBackgroundColorPicker() {
  if (!canApplyBackgroundColor.value) {
    return;
  }
  hideTooltip();
  saveSelection();
  if (!canApplyBackgroundColor.value) {
    return;
  }
  pendingBackgroundColorRange.value = savedRange.value?.cloneRange() || null;
  closeToolbarMenus();
  backgroundColorInputRef.value?.click();
}

function handleBackgroundColorInput(event) {
  applyBackgroundColor(event.target.value);
}

function applyBackgroundColor(color) {
  if (!isEditable.value || !isSafeColor(color) || !isTextRangeSelected(pendingBackgroundColorRange.value)) {
    return;
  }

  currentBackgroundColor.value = normalizeColorValue(color);
  savedRange.value = pendingBackgroundColorRange.value.cloneRange();
  applyInlineStyle({ backgroundColor: color });
}

function applyInlineStyle(style) {
  focusEditor();
  restoreSelection();
  const selection = window.getSelection();
  const styleText = inlineStyleToText(style);
  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
    document.execCommand('insertHTML', false, `<span style="${styleText}">文字</span>`);
    syncEditorHtml();
    saveSelection();
    return;
  }

  const range = selection.getRangeAt(0);
  const span = document.createElement('span');
  Object.assign(span.style, style);
  span.textContent = range.toString();
  range.deleteContents();
  range.insertNode(span);
  selection.removeAllRanges();
  const newRange = document.createRange();
  newRange.selectNodeContents(span);
  selection.addRange(newRange);
  syncEditorHtml();
  saveSelection();
}

function inlineStyleToText(style) {
  return [
    style.fontFamily ? `font-family: ${style.fontFamily}` : '',
    style.fontSize ? `font-size: ${style.fontSize}` : '',
    style.color ? `color: ${style.color}` : '',
    style.backgroundColor ? `background-color: ${style.backgroundColor}` : ''
  ].filter(Boolean).join('; ');
}

function isTextRangeSelected(range) {
  return Boolean(range && !range.collapsed && range.toString().trim().length > 0);
}

function isSafeFontSize(value) {
  return fontSizeOptions.some((option) => option.value === value);
}

function isSafeFontFamily(value) {
  return fontFamilyOptions.some((option) => option.value === value);
}

function normalizeFontFamilyValue(value) {
  const normalized = String(value || '').replaceAll('"', "'").replace(/\s*,\s*/g, ', ').trim();
  return fontFamilyOptions.find((option) => option.value.replaceAll('"', "'") === normalized)?.value || '';
}

function openLinkDialog() {
  if (!isEditable.value) {
    return;
  }
  hideTooltip();
  const selection = window.getSelection();
  const selectedText = selection && !selection.isCollapsed ? selection.toString() : '';
  const selectedImage = findSelectedImage(selection);
  saveSelection();
  textBlockMenuOpen.value = false;
  imageMenuOpen.value = false;
  videoMenuOpen.value = false;
  linkUrlValue.value = 'https://';
  linkTextValue.value = selectedImage ? selectedImage.alt || '图片' : selectedText;
  linkImageHtml.value = selectedImage ? selectedImage.outerHTML : '';
  linkDialogOpen.value = true;
}

function insertLink() {
  if (!isEditable.value) {
    return;
  }
  hideTooltip();
  const href = linkUrlValue.value.trim();
  if (!href) {
    return;
  }

  const text = linkTextValue.value.trim() || href;
  const imageHtml = linkImageHtml.value;
  linkDialogOpen.value = false;
  linkUrlValue.value = '';
  linkTextValue.value = '';
  linkImageHtml.value = '';
  insertHtmlAtCursor(
    imageHtml
      ? `<a href="${escapeAttribute(href)}">${imageHtml}</a>`
      : `<a href="${escapeAttribute(href)}">${escapeHtml(text)}</a>`
  );
  syncEditorHtml();
}

function findSelectedImage(selection) {
  if (!selection || selection.rangeCount === 0 || selection.isCollapsed || !editorRef.value) {
    return null;
  }

  const range = selection.getRangeAt(0);
  const selectedNode = range.startContainer.childNodes?.[range.startOffset];
  if (selectedNode?.nodeType === Node.ELEMENT_NODE && selectedNode.tagName?.toLowerCase() === 'img') {
    return selectedNode;
  }

  const container = range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE
    ? range.commonAncestorContainer
    : range.commonAncestorContainer.parentElement;
  const image = container?.querySelector?.('img');
  return image && editorRef.value.contains(image) ? image : null;
}

function insertDivider() {
  if (!isEditable.value) {
    return;
  }
  hideTooltip();
  insertHtmlAtCursor('<hr><p><br></p>');
  syncEditorHtml();
}

function insertTable() {
  if (!isEditable.value) {
    return;
  }
  hideTooltip();
  insertHtmlAtCursor(
    '<table><thead><tr><th>标题</th><th>标题</th></tr></thead><tbody><tr><td>内容</td><td>内容</td></tr><tr><td>内容</td><td>内容</td></tr></tbody></table><p><br></p>'
  );
  syncEditorHtml();
  updateActiveTableFromSelection();
}

function appendRowToCurrentTable() {
  if (!isEditable.value) {
    return;
  }
  mutateActiveTable(appendTableRowHtml, (table) => table.querySelector('tbody tr:last-child td'));
}

function appendColumnToCurrentTable() {
  if (!isEditable.value) {
    return;
  }
  mutateActiveTable(appendTableColumnHtml, (table) => {
    const rows = [...table.querySelectorAll('tr')];
    return rows.find((row) => row.querySelector('td'))?.querySelector('td:last-child')
      || rows[0]?.querySelector('th:last-child, td:last-child');
  });
}

function mutateActiveTable(mutateHtml, getFocusCell) {
  if (!isEditable.value) {
    return;
  }
  hideTooltip();
  const table = getActiveTableElement();
  if (!table) {
    return;
  }

  const wrapper = document.createElement('div');
  wrapper.innerHTML = sanitizeEditorHtml(mutateHtml(table.outerHTML));
  const nextTable = wrapper.querySelector('table');
  if (!nextTable) {
    return;
  }

  table.replaceWith(nextTable);
  activeTable.value = nextTable;
  moveCaretToEnd(getFocusCell(nextTable) || nextTable);
  syncEditorHtml();
}

function getActiveTableElement() {
  if (!editorRef.value || !activeTable.value || !editorRef.value.contains(activeTable.value)) {
    updateActiveTableFromSelection();
  }

  return activeTable.value && editorRef.value?.contains(activeTable.value)
    ? activeTable.value
    : null;
}

function updateActiveTableFromSelection() {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    activeTable.value = null;
    return;
  }

  updateActiveTable(selection.getRangeAt(0).commonAncestorContainer);
}

function updateActiveTable(node) {
  if (!editorRef.value) {
    activeTable.value = null;
    return;
  }

  let element = node?.nodeType === Node.ELEMENT_NODE ? node : node?.parentElement;
  while (element && element !== editorRef.value) {
    if (element.tagName?.toLowerCase() === 'table') {
      activeTable.value = element;
      return;
    }
    element = element.parentElement;
  }

  activeTable.value = null;
}

function findCurrentBlock() {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0 || !editorRef.value) {
    return null;
  }

  let node = selection.anchorNode;
  if (node?.nodeType === Node.TEXT_NODE) {
    node = node.parentElement;
  }

  while (node && node !== editorRef.value) {
    if (node.nodeType === Node.ELEMENT_NODE && shouldResetBlockOnEnter(node.tagName)) {
      return node;
    }
    node = node.parentElement;
  }

  return null;
}

function insertPlainParagraphAfter(block) {
  const paragraph = document.createElement('p');
  paragraph.appendChild(document.createElement('br'));
  block.insertAdjacentElement('afterend', paragraph);
  moveCaretToStart(paragraph);
}

function ensureTrailingParagraph() {
  if (!isEditable.value) {
    return;
  }
  if (!editorRef.value) {
    return;
  }

  let paragraph = editorRef.value.lastElementChild;
  if (!paragraph || paragraph.tagName.toLowerCase() !== 'p' || paragraph.textContent.trim()) {
    paragraph = document.createElement('p');
    paragraph.appendChild(document.createElement('br'));
    editorRef.value.appendChild(paragraph);
  }

  moveCaretToStart(paragraph);
  syncEditorHtml();
}

function findLastContentChild() {
  if (!editorRef.value) {
    return null;
  }

  const children = [...editorRef.value.children];
  return children
    .slice()
    .reverse()
    .find((child) => child.textContent.trim() || child.querySelector('img, video'));
}

function moveCaretToStart(element) {
  const range = document.createRange();
  range.setStart(element, 0);
  range.collapse(true);

  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
  savedRange.value = range.cloneRange();
}

function moveCaretToEnd(element) {
  const range = document.createRange();
  range.selectNodeContents(element);
  range.collapse(false);

  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
  savedRange.value = range.cloneRange();
}

function selectNode(node) {
  const range = document.createRange();
  range.selectNode(node);

  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
  savedRange.value = range.cloneRange();
}

function focusEditor() {
  editorRef.value?.focus();
}

function setHtml(value) {
  if (editorRef.value) {
    editorRef.value.innerHTML = sanitizeEditorHtml(value);
  }
  setEditorHtml(value);
}

function getHtml() {
  return currentHtml.value;
}

function getMarkdown() {
  return editorHtmlToMarkdown(currentHtml.value);
}

defineExpose({
  clear: clearEditor,
  focus: focusEditor,
  getHtml,
  getMarkdown,
  insertHtml: insertHtmlAtCursor,
  insertImage,
  insertVideo,
  setHtml
});

function restoreSelection() {
  if (!savedRange.value) {
    return;
  }

  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(savedRange.value);
}

function escapeAttribute(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function isSafeColor(value) {
  return /^#[0-9a-f]{3}(?:[0-9a-f]{3})?$/i.test(String(value || '').trim());
}

function normalizeColorValue(value) {
  const color = String(value || '').trim();
  if (!color) {
    return '';
  }

  if (isSafeColor(color)) {
    return color.toLowerCase();
  }

  const rgbMatch = color.match(/^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*(?:0|1|0?\.\d+))?\s*\)$/i);
  if (!rgbMatch) {
    return color.toLowerCase();
  }

  const channels = rgbMatch.slice(1, 4).map(Number);
  if (channels.some((channel) => channel < 0 || channel > 255)) {
    return color.toLowerCase();
  }

  const toHex = (value) => value.toString(16).padStart(2, '0');
  return `#${channels.map(toHex).join('')}`;
}
</script>

<template>
  <section ref="rootRef" class="rv-editor panel editor-panel" aria-label="富文本编辑区">
    <div class="rv-editor__heading panel-heading">
      <h2>{{ label }}</h2>
      <button
        v-if="clearable && isEditable"
        type="button"
        class="rv-editor__danger-button danger-button"
        @click="clearEditor"
      >
        清空
      </button>
    </div>

    <div
      class="rv-editor__toolbar editor-toolbar"
      aria-label="样式快捷选择"
    >
      <div class="rv-editor__toolbar-row toolbar-row">
        <div class="rv-editor__dropdown toolbar-dropdown" :class="{ 'is-open': textBlockMenuOpen }">
          <button
            v-if="showTextBlockSelect"
            type="button"
            class="rv-editor__select toolbar-select"
            aria-label="段落样式"
            :aria-expanded="textBlockMenuOpen"
            data-tooltip="段落样式"
            :class="{ 'tooltip-visible': activeTooltip === '段落样式' }"
            @mouseenter="showTooltip('段落样式')"
            @mouseleave="hideTooltip"
            @focus="showTooltip('段落样式')"
            @blur="hideTooltip"
            @touchstart.passive="handleTooltipTouchStart('段落样式')"
            @touchend="hideTooltip"
            @touchcancel="hideTooltip"
            @click="toggleTextBlockMenu"
          >
            <span>{{ selectedTextBlockLabel }}</span>
            <span class="rv-editor__select-caret select-caret">▾</span>
          </button>
          <div v-if="textBlockMenuOpen" class="rv-editor__menu toolbar-menu">
            <button
              v-for="option in enabledTextBlockOptions"
              :key="option.value"
              type="button"
              :class="{ active: selectedTextBlock === option.value }"
              @click="applyTextBlockStyle(option.value)"
            >
              {{ option.label }}
            </button>
          </div>
        </div>
        <div
          v-if="showFontFamilyTool"
          class="rv-editor__dropdown toolbar-dropdown"
          :class="{ 'is-open': fontFamilyMenuOpen }"
        >
          <button
            type="button"
            class="rv-editor__select toolbar-select font-family-select"
            aria-label="字体"
            :aria-expanded="fontFamilyMenuOpen"
            data-tooltip="字体"
            :class="{ 'tooltip-visible': activeTooltip === '字体' }"
            @mouseenter="showTooltip('字体')"
            @mouseleave="hideTooltip"
            @focus="showTooltip('字体')"
            @blur="hideTooltip"
            @touchstart.passive="handleTooltipTouchStart('字体')"
            @touchend="hideTooltip"
            @touchcancel="hideTooltip"
            @mousedown.prevent
            @click="toggleFontFamilyMenu"
            :disabled="!canApplyFontFamily"
          >
            <span>{{ currentFontFamilyLabel }}</span>
            <span class="rv-editor__select-caret select-caret">▾</span>
          </button>
          <div v-if="fontFamilyMenuOpen" class="rv-editor__menu toolbar-menu font-family-menu">
            <button
              v-for="option in fontFamilyOptions"
              :key="option.value"
              type="button"
              :class="{ active: currentFontFamily === option.value }"
              :style="{ fontFamily: option.value }"
              @mousedown.prevent
              @click="applyFontFamily(option.value)"
            >
              {{ option.label }}
            </button>
          </div>
        </div>
        <button
          v-for="tool in visibleBlockTools"
          :key="`${tool.command}-${tool.value}`"
          type="button"
          class="rv-editor__icon-button icon-button"
          :title="tool.label"
          :aria-label="tool.label"
          :data-tooltip="tool.label"
          :class="{ 'tooltip-visible': activeTooltip === tool.label }"
          @mouseenter="showTooltip(tool.label)"
          @mouseleave="hideTooltip"
          @focus="showTooltip(tool.label)"
          @blur="hideTooltip"
          @touchstart.passive="handleTooltipTouchStart(tool.label)"
          @touchend="hideTooltip"
          @touchcancel="hideTooltip"
          @click="runCommand(tool)"
          @pointerdown="closeToolbarMenus"
        >
          {{ tool.icon }}
        </button>
        <button
          v-for="tool in visibleInlineTools"
          :key="tool.title"
          type="button"
          :title="tool.title"
          :data-tooltip="tool.title"
          :class="{ 'tooltip-visible': activeTooltip === tool.title }"
          @mouseenter="showTooltip(tool.title)"
          @mouseleave="hideTooltip"
          @focus="showTooltip(tool.title)"
          @blur="hideTooltip"
          @touchstart.passive="handleTooltipTouchStart(tool.title)"
          @touchend="hideTooltip"
          @touchcancel="hideTooltip"
          @click="runCommand(tool)"
          @pointerdown="closeToolbarMenus"
        >
          {{ tool.label }}
        </button>
        <div
          v-if="showFontSizeTool"
          class="rv-editor__dropdown toolbar-dropdown"
          :class="{ 'is-open': fontSizeMenuOpen }"
        >
          <button
            type="button"
            class="rv-editor__select toolbar-select"
            aria-label="文字大小"
            :aria-expanded="fontSizeMenuOpen"
            data-tooltip="文字大小"
            :class="{ 'tooltip-visible': activeTooltip === '文字大小' }"
            @mouseenter="showTooltip('文字大小')"
            @mouseleave="hideTooltip"
            @focus="showTooltip('文字大小')"
            @blur="hideTooltip"
            @touchstart.passive="handleTooltipTouchStart('文字大小')"
            @touchend="hideTooltip"
            @touchcancel="hideTooltip"
            @mousedown.prevent
            @click="toggleFontSizeMenu"
            :disabled="!canApplyFontSize"
          >
            <span>{{ currentFontSize.replace('px', '') }}</span>
            <span class="rv-editor__select-caret select-caret">▾</span>
          </button>
          <div v-if="fontSizeMenuOpen" class="rv-editor__menu toolbar-menu">
            <button
              v-for="option in fontSizeOptions"
              :key="option.value"
              type="button"
              :class="{ active: currentFontSize === option.value }"
              @mousedown.prevent
              @click="applyFontSize(option.value)"
            >
              {{ option.label }}
            </button>
          </div>
        </div>
        <div
          v-if="showTextColorTool"
          class="rv-editor__dropdown toolbar-dropdown"
        >
          <button
            type="button"
            aria-label="字体颜色"
            data-tooltip="字体颜色"
            :class="{ 'tooltip-visible': activeTooltip === '字体颜色' }"
            @mouseenter="showTooltip('字体颜色')"
            @mouseleave="hideTooltip"
            @focus="showTooltip('字体颜色')"
            @blur="hideTooltip"
            @touchstart.passive="handleTooltipTouchStart('字体颜色')"
            @touchend="hideTooltip"
            @touchcancel="hideTooltip"
            @mousedown.prevent
            @click="openTextColorPicker"
            :disabled="!canApplyTextColor"
          >
            <span class="color-button-icon">A</span>
          </button>
          <input
            ref="textColorInputRef"
            class="rv-editor__visually-hidden visually-hidden"
            type="color"
            :value="currentTextColor"
            aria-label="选择字体颜色"
            @input="handleTextColorInput"
          >
        </div>
        <div
          v-if="showBackgroundColorTool"
          class="rv-editor__dropdown toolbar-dropdown"
        >
          <button
            type="button"
            aria-label="文字背景色"
            data-tooltip="文字背景色"
            :class="{ 'tooltip-visible': activeTooltip === '文字背景色' }"
            @mouseenter="showTooltip('文字背景色')"
            @mouseleave="hideTooltip"
            @focus="showTooltip('文字背景色')"
            @blur="hideTooltip"
            @touchstart.passive="handleTooltipTouchStart('文字背景色')"
            @touchend="hideTooltip"
            @touchcancel="hideTooltip"
            @mousedown.prevent
            @click="openBackgroundColorPicker"
            :disabled="!canApplyBackgroundColor"
          >
            <span class="color-button-icon background-color-button-icon">A</span>
          </button>
          <input
            ref="backgroundColorInputRef"
            class="rv-editor__visually-hidden visually-hidden"
            type="color"
            :value="currentBackgroundColor"
            aria-label="选择文字背景色"
            @input="handleBackgroundColorInput"
          >
        </div>
        <button
          v-if="showUnorderedListTool"
          type="button"
          class="rv-editor__icon-button icon-button"
          title="无序列表"
          aria-label="无序列表"
          data-tooltip="无序列表"
          :class="{ 'tooltip-visible': activeTooltip === '无序列表' }"
          @mouseenter="showTooltip('无序列表')"
          @mouseleave="hideTooltip"
          @focus="showTooltip('无序列表')"
          @blur="hideTooltip"
          @touchstart.passive="handleTooltipTouchStart('无序列表')"
          @touchend="hideTooltip"
          @touchcancel="hideTooltip"
          @click="runCommand({ command: 'insertUnorderedList' })"
          @pointerdown="closeToolbarMenus"
        >
          ☰
        </button>
        <button
          v-if="showOrderedListTool"
          type="button"
          class="rv-editor__icon-button icon-button"
          title="有序列表"
          aria-label="有序列表"
          data-tooltip="有序列表"
          :class="{ 'tooltip-visible': activeTooltip === '有序列表' }"
          @mouseenter="showTooltip('有序列表')"
          @mouseleave="hideTooltip"
          @focus="showTooltip('有序列表')"
          @blur="hideTooltip"
          @touchstart.passive="handleTooltipTouchStart('有序列表')"
          @touchend="hideTooltip"
          @touchcancel="hideTooltip"
          @click="runCommand({ command: 'insertOrderedList' })"
          @pointerdown="closeToolbarMenus"
        >
          1.
        </button>
        <button
          v-if="showLinkTool"
          type="button"
          class="rv-editor__icon-button icon-button"
          title="链接"
          aria-label="链接"
          data-tooltip="链接"
          :class="{ 'tooltip-visible': activeTooltip === '链接' }"
          @mouseenter="showTooltip('链接')"
          @mouseleave="hideTooltip"
          @focus="showTooltip('链接')"
          @blur="hideTooltip"
          @touchstart.passive="handleTooltipTouchStart('链接')"
          @touchend="hideTooltip"
          @touchcancel="hideTooltip"
          @click="openLinkDialog"
          @pointerdown="closeToolbarMenus"
        >
          🔗
        </button>
        <button
          v-if="showTableTool"
          type="button"
          class="rv-editor__icon-button icon-button"
          title="表格"
          aria-label="表格"
          data-tooltip="表格"
          :class="{ 'tooltip-visible': activeTooltip === '表格' }"
          @mouseenter="showTooltip('表格')"
          @mouseleave="hideTooltip"
          @focus="showTooltip('表格')"
          @blur="hideTooltip"
          @touchstart.passive="handleTooltipTouchStart('表格')"
          @touchend="hideTooltip"
          @touchcancel="hideTooltip"
          @click="insertTable"
          @pointerdown="closeToolbarMenus"
        >
          ▦
        </button>
        <div v-if="showTableActions" class="rv-editor__table-actions table-actions" aria-label="表格操作">
          <button
            type="button"
            data-tooltip="增加行"
            :class="{ 'tooltip-visible': activeTooltip === '增加行' }"
            @mouseenter="showTooltip('增加行')"
            @mouseleave="hideTooltip"
            @focus="showTooltip('增加行')"
            @blur="hideTooltip"
            @touchstart.passive="handleTooltipTouchStart('增加行')"
            @touchend="hideTooltip"
            @touchcancel="hideTooltip"
            @click="appendRowToCurrentTable"
            @pointerdown.prevent
          >
            +行
          </button>
          <button
            type="button"
            data-tooltip="增加列"
            :class="{ 'tooltip-visible': activeTooltip === '增加列' }"
            @mouseenter="showTooltip('增加列')"
            @mouseleave="hideTooltip"
            @focus="showTooltip('增加列')"
            @blur="hideTooltip"
            @touchstart.passive="handleTooltipTouchStart('增加列')"
            @touchend="hideTooltip"
            @touchcancel="hideTooltip"
            @click="appendColumnToCurrentTable"
            @pointerdown.prevent
          >
            +列
          </button>
        </div>
        <button
          v-if="showDividerTool"
          type="button"
          class="rv-editor__icon-button icon-button"
          title="分割线"
          aria-label="分割线"
          data-tooltip="分割线"
          :class="{ 'tooltip-visible': activeTooltip === '分割线' }"
          @mouseenter="showTooltip('分割线')"
          @mouseleave="hideTooltip"
          @focus="showTooltip('分割线')"
          @blur="hideTooltip"
          @touchstart.passive="handleTooltipTouchStart('分割线')"
          @touchend="hideTooltip"
          @touchcancel="hideTooltip"
          @click="insertDivider"
          @pointerdown="closeToolbarMenus"
        >
          —
        </button>
        <button
          v-if="showImageTool"
          type="button"
          class="rv-editor__icon-button icon-button"
          title="图片"
          :aria-label="imageUploading ? '图片处理中' : '图片'"
          :aria-expanded="imageMenuOpen"
          :disabled="imageUploading"
          data-tooltip="图片"
          :class="{ 'tooltip-visible': activeTooltip === '图片' }"
          @mouseenter="showTooltip('图片')"
          @mouseleave="hideTooltip"
          @focus="showTooltip('图片')"
          @blur="hideTooltip"
          @touchstart.passive="handleTooltipTouchStart('图片')"
          @touchend="hideTooltip"
          @touchcancel="hideTooltip"
          @click="handleImageButtonClick"
        >
          {{ imageUploading ? '…' : '▧' }}
        </button>
        <button
          v-if="showVideoTool"
          type="button"
          class="rv-editor__icon-button icon-button"
          title="视频"
          :aria-label="videoUploading ? '视频处理中' : '视频'"
          :aria-expanded="videoMenuOpen"
          :disabled="videoUploading"
          data-tooltip="视频"
          :class="{ 'tooltip-visible': activeTooltip === '视频' }"
          @mouseenter="showTooltip('视频')"
          @mouseleave="hideTooltip"
          @focus="showTooltip('视频')"
          @blur="hideTooltip"
          @touchstart.passive="handleTooltipTouchStart('视频')"
          @touchend="hideTooltip"
          @touchcancel="hideTooltip"
          @click="handleVideoButtonClick"
        >
          {{ videoUploading ? '…' : '▶' }}
        </button>
      </div>
      <input
        ref="fileInputRef"
        class="rv-editor__visually-hidden visually-hidden"
        type="file"
        accept="image/*"
        @change="handleImageUpload"
      />
      <input
        ref="videoInputRef"
        class="rv-editor__visually-hidden visually-hidden"
        type="file"
        accept="video/*"
        @change="handleVideoUpload"
      />
    </div>

    <div
      v-if="imageMenuOpen"
      class="rv-editor__dialog-backdrop image-dialog-backdrop"
      role="presentation"
      @pointerdown.self="imageMenuOpen = false"
    >
      <section class="rv-editor__dialog image-dialog" role="dialog" aria-modal="true" aria-label="添加图片">
        <div class="rv-editor__dialog-heading image-dialog-heading">
          <h3>添加图片</h3>
          <button type="button" aria-label="关闭添加图片弹窗" @click="imageMenuOpen = false">
            ×
          </button>
        </div>
        <label class="rv-editor__url-field image-url-field">
          <span>图片链接</span>
          <input
            v-model="imageUrlValue"
            type="url"
            placeholder="https://..."
            @keydown.enter.prevent="insertImageUrl"
          />
        </label>
        <div class="rv-editor__dialog-actions image-dialog-actions">
          <button type="button" class="rv-editor__secondary-button secondary-button" @click="insertImageUrl">
            插入链接
          </button>
          <button
            type="button"
            class="rv-editor__primary-button primary-button"
            :title="imageMode === 'url' && !uploadImage ? '需要传入 uploadImage 函数' : '选择图片'"
            :disabled="imageMode === 'url' && !uploadImage"
            @click="openImagePicker"
          >
            选择图片
          </button>
        </div>
      </section>
    </div>

    <div
      v-if="videoMenuOpen"
      class="rv-editor__dialog-backdrop image-dialog-backdrop"
      role="presentation"
      @pointerdown.self="videoMenuOpen = false"
    >
      <section class="rv-editor__dialog image-dialog" role="dialog" aria-modal="true" aria-label="添加视频">
        <div class="rv-editor__dialog-heading image-dialog-heading">
          <h3>添加视频</h3>
          <button type="button" aria-label="关闭添加视频弹窗" @click="videoMenuOpen = false">
            ×
          </button>
        </div>
        <label class="rv-editor__url-field image-url-field">
          <span>视频链接</span>
          <input
            v-model="videoUrlValue"
            type="url"
            placeholder="https://..."
            @keydown.enter.prevent="insertVideoUrl"
          />
        </label>
        <div class="rv-editor__dialog-actions image-dialog-actions">
          <button type="button" class="rv-editor__secondary-button secondary-button" @click="insertVideoUrl">
            插入链接
          </button>
          <button
            type="button"
            class="rv-editor__primary-button primary-button"
            :title="videoMode === 'url' && !uploadVideo ? '需要传入 uploadVideo 函数' : '选择视频'"
            :disabled="videoMode === 'url' && !uploadVideo"
            @click="openVideoPicker"
          >
            选择视频
          </button>
        </div>
      </section>
    </div>

    <div
      v-if="linkDialogOpen"
      class="rv-editor__dialog-backdrop image-dialog-backdrop"
      role="presentation"
      @pointerdown.self="linkDialogOpen = false"
    >
      <section class="rv-editor__dialog image-dialog" role="dialog" aria-modal="true" aria-label="添加链接">
        <div class="rv-editor__dialog-heading image-dialog-heading">
          <h3>添加链接</h3>
          <button type="button" aria-label="关闭添加链接弹窗" @click="linkDialogOpen = false">
            ×
          </button>
        </div>
        <label class="rv-editor__url-field image-url-field">
          <span>链接地址</span>
          <input
            v-model="linkUrlValue"
            type="url"
            placeholder="https://..."
            @keydown.enter.prevent="insertLink"
          />
        </label>
        <label class="rv-editor__url-field image-url-field">
          <span>链接文本</span>
          <input
            v-model="linkTextValue"
            type="text"
            placeholder="显示文本"
            :disabled="Boolean(linkImageHtml)"
            @keydown.enter.prevent="insertLink"
          />
        </label>
        <div class="rv-editor__dialog-actions image-dialog-actions">
          <button type="button" class="rv-editor__secondary-button secondary-button" @click="linkDialogOpen = false">
            取消
          </button>
          <button type="button" class="rv-editor__primary-button primary-button" @click="insertLink">
            插入链接
          </button>
        </div>
      </section>
    </div>

    <article
      ref="editorRef"
      class="rv-editor__content rich-editor"
      :contenteditable="isEditable ? 'true' : 'false'"
      :data-placeholder="placeholder"
      :aria-readonly="readonly"
      :aria-disabled="disabled"
      :style="editorStyle"
      v-html="initialRenderHtml"
      @input="syncEditorHtml"
      @click="handleEditorClick"
      @pointerdown="closeToolbarMenus"
      @keydown="handleEditorKeydown"
      @keyup="saveSelection"
      @mouseup="saveSelection"
      @focus="emit('focus', $event)"
      @blur="emit('blur', $event)"
      @paste="handlePaste"
    />
  </section>
</template>
