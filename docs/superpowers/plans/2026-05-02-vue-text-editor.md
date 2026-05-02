# Vue Text Editor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 创建一个适配手机和 PC 的 Vue 文本与图片编辑器，并支持 HTML 与 Markdown 输出。

**Architecture:** Vite 提供 Vue 应用骨架，`src/App.vue` 负责编辑器交互与布局，`src/editor/exporters.js` 负责纯函数转换，`src/editor/exporters.test.js` 覆盖导出行为。样式集中在 `src/style.css`，用 CSS Grid 和媒体查询完成响应式适配。

**Tech Stack:** Vue 3、Vite、Vitest、原生 CSS、浏览器 FileReader 与 Clipboard API。

---

### Task 1: 项目骨架

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `src/main.js`
- Create: `src/App.vue`
- Create: `src/style.css`

- [ ] 创建 Vite + Vue 所需的最小文件结构。
- [ ] 配置 `dev`、`build`、`preview`、`test` 命令。
- [ ] 创建基础入口，确认应用可挂载到 `#app`。

### Task 2: 导出逻辑 TDD

**Files:**
- Create: `src/editor/exporters.test.js`
- Create: `src/editor/exporters.js`

- [ ] 先写 Vitest 测试，覆盖 HTML 与 Markdown 转换。
- [ ] 运行 `npm test -- --run`，确认因缺少实现失败。
- [ ] 实现 `blocksToHtml`、`blocksToMarkdown`、`escapeHtml`。
- [ ] 重新运行测试，确认通过。

### Task 3: 编辑器交互

**Files:**
- Modify: `src/App.vue`

- [ ] 实现默认内容块。
- [ ] 实现添加标题、段落、引用、列表、图片块。
- [ ] 实现选择、编辑、删除块。
- [ ] 实现图片上传为 Data URL。
- [ ] 实现 HTML/Markdown 预览切换和复制。

### Task 4: 响应式产品界面

**Files:**
- Modify: `src/style.css`

- [ ] 实现 PC 三栏布局。
- [ ] 实现移动端单列布局。
- [ ] 设计工具栏、块列表、编辑表单、预览区和导出区。
- [ ] 确保按钮、输入框、预览文字在窄屏不溢出。

### Task 5: 验证

**Files:**
- No file changes expected.

- [ ] 运行 `npm test -- --run`。
- [ ] 运行 `npm run build`。
- [ ] 启动本地开发服务器。
- [ ] 用浏览器检查 PC 与移动宽度下的主要工作流。
