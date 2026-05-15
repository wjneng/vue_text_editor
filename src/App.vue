<script setup>
import { computed, ref, watch } from 'vue';
import RichTextEditor from './components/RichTextEditor.vue';
import {
  editorHtmlToMarkdown,
  markdownToEditorHtml,
  sanitizeEditorHtml,
  taggedTextToEditorHtml,
  wrapHtmlDocument
} from './editor/richText';

const initialEditorHtml = [
  '<h1>移动与桌面都好用的编辑器</h1>',
  '<p>选择任意文字后，可以设置 <strong>加粗</strong>、<em>斜体</em>、<u>下划线</u>、<s>删除线</s>、<code>行内代码</code>、<span style="font-family: Georgia, serif">字体</span>、<span style="font-size: 20px">文字大小</span>、<span style="color: #c0392b">字体颜色</span> 和 <span style="background-color: #fff3bf">文字背景色</span>。</p>',
  '<h2>段落样式</h2>',
  '<p><span style="font-family: SimSun, serif">宋体文本</span>、<span style="font-family: Georgia, serif">Georgia 文本</span>、<span style="font-size: 24px">24px 文本</span>、<span style="font-size: 14px">14px 文本</span>、<span style="color: #2563eb">蓝色文本</span>、<span style="color: #1f7a4d">绿色文本</span>、<span style="color: #7c3aed">紫色文本</span>、<span style="background-color: #dbeafe">蓝色背景</span> 会保留到 HTML 和 Markdown 预览里。</p>',
  '<blockquote>引用块适合放提示、备注或重点说明。图片和视频会插入到当前光标所在的位置。</blockquote>',
  '<ul><li>无序列表项目</li><li>支持继续编辑和追加内容</li></ul>',
  '<ol><li>有序列表第一项</li><li>有序列表第二项</li></ol>',
  '<pre><code>const message = "代码块示例";\nconsole.log(message);</code></pre>',
  '<table><thead><tr><th>功能</th><th>展示</th></tr></thead><tbody><tr><td>表格</td><td>可插入行和列</td></tr><tr><td>链接</td><td><a href="https://example.com">示例链接</a></td></tr></tbody></table>',
  '<hr>',
  '<p>普通文本里换行会保留：<br>第一行<br>第二行<br>第三行</p>'
].join('');

const modeOptions = [
  { key: 'pc', label: 'PC预览' },
  { key: 'mobile', label: '手机预览' },
  { key: 'html', label: 'HTML源码' },
  { key: 'markdown', label: 'Markdown源码' }
];

const editorHtml = ref(initialEditorHtml);
const selectedModes = ref(['pc']);
const htmlSourceText = ref('');
const markdownSourceText = ref('');
const editingSource = ref(false);
const paneSizes = ref([1]);
const multiViewFrameRef = ref(null);
const mobilePaneMinWidth = 430;

const htmlOutput = computed(() => sanitizeEditorHtml(editorHtml.value));
const markdownOutput = computed(() => editorHtmlToMarkdown(editorHtml.value));
const htmlDocumentOutput = computed(() => wrapHtmlDocument(htmlOutput.value));
const selectedSourceModes = computed(() => selectedModes.value.filter((mode) => isSourceMode(mode)));
const hasSourceMode = computed(() => selectedSourceModes.value.length > 0);
const editorPanelClass = computed(() => ({
  'source-view': hasSourceMode.value,
  'multi-view': selectedModes.value.length > 1
}));
const paneGridColumns = computed(() => (
  paneSizes.value
    .map((size, index) => {
      const mode = selectedModes.value[index];
      return mode === 'mobile'
        ? `minmax(${mobilePaneMinWidth}px, ${size}fr)`
        : `minmax(0, ${size}fr)`;
    })
    .join(' 8px ')
));

syncSourceFromEditor();

watch(editorHtml, () => {
  if (!editingSource.value) {
    syncSourceFromEditor();
  }
});

watch(
  () => selectedModes.value.length,
  (count) => {
    paneSizes.value = Array.from({ length: count }, () => 1);
  }
);

async function uploadDemoImage(file) {
  return URL.createObjectURL(file);
}

async function uploadDemoVideo(file) {
  return URL.createObjectURL(file);
}

async function copyOutput(mode) {
  try {
    await navigator.clipboard.writeText(getSourceText(mode));
  } catch {
    window.alert('复制失败，请手动选择文本');
  }
}

function downloadOutput(mode) {
  const isHtml = mode === 'html';
  const blob = new Blob([getSourceText(mode)], {
    type: isHtml ? 'text/html;charset=utf-8' : 'text/markdown;charset=utf-8'
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = isHtml ? 'document.html' : 'document.md';
  link.click();
  URL.revokeObjectURL(url);
}

function syncSourceFromEditor() {
  htmlSourceText.value = htmlDocumentOutput.value;
  markdownSourceText.value = markdownOutput.value;
}

function toggleMode(mode) {
  if (selectedModes.value.includes(mode)) {
    if (selectedModes.value.length === 1) {
      return;
    }
    selectedModes.value = selectedModes.value.filter((item) => item !== mode);
    return;
  }

  selectedModes.value = [...selectedModes.value, mode];
  syncSourceFromEditor();
}

function startPaneResize(index, event) {
  event.preventDefault();
  const container = multiViewFrameRef.value;
  if (!container) {
    return;
  }

  const startX = event.clientX;
  const startSizes = [...paneSizes.value];
  const rect = container.getBoundingClientRect();
  const totalWeight = startSizes.reduce((sum, size) => sum + size, 0);
  const pixelsPerWeight = rect.width / totalWeight;
  const minWeight = 0.35;

  const handlePointerMove = (moveEvent) => {
    const deltaWeight = (moveEvent.clientX - startX) / pixelsPerWeight;
    const leftMin = getPaneMinWeight(index, pixelsPerWeight);
    const rightMin = getPaneMinWeight(index + 1, pixelsPerWeight);
    const left = Math.max(leftMin, startSizes[index] + deltaWeight);
    const right = Math.max(rightMin, startSizes[index + 1] - deltaWeight);
    const pairTotal = startSizes[index] + startSizes[index + 1];
    const overflow = left + right - pairTotal;
    const nextSizes = [...startSizes];

    if (overflow > 0) {
      if (left === minWeight) {
        nextSizes[index] = left;
        nextSizes[index + 1] = pairTotal - left;
      } else {
        nextSizes[index + 1] = right;
        nextSizes[index] = pairTotal - right;
      }
    } else {
      nextSizes[index] = left;
      nextSizes[index + 1] = right;
    }

    paneSizes.value = nextSizes;
  };

  const stopResize = () => {
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', stopResize);
  };

  window.addEventListener('pointermove', handlePointerMove);
  window.addEventListener('pointerup', stopResize, { once: true });
}

function getPaneMinWeight(index, pixelsPerWeight) {
  if (selectedModes.value[index] === 'mobile') {
    return mobilePaneMinWidth / pixelsPerWeight;
  }

  return 0.35;
}

function handleSourceInput(mode, event) {
  editingSource.value = true;
  const value = event.target.value;

  if (mode === 'html') {
    htmlSourceText.value = value;
    editorHtml.value = taggedTextToEditorHtml(value) || sanitizeEditorHtml(value);
  } else {
    markdownSourceText.value = value;
    editorHtml.value = markdownToEditorHtml(value);
  }

  requestAnimationFrame(() => {
    editingSource.value = false;
  });
}

function getSourceText(mode) {
  return mode === 'html' ? htmlSourceText.value : markdownSourceText.value;
}

function isSourceMode(mode) {
  return mode === 'html' || mode === 'markdown';
}

function viewportClass(mode) {
  return {
    'viewport-mobile': mode === 'mobile',
    'viewport-pc': mode === 'pc',
    'viewport-source': isSourceMode(mode)
  };
}
</script>

<template>
  <main class="app-shell">
    <section class="workspace-grid single-view">
      <section class="panel preview-shell" :class="editorPanelClass" aria-label="预览区">
        <div class="panel-heading">
          <div class="panel-heading-main">
            <div class="mode-switch preview-switch" aria-label="预览模式">
              <button
                v-for="mode in modeOptions"
                :key="mode.key"
                type="button"
                :class="{ active: selectedModes.includes(mode.key) }"
                @click="toggleMode(mode.key)"
              >
                {{ mode.label }}
              </button>
            </div>
          </div>
          <div class="output-actions">
            <div class="download-dropdown">
              <button type="button" class="secondary-button">
                下载
              </button>
              <div class="download-menu">
                <button type="button" @click="downloadOutput('html')">
                  HTML
                </button>
                <button type="button" @click="downloadOutput('markdown')">
                  Markdown
                </button>
              </div>
            </div>
          </div>
        </div>
        <div
          ref="multiViewFrameRef"
          class="multi-view-frame"
          :style="{ gridTemplateColumns: paneGridColumns }"
        >
          <template v-for="(mode, index) in selectedModes" :key="mode">
            <section
              class="view-pane"
              :class="[{ 'source-pane': isSourceMode(mode) }, viewportClass(mode)]"
            >
              <div v-if="mode === 'html'" class="source-stage">
                <button type="button" class="source-copy-button" @click="copyOutput('html')">
                  复制
                </button>
                <textarea
                  :value="htmlSourceText"
                  rows="22"
                  spellcheck="false"
                  @input="handleSourceInput('html', $event)"
                />
              </div>
              <div v-else-if="mode === 'markdown'" class="source-stage">
                <button type="button" class="source-copy-button" @click="copyOutput('markdown')">
                  复制
                </button>
                <textarea
                  :value="markdownSourceText"
                  rows="22"
                  spellcheck="false"
                  @input="handleSourceInput('markdown', $event)"
                />
              </div>
              <div v-else class="preview-stage">
                <div class="device-screen">
                  <RichTextEditor
                    v-model="editorHtml"
                    image-mode="url"
                    video-mode="url"
                    min-height="0"
                    :upload-image="uploadDemoImage"
                    :upload-video="uploadDemoVideo"
                  />
                </div>
              </div>
            </section>
            <div
              v-if="index < selectedModes.length - 1"
              class="pane-resizer"
              role="separator"
              aria-orientation="vertical"
              @pointerdown="startPaneResize(index, $event)"
            />
          </template>
        </div>
      </section>
    </section>
  </main>
</template>

<style>
.app-shell {
  display: grid;
  grid-template-rows: minmax(0, 1fr);
  height: 100vh;
  padding: 0;
  overflow: hidden;
}

.mode-switch {
  display: grid;
  grid-template-columns: repeat(2, minmax(96px, 1fr));
  gap: 4px;
  padding: 4px;
  border: 1px solid #cfd8ce;
  border-radius: 8px;
  background: #ffffff;
}

.mode-switch button {
  min-height: 38px;
  border-radius: 6px;
  padding: 0 12px;
  color: #2f3a34;
  background: #eef3eb;
  font-size: 14px;
  font-weight: 700;
}

.mode-switch button.active {
  color: #ffffff;
  background: #245a48;
}

.workspace-grid {
  display: block;
  width: 100%;
  height: 100%;
  min-height: 0;
  margin: 0 auto;
}

.single-view {
  max-width: none;
}

.output-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.output-actions .active {
  color: #ffffff;
  background: #245a48;
}

.download-dropdown {
  position: relative;
}

.download-menu {
  position: absolute;
  z-index: 20;
  top: 100%;
  right: 0;
  display: grid;
  min-width: 128px;
  overflow: hidden;
  border: 1px solid #d2dccf;
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 12px 30px rgba(38, 49, 41, 0.16);
  opacity: 0;
  pointer-events: none;
  transform: translateY(-4px);
  transition: opacity 0.14s ease, transform 0.14s ease;
}

.download-dropdown::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: 100%;
  height: 8px;
}

.download-dropdown:hover .download-menu,
.download-dropdown:focus-within .download-menu {
  opacity: 1;
  pointer-events: auto;
  transform: translateY(0);
}

.download-menu button {
  min-height: 36px;
  padding: 0 12px;
  color: #2f3a34;
  background: #ffffff;
  font-size: 14px;
  font-weight: 700;
  text-align: left;
}

.download-menu button:hover,
.download-menu button:focus-visible {
  color: #245a48;
  background: #edf4ef;
  outline: none;
}

.rv-editor__heading-main {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}

.preview-shell {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  height: 100%;
  overflow: hidden;
}

.preview-shell.panel {
  border: 0;
  border-radius: 0;
  box-shadow: none;
}

.preview-shell .rv-editor__heading {
  padding: 8px 12px;
  border-bottom: 1px solid #e1e7df;
}

.preview-switch {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.multi-view-frame {
  display: grid;
  min-height: 0;
  padding: 6px;
  overflow: hidden;
  background: #d7ded5;
}

.view-pane {
  min-width: 0;
  min-height: 0;
  overflow: auto;
  background: #ffffff;
}

.pane-resizer {
  position: relative;
  min-width: 8px;
  cursor: col-resize;
  background: #d7ded5;
  touch-action: none;
}

.pane-resizer::before {
  content: '';
  position: absolute;
  inset: 0 3px;
  border-radius: 999px;
  background: #aebbae;
  opacity: 0.65;
}

.pane-resizer:hover::before {
  background: #245a48;
  opacity: 1;
}

.view-pane.viewport-mobile {
  display: grid;
  min-width: 430px;
  place-items: center;
  overflow: auto hidden;
}

.view-pane.viewport-pc {
  display: grid;
  place-items: stretch;
}

.source-pane {
  padding: 0;
  overflow: hidden;
  background: #101713;
}

.source-stage {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  height: 100%;
  min-height: 0;
  overflow: hidden;
  border: 1px solid #d7ded5;
  border-radius: 8px;
  background: #101713;
}

.source-pane .source-stage {
  border-color: #101713;
}

.source-copy-button {
  position: absolute;
  z-index: 2;
  top: 10px;
  right: 10px;
  min-height: 30px;
  border-radius: 6px;
  padding: 0 10px;
  color: #ffffff;
  background: #245a48;
  font-size: 12px;
  font-weight: 800;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.18);
}

.source-stage textarea {
  width: 100%;
  height: 100%;
  min-height: 0;
  resize: none;
  border: 0;
  padding: 16px;
  color: #eaf1ec;
  background: #101713;
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
  font-size: 13px;
  line-height: 1.6;
  outline: none;
  white-space: pre-wrap;
}

.preview-stage {
  min-height: 100%;
  margin: 0 auto;
  background: #ffffff;
}

.viewport-mobile .preview-stage,
.viewport-pc .preview-stage,
.device-screen {
  display: grid;
  grid-template-rows: minmax(0, 1fr);
  min-height: 0;
}

.viewport-mobile .preview-stage {
  position: relative;
  width: min(430px, calc((100vh - 190px) * 0.4774));
  height: min(900px, calc(100vh - 190px));
  aspect-ratio: 430 / 900;
  min-height: 0;
  min-width: min(430px, calc((100vh - 190px) * 0.4774));
  padding: 11px;
  border-radius: 52px;
  background:
    linear-gradient(145deg, #34383f, #15181d 45%, #0d0f13 100%);
  box-shadow:
    0 0 0 1px rgba(0, 0, 0, 0.04),
    inset 0 0 0 1px rgba(255, 255, 255, 0.08),
    inset 0 0 0 5px #20242a,
    0 22px 56px rgba(38, 49, 41, 0.24);
}

.viewport-mobile .preview-stage::before {
  content: '';
  position: absolute;
  z-index: 3;
  top: 24px;
  left: 50%;
  width: 31%;
  height: 3.7%;
  transform: translateX(-50%);
  border-radius: 999px;
  background: #0e1115;
  box-shadow:
    inset 0 -1px 0 rgba(255, 255, 255, 0.04),
    0 1px 2px rgba(255, 255, 255, 0.08);
}

.viewport-mobile .preview-stage::after {
  content: '';
  position: absolute;
  top: 5.8%;
  left: 50%;
  z-index: 4;
  width: 6px;
  height: 6px;
  transform: translateX(32px);
  border-radius: 50%;
  background: #1b2430;
  box-shadow: inset 0 0 0 1px rgba(117, 143, 176, 0.22);
}

.viewport-mobile .device-screen {
  position: relative;
  min-width: 0;
  overflow: hidden;
  border-radius: 42px;
  background: #ffffff;
}

.viewport-pc .preview-stage {
  width: 100%;
  aspect-ratio: auto;
  padding: 0;
  border: 0;
  border-radius: 0;
  box-shadow: none;
}

.viewport-pc .device-screen {
  min-width: 0;
  height: 100%;
}

.viewport-mobile .rv-editor,
.viewport-pc .rv-editor {
  min-width: 0;
  height: 100%;
  border: 0;
  border-radius: 30px;
  box-shadow: none;
  overflow: hidden;
}

.viewport-pc .rv-editor {
  border-radius: 0;
}

.viewport-pc .rv-editor__heading {
  min-width: 0;
  padding: 12px;
}

.viewport-pc .rv-editor__toolbar {
  min-width: 0;
  padding: 10px 12px;
}

.viewport-pc .rv-editor__toolbar-row {
  width: 100%;
  min-width: 0;
}

.viewport-pc .rv-editor__toolbar-row button {
  flex: 0 0 auto;
}

.viewport-pc .rv-editor__content {
  min-width: 0;
  padding: clamp(14px, 2vw, 26px);
  overflow-wrap: anywhere;
}

.viewport-pc .rv-editor__content h1 {
  font-size: clamp(24px, 3.2vw, 34px);
}

.viewport-pc .rv-editor__content h2 {
  font-size: clamp(21px, 2.6vw, 26px);
}

.viewport-pc .rv-editor__content h3 {
  font-size: clamp(18px, 2.1vw, 21px);
}

.viewport-pc .rv-editor__content h4 {
  font-size: clamp(16px, 1.8vw, 18px);
}

.viewport-pc .rv-editor__content h5 {
  font-size: clamp(15px, 1.6vw, 16px);
}

.viewport-pc .rv-editor__content h6 {
  font-size: clamp(13px, 1.4vw, 14px);
}

.viewport-pc .rv-editor__content table {
  display: block;
  max-width: 100%;
  overflow-x: auto;
}

.viewport-mobile .rv-editor {
  border-radius: 42px;
}

.viewport-mobile .rv-editor__heading {
  padding: 10px 8px;
}

.viewport-mobile .rv-editor__heading h2 {
  font-size: 15px;
}

.viewport-mobile .rv-editor__toolbar {
  padding: 10px 8px;
  position: relative;
  z-index: 20;
  overflow: visible;
}

.viewport-mobile .rv-editor__toolbar-row {
  width: 100%;
  min-width: 100%;
  padding-bottom: 4px;
}

.viewport-mobile .rv-editor__table-actions {
  flex: 0 0 auto;
}

.viewport-mobile .rv-editor__toolbar-row .rv-editor__table-actions button {
  min-width: 38px;
  padding: 0 6px;
  font-size: 13px;
}

.viewport-mobile .rv-editor__dropdown {
  z-index: 30;
}

.viewport-mobile .rv-editor__menu {
  left: 0;
  right: auto;
  z-index: 200;
  max-width: min(260px, calc(100vw - 72px));
}

.viewport-mobile .rv-editor__toolbar-row button[data-tooltip]::before,
.viewport-mobile .rv-editor__toolbar-row button[data-tooltip]::after {
  z-index: 300;
}

.viewport-mobile .rv-editor__dropdown:first-child .rv-editor__menu {
  left: 0;
  transform: none;
}

.viewport-mobile .rv-editor__content {
  padding: 18px 8px;
  font-size: 15px;
  line-height: 1.65;
  overflow-wrap: anywhere;
}

.viewport-mobile .rv-editor__content h1 {
  font-size: 25px;
  line-height: 1.18;
}

.viewport-mobile .rv-editor__content h2 {
  font-size: 21px;
}

.viewport-mobile .rv-editor__content h3 {
  font-size: 18px;
}

.viewport-mobile .rv-editor__content h4 {
  font-size: 16px;
}

.viewport-mobile .rv-editor__content h5 {
  font-size: 15px;
}

.viewport-mobile .rv-editor__content h6 {
  font-size: 13px;
}

.viewport-mobile .rv-editor__content code {
  word-break: break-word;
}

.viewport-mobile .rv-editor__content p,
.viewport-mobile .rv-editor__content blockquote,
.viewport-mobile .rv-editor__content ul,
.viewport-mobile .rv-editor__content ol,
.viewport-mobile .rv-editor__content pre,
.viewport-mobile .rv-editor__content figure {
  margin-left: 0;
  margin-right: 0;
}

.viewport-mobile .rv-editor__heading,
.viewport-mobile .rv-editor__toolbar,
.viewport-mobile .rv-editor__content {
  background: #ffffff;
}

.device-screen .rv-editor {
  grid-template-rows: auto auto minmax(0, 1fr);
}

.device-screen .rv-editor__toolbar {
  flex: 0 0 auto;
}

@media (max-width: 1100px) {
  .app-shell {
    height: 100vh;
    min-height: 100vh;
    overflow: hidden;
  }

  .workspace-grid {
    height: 100%;
  }

  .viewport-pc .preview-stage {
    width: 100% !important;
    border-radius: 16px;
  }

  .viewport-mobile .preview-stage {
    width: min(390px, calc(100vh - 160px) * 0.4774) !important;
    height: min(820px, calc(100vh - 160px));
    min-width: min(390px, calc(100vh - 160px) * 0.4774);
    padding: 12px;
  }

  .viewport-mobile .preview-stage::before {
    display: none;
  }

  .viewport-mobile .preview-stage::after {
    display: none;
  }

  .preview-shell {
    display: grid;
  }

  .multi-view-frame {
    padding: 6px;
  }

}

@media (max-width: 760px) {
  .app-shell {
    padding: 0;
  }

  .mode-switch {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .rv-editor__heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .rv-editor__heading-main {
    align-items: flex-start;
    flex-direction: column;
    width: 100%;
  }

  .preview-switch {
    width: 100%;
  }

  .output-actions {
    width: 100%;
    justify-content: flex-start;
  }

}
</style>
