import { ref as w, computed as C, watch as Et, onMounted as Lt, onBeforeUnmount as At, openBlock as k, createElementBlock as T, createElementVNode as s, toDisplayString as X, createCommentVNode as A, normalizeClass as H, Fragment as ce, renderList as pe, withModifiers as D, withDirectives as le, withKeys as ae, vModelText as re, unref as Rt, normalizeStyle as Ht } from "vue";
const Bt = /* @__PURE__ */ new Set(["blockquote", "pre", "h1", "h2", "h3", "h4", "h5", "h6"]);
function Le(o = "") {
  return Bt.has(String(o).toLowerCase());
}
function Pt(o, i, u) {
  return !o || !i ? !1 : u > i.bottom && u <= o.bottom;
}
const zt = [
  "p",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "blockquote",
  "pre",
  "ul",
  "ol",
  "li",
  "figure",
  "figcaption",
  "hr",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td"
], Nt = ["strong", "em", "u", "s", "code", "br", "img", "video", "a"], Ae = [...zt, ...Nt];
function V(o = "") {
  let i = String(o).replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "").replace(/<(\/?)b(\s[^>]*)?>/gi, "<$1strong>").replace(/<(\/?)i(\s[^>]*)?>/gi, "<$1em>").replace(/<div(\s[^>]*)?>/gi, "<p>").replace(/<\/div>/gi, "</p>").replace(/<br\s*\/?>/gi, "<br>").replace(/<\/br>/gi, "");
  return i = i.replace(/<([a-z][a-z0-9-]*)([^>]*)>/gi, (u, l, d) => {
    const r = l.toLowerCase();
    if (!Ae.includes(r))
      return "";
    if (r === "img") {
      const c = I(K(d, "src"));
      if (!c)
        return "";
      const y = Y(I(K(d, "alt") || "图片"));
      return `<img src="${Y(c)}" alt="${y}">`;
    }
    if (r === "video") {
      const c = I(K(d, "src"));
      return c ? `<video src="${Y(c)}" controls>` : "";
    }
    if (r === "a") {
      const c = I(K(d, "href"));
      return c ? `<a href="${Y(c)}">` : "";
    }
    return r === "hr" ? "<hr>" : `<${r}>`;
  }), i = i.replace(/<\/([a-z][a-z0-9-]*)>/gi, (u, l) => {
    const d = l.toLowerCase();
    return Ae.includes(d) && d !== "img" && d !== "br" && d !== "hr" ? `</${d}>` : "";
  }), i.trim();
}
function Re(o = "") {
  const i = Vt(String(o || "").trim());
  return /<(h[1-6]|p|blockquote|pre|ul|ol|li|strong|em|u|s|code|img|video|a|hr|table|thead|tbody|tr|th|td)\b[\s\S]*>/i.test(i) ? V(i) : null;
}
function An(o = "") {
  const i = String(o || "").replace(/\r\n?/g, `
`).split(`
`), u = [];
  let l = [], d = [], r = [], c = [], y = [], M = !1;
  const b = () => {
    l.length && (u.push(`<p>${G(l.join(" "))}</p>`), l = []);
  }, R = () => {
    d.length && (u.push(`<ul>${d.map((E) => `<li>${G(E)}</li>`).join("")}</ul>`), d = []);
  }, $ = () => {
    r.length && (u.push(`<ol>${r.map((E) => `<li>${G(E)}</li>`).join("")}</ol>`), r = []);
  }, h = () => {
    c.length && (u.push(`<blockquote>${c.map((E) => G(E)).join("<br>")}</blockquote>`), c = []);
  }, W = () => {
    u.push(`<pre><code>${Be(y.join(`
`).trim())}</code></pre>`), y = [];
  };
  let p = 0;
  for (; p < i.length; ) {
    const E = i[p];
    if (/^```/.test(E.trim())) {
      M ? (W(), M = !1) : (b(), R(), $(), h(), M = !0), p += 1;
      continue;
    }
    if (M) {
      y.push(E), p += 1;
      continue;
    }
    const S = E.trim(), q = It(i, p);
    if (q) {
      b(), R(), $(), h(), u.push(q.html), p += q.linesUsed;
      continue;
    }
    if (!S) {
      b(), R(), $(), h(), p += 1;
      continue;
    }
    if (S.match(/^(-{3,}|\*{3,}|_{3,})$/)) {
      b(), R(), $(), h(), u.push("<hr>"), p += 1;
      continue;
    }
    const U = S.match(/^(#{1,6})\s+(.+)$/);
    if (U) {
      b(), R(), $(), h(), u.push(`<h${U[1].length}>${G(U[2])}</h${U[1].length}>`), p += 1;
      continue;
    }
    const O = S.match(/^>\s?(.+)$/);
    if (O) {
      b(), R(), $(), c.push(O[1]), p += 1;
      continue;
    }
    const j = S.match(/^[-*]\s+(.+)$/);
    if (j) {
      b(), $(), h(), d.push(j[1]), p += 1;
      continue;
    }
    const x = S.match(/^\d+\.\s+(.+)$/);
    if (x) {
      b(), R(), h(), r.push(x[1]), p += 1;
      continue;
    }
    l.push(S), p += 1;
  }
  return M && W(), b(), R(), $(), h(), V(u.join("") || "<p><br></p>");
}
function Vt(o) {
  const i = o.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  return i ? i[1].trim() : o;
}
function It(o, i) {
  const u = o[i]?.trim(), l = o[i + 1]?.trim();
  if (!ge(u) || !qt(l))
    return null;
  const d = me(u), r = [];
  let c = i + 2;
  for (; ge(o[c]?.trim()); )
    r.push(me(o[c].trim())), c += 1;
  const y = `<thead><tr>${d.map((b) => `<th>${G(b)}</th>`).join("")}</tr></thead>`, M = r.length ? `<tbody>${r.map((b) => `<tr>${d.map((R, $) => `<td>${G(b[$] || "")}</td>`).join("")}</tr>`).join("")}</tbody>` : "<tbody></tbody>";
  return {
    html: `<table>${y}${M}</table>`,
    linesUsed: Math.max(2, c - i)
  };
}
function ge(o = "") {
  return /^\|.+\|$/.test(o);
}
function qt(o = "") {
  return ge(o) ? me(o).every((i) => /^:?-{3,}:?$/.test(i.trim())) : !1;
}
function me(o = "") {
  return o.replace(/^\|/, "").replace(/\|$/, "").split("|").map((i) => i.trim());
}
function Ut(o = "") {
  let i = V(o);
  return i = i.replace(/<figure>\s*/gi, "").replace(/\s*<\/figure>/gi, "").replace(/<figcaption>[\s\S]*?<\/figcaption>/gi, "").replace(/<img\b([^>]*)>/gi, (u, l) => {
    const d = K(l, "src"), r = K(l, "alt") || "图片";
    return d ? `![${r}](${d})` : "";
  }).replace(/<video\b([^>]*)>(?:[\s\S]*?<\/video>)?/gi, (u, l) => {
    const d = K(l, "src");
    return d ? `<video src="${d}" controls></video>

` : "";
  }).replace(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi, (u, l, d) => {
    const r = K(l, "href"), c = J(d).trim();
    return r && c ? `[${c}](${r})` : c;
  }).replace(/<hr>/gi, `---

`).replace(/<table>([\s\S]*?)<\/table>/gi, (u, l) => Ft(l)).replace(/<h1>([\s\S]*?)<\/h1>/gi, `# $1

`).replace(/<h2>([\s\S]*?)<\/h2>/gi, `## $1

`).replace(/<h3>([\s\S]*?)<\/h3>/gi, `### $1

`).replace(/<h4>([\s\S]*?)<\/h4>/gi, `#### $1

`).replace(/<h5>([\s\S]*?)<\/h5>/gi, `##### $1

`).replace(/<h6>([\s\S]*?)<\/h6>/gi, `###### $1

`).replace(/<blockquote>([\s\S]*?)<\/blockquote>/gi, (u, l) => {
    const d = J(l).trim();
    return d ? `> ${d}

` : "";
  }).replace(/<pre>(?!<code>)([\s\S]*?)<\/pre>/gi, (u, l) => `\`\`\`
${I(J(l)).trim()}
\`\`\`

`).replace(/<pre><code>([\s\S]*?)<\/code><\/pre>/gi, (u, l) => `\`\`\`
${I(J(l)).trim()}
\`\`\`

`).replace(/<ul>([\s\S]*?)<\/ul>/gi, (u, l) => He(l, "-")).replace(/<ol>([\s\S]*?)<\/ol>/gi, (u, l) => He(l, "1.")).replace(/<p>([\s\S]*?)<\/p>/gi, `$1

`).replace(/<strong>([\s\S]*?)<\/strong>/gi, "**$1**").replace(/<em>([\s\S]*?)<\/em>/gi, "*$1*").replace(/<s>([\s\S]*?)<\/s>/gi, "~~$1~~").replace(/<code>([\s\S]*?)<\/code>/gi, "`$1`").replace(/<u>([\s\S]*?)<\/u>/gi, "<u>$1</u>").replace(/<br>/gi, `
`), I(Dt(i)).replace(/[ \t]+\n/g, `
`).replace(/\n{3,}/g, `

`).trim();
}
function Rn(o) {
  return [
    "<!doctype html>",
    '<html lang="zh-CN">',
    "<head>",
    '  <meta charset="UTF-8">',
    '  <meta name="viewport" content="width=device-width, initial-scale=1.0">',
    "  <title>导出的文档</title>",
    "</head>",
    `<body style="${f.body}">`,
    `  <main style="${f.main}">`,
    _t(V(o)),
    "  </main>",
    "</body>",
    "</html>"
  ].join(`
`);
}
const f = {
  body: 'box-sizing:border-box;margin:0;padding:32px 18px;color:#1e2923;background:#f6f7f4;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;font-size:17px;line-height:1.7;',
  main: "box-sizing:border-box;max-width:860px;margin:0 auto;padding:34px;border:1px solid #d7ded5;border-radius:8px;background:#ffffff;",
  h1: "margin:0 0 14px;color:#172026;font-size:34px;line-height:1.2;",
  h2: "margin:0 0 14px;color:#172026;font-size:26px;line-height:1.2;",
  h3: "margin:0 0 14px;color:#172026;font-size:21px;line-height:1.2;",
  h4: "margin:0 0 12px;color:#172026;font-size:18px;line-height:1.25;",
  h5: "margin:0 0 10px;color:#172026;font-size:16px;line-height:1.3;",
  h6: "margin:0 0 10px;color:#3b4740;font-size:14px;line-height:1.35;",
  p: "margin:0 0 16px;font-size:17px;line-height:1.7;",
  blockquote: "margin:0 0 16px;border-left:4px solid #245a48;padding:9px 0 9px 14px;color:#455249;background:#f3f7f2;font-size:17px;line-height:1.7;",
  ul: "margin:0 0 16px;font-size:17px;line-height:1.7;",
  ol: "margin:0 0 16px;font-size:17px;line-height:1.7;",
  hr: "height:1px;margin:22px 0;border:0;background:#d7ded5;",
  table: "width:100%;margin:0 0 16px;border-collapse:collapse;font-size:15px;line-height:1.5;",
  th: "border:1px solid #cfd8ce;padding:8px 10px;background:#f3f7f2;text-align:left;font-weight:700;",
  td: "border:1px solid #cfd8ce;padding:8px 10px;text-align:left;",
  figure: "margin:0 0 16px;font-size:17px;line-height:1.7;",
  pre: 'box-sizing:border-box;overflow:auto;margin:0 0 16px;border-radius:8px;padding:14px;color:#eaf1ec;background:#101713;font-family:"SFMono-Regular",Consolas,"Liberation Mono",monospace;font-size:13px;',
  code: 'border-radius:5px;padding:2px 5px;color:#154834;background:#e8f1ea;font-family:"SFMono-Regular",Consolas,"Liberation Mono",monospace;font-size:0.9em;',
  preCode: 'padding:0;color:inherit;background:transparent;font-family:"SFMono-Regular",Consolas,"Liberation Mono",monospace;font-size:13px;',
  img: "display:inline-block;max-width:100%;max-height:420px;margin:0;vertical-align:middle;border-radius:8px;",
  video: "display:block;max-width:100%;max-height:480px;margin:0 0 16px;border-radius:8px;background:#000000;"
};
function _t(o) {
  return o.replace(/<h1>/gi, `<h1 style="${f.h1}">`).replace(/<h2>/gi, `<h2 style="${f.h2}">`).replace(/<h3>/gi, `<h3 style="${f.h3}">`).replace(/<h4>/gi, `<h4 style="${f.h4}">`).replace(/<h5>/gi, `<h5 style="${f.h5}">`).replace(/<h6>/gi, `<h6 style="${f.h6}">`).replace(/<p>/gi, `<p style="${f.p}">`).replace(/<blockquote>/gi, `<blockquote style="${f.blockquote}">`).replace(/<ul>/gi, `<ul style="${f.ul}">`).replace(/<ol>/gi, `<ol style="${f.ol}">`).replace(/<hr>/gi, `<hr style="${f.hr}">`).replace(/<table>/gi, `<table style="${f.table}">`).replace(/<th>/gi, `<th style="${f.th}">`).replace(/<td>/gi, `<td style="${f.td}">`).replace(/<figure>/gi, `<figure style="${f.figure}">`).replace(/<pre><code>/gi, `<pre style="${f.pre}"><code style="${f.preCode}">`).replace(/<pre>/gi, `<pre style="${f.pre}">`).replace(/<code>/gi, `<code style="${f.code}">`).replace(/<img\b([^>]*)>/gi, `<img$1 style="${f.img}">`).replace(/<video\b([^>]*)>/gi, `<video$1 style="${f.video}">`);
}
function He(o, i) {
  const u = [...o.matchAll(/<li>([\s\S]*?)<\/li>/gi)].map((l) => J(l[1]).trim()).filter(Boolean);
  return u.length ? `${u.map((l) => `${i} ${l}`).join(`
`)}

` : "";
}
function Ft(o) {
  const i = [...o.matchAll(/<th>([\s\S]*?)<\/th>/gi)].map((y) => J(y[1]).trim()), u = [...o.matchAll(/<tr>([\s\S]*?)<\/tr>/gi)].map((y) => [...y[1].matchAll(/<td>([\s\S]*?)<\/td>/gi)].map((M) => J(M[1]).trim())).filter((y) => y.length);
  if (!i.length && !u.length)
    return "";
  const l = Math.max(i.length, ...u.map((y) => y.length)), d = Array.from({ length: l }, (y, M) => i[M] || ""), r = Array.from({ length: l }, () => "---"), c = u.map((y) => Array.from({ length: l }, (M, b) => y[b] || ""));
  return [
    ve(d),
    ve(r),
    ...c.map(ve),
    ""
  ].join(`
`);
}
function ve(o) {
  return `| ${o.join(" | ")} |`;
}
function J(o) {
  return String(o).replace(/<\/?[^>]+>/g, "");
}
function Dt(o) {
  return String(o).replace(/<\/?(p|h1|h2|h3|h4|h5|h6|blockquote|pre|ul|ol|li|figure|figcaption|hr|table|thead|tbody|tr|th|td)>/gi, "");
}
function G(o) {
  return Be(o).replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+["'][^"']+["'])?\)/g, (i, u, l) => `<img src="${Y(I(l.trim()))}" alt="${Y(I(u.trim() || "图片"))}">`).replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+["'][^"']+["'])?\)/g, (i, u, l) => `<a href="${Y(I(l.trim()))}">${u}</a>`).replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/\*([^*]+)\*/g, "<em>$1</em>").replace(/~~([^~]+)~~/g, "<s>$1</s>").replace(/`([^`]+)`/g, "<code>$1</code>");
}
function Be(o) {
  return String(o).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}
function K(o, i) {
  const u = new RegExp(`${i}=(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"), l = String(o || "").match(u);
  return l?.[1] || l?.[2] || l?.[3] || "";
}
function Y(o) {
  return String(o).replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}
function I(o) {
  return String(o).replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}
const Ot = "标题", Pe = "内容";
function jt(o = "") {
  return (String(o).match(/<tr>[\s\S]*?<\/tr>/gi) || []).reduce((u, l) => Math.max(u, Qt(l)), 0);
}
function Kt(o = "") {
  const i = String(o), u = Math.max(1, jt(i)), l = `<tr>${Array.from({ length: u }, () => `<td>${Pe}</td>`).join("")}</tr>`;
  return /<tbody>[\s\S]*?<\/tbody>/i.test(i) ? i.replace(/<\/tbody>/i, `${l}</tbody>`) : i.replace(/<\/table>/i, `<tbody>${l}</tbody></table>`);
}
function Wt(o = "") {
  return String(o).replace(/<tr>([\s\S]*?)<\/tr>/gi, (i, u) => {
    const d = /<th>[\s\S]*?<\/th>/i.test(u) && !/<td>[\s\S]*?<\/td>/i.test(u) ? `<th>${Ot}</th>` : `<td>${Pe}</td>`;
    return `<tr>${u}${d}</tr>`;
  });
}
function Qt(o = "") {
  return (String(o).match(/<(th|td)>[\s\S]*?<\/\1>/gi) || []).length;
}
const Xt = { class: "rv-editor__heading panel-heading" }, Gt = {
  class: "rv-editor__toolbar editor-toolbar",
  "aria-label": "样式快捷选择"
}, Jt = { class: "rv-editor__toolbar-row toolbar-row" }, Yt = { class: "rv-editor__dropdown toolbar-dropdown" }, Zt = ["aria-expanded"], en = {
  key: 1,
  class: "rv-editor__menu toolbar-menu"
}, tn = ["onClick"], nn = ["title", "aria-label", "data-tooltip", "onMouseenter", "onFocus", "onTouchstartPassive", "onClick"], on = ["title", "data-tooltip", "onMouseenter", "onFocus", "onTouchstartPassive", "onClick"], ln = {
  key: 4,
  class: "rv-editor__table-actions table-actions",
  "aria-label": "表格操作"
}, an = ["aria-label", "aria-expanded", "disabled"], rn = ["aria-label", "aria-expanded", "disabled"], un = {
  class: "rv-editor__dialog image-dialog",
  role: "dialog",
  "aria-modal": "true",
  "aria-label": "添加图片"
}, sn = { class: "rv-editor__dialog-heading image-dialog-heading" }, dn = { class: "rv-editor__url-field image-url-field" }, cn = ["onKeydown"], pn = { class: "rv-editor__dialog-actions image-dialog-actions" }, vn = ["title", "disabled"], gn = {
  class: "rv-editor__dialog image-dialog",
  role: "dialog",
  "aria-modal": "true",
  "aria-label": "添加视频"
}, mn = { class: "rv-editor__dialog-heading image-dialog-heading" }, fn = { class: "rv-editor__url-field image-url-field" }, bn = ["onKeydown"], hn = { class: "rv-editor__dialog-actions image-dialog-actions" }, yn = ["title", "disabled"], $n = {
  class: "rv-editor__dialog image-dialog",
  role: "dialog",
  "aria-modal": "true",
  "aria-label": "添加链接"
}, kn = { class: "rv-editor__dialog-heading image-dialog-heading" }, Tn = { class: "rv-editor__url-field image-url-field" }, wn = ["onKeydown"], xn = { class: "rv-editor__url-field image-url-field" }, Sn = ["disabled", "onKeydown"], Cn = { class: "rv-editor__dialog-actions image-dialog-actions" }, Mn = ["contenteditable", "data-placeholder", "aria-readonly", "aria-disabled", "innerHTML"], En = {
  __name: "RichTextEditor",
  props: {
    modelValue: {
      type: String,
      default: ""
    },
    initialValue: {
      type: String,
      default: "<p><br></p>"
    },
    minHeight: {
      type: String,
      default: "580px"
    },
    label: {
      type: String,
      default: "编辑"
    },
    clearable: {
      type: Boolean,
      default: !0
    },
    enabledTools: {
      type: Array,
      default: null
    },
    imageMode: {
      type: String,
      default: "data",
      validator: (o) => ["data", "url"].includes(o)
    },
    uploadImage: {
      type: Function,
      default: null
    },
    videoMode: {
      type: String,
      default: "data",
      validator: (o) => ["data", "url"].includes(o)
    },
    uploadVideo: {
      type: Function,
      default: null
    },
    placeholder: {
      type: String,
      default: ""
    },
    readonly: {
      type: Boolean,
      default: !1
    },
    disabled: {
      type: Boolean,
      default: !1
    }
  },
  emits: [
    "update:modelValue",
    "change",
    "focus",
    "blur",
    "image-upload-start",
    "image-upload-end",
    "image-upload-error",
    "video-upload-start",
    "video-upload-end",
    "video-upload-error"
  ],
  setup(o, { expose: i, emit: u }) {
    const l = o, d = u, r = w(null), c = w(null), y = w(null), M = w(null), b = w(null), R = w("p"), $ = w(!1), h = w(!1), W = w(""), p = w(!1), E = w(""), S = w(!1), q = w(""), Z = w(""), U = w(""), O = w(!1), j = w(!1), x = w(""), z = w(null), ee = w(V(l.modelValue || l.initialValue)), ze = ee.value, fe = [
      { label: "正文", value: "p" },
      { label: "H1", value: "h1" },
      { label: "H2", value: "h2" },
      { label: "H3", value: "h3" },
      { label: "H4", value: "h4" },
      { label: "H5", value: "h5" },
      { label: "H6", value: "h6" }
    ], Ne = [
      { key: "blockquote", label: "引用", icon: "❝", command: "formatBlock", value: "blockquote" },
      { key: "codeBlock", label: "代码块", icon: "{ }", command: "formatBlock", value: "pre" }
    ], Ve = [
      { key: "bold", label: "B", command: "bold", title: "加粗" },
      { key: "italic", label: "I", command: "italic", title: "斜体" },
      { key: "underline", label: "U", command: "underline", title: "下划线" },
      { key: "strike", label: "S", command: "strikeThrough", title: "删除线" },
      { key: "inlineCode", label: "</>", command: "formatBlock", value: "p", wrap: "code", title: "行内代码" }
    ], Ie = [
      "heading",
      "blockquote",
      "codeBlock",
      "bold",
      "italic",
      "underline",
      "strike",
      "inlineCode",
      "unorderedList",
      "orderedList",
      "table",
      "link",
      "divider",
      "image",
      "video"
    ], N = C(() => new Set(
      Array.isArray(l.enabledTools) && l.enabledTools.length ? Ye(l.enabledTools) : Ie
    )), be = C(() => N.value.has("heading") ? fe : fe.slice(0, 1)), qe = C(() => Ne.filter((t) => N.value.has(t.key))), Ue = C(() => Ve.filter((t) => N.value.has(t.key))), _e = C(() => N.value.has("heading")), Fe = C(() => N.value.has("unorderedList")), De = C(() => N.value.has("orderedList")), he = C(() => N.value.has("table")), Oe = C(() => he.value && !!z.value), je = C(() => N.value.has("link")), Ke = C(() => N.value.has("divider")), We = C(() => N.value.has("image")), Qe = C(() => N.value.has("video")), Xe = C(
      () => be.value.find((t) => t.value === R.value)?.label || "正文"
    ), Ge = C(() => ({
      minHeight: l.minHeight
    })), v = C(() => !l.readonly && !l.disabled);
    Et(
      () => l.modelValue,
      (t) => {
        const e = V(t || l.initialValue);
        e !== ee.value && (ee.value = e, r.value && r.value.innerHTML !== e && (r.value.innerHTML = e));
      }
    ), Lt(() => {
      document.addEventListener("pointerdown", ye);
    }), At(() => {
      document.removeEventListener("pointerdown", ye);
    });
    function ne(t) {
      if (v.value) {
        if (a(), te(), t.wrap === "code") {
          dt(), L();
          return;
        }
        document.execCommand(t.command, !1, t.value), L(), P();
      }
    }
    function Je(t) {
      v.value && (a(), t && (R.value = t, $.value = !1, ne({ command: "formatBlock", value: t })));
    }
    function ye(t) {
      !$.value && !h.value && !p.value && !S.value || c.value?.contains(t.target) || _();
    }
    function _() {
      $.value = !1, h.value = !1, p.value = !1, S.value = !1;
    }
    function g(t) {
      x.value = t;
    }
    function a() {
      x.value = "";
    }
    function B(t) {
      g(t);
    }
    function Ye(t) {
      const e = new Set(t);
      return e.has("list") && (e.add("unorderedList"), e.add("orderedList")), [...e];
    }
    function $e() {
      v.value && (r.value && (r.value.innerHTML = "<p><br></p>"), ie("<p><br></p>"), te());
    }
    function L() {
      if (!v.value || !r.value)
        return;
      const t = Re(r.value.innerText);
      t && (r.value.innerHTML = t), ie(r.value.innerHTML);
    }
    function ie(t) {
      const e = V(t);
      ee.value = e, d("update:modelValue", e), d("change", e);
    }
    function P() {
      const t = window.getSelection();
      if (!t || t.rangeCount === 0 || !r.value)
        return;
      const e = t.getRangeAt(0);
      r.value.contains(e.commonAncestorContainer) && (b.value = e.cloneRange(), Ce(e.commonAncestorContainer));
    }
    function Ze(t) {
      if (!v.value)
        return;
      const e = t.clipboardData?.getData("text/html"), n = t.clipboardData?.getData("text/plain"), m = Re(e || n);
      m && (t.preventDefault(), Q(m), L());
    }
    function et(t) {
      if (!v.value || t.key !== "Enter" || t.shiftKey)
        return;
      const e = ht();
      !e || !Le(e.tagName) || (t.preventDefault(), yt(e), L());
    }
    function tt(t) {
      if (!v.value)
        return;
      const e = t.target?.tagName?.toLowerCase();
      if (e === "img" || e === "video") {
        Tt(t.target), P();
        return;
      }
      if (t.target !== r.value) {
        P();
        return;
      }
      const n = $t();
      if (!n) {
        Me();
        return;
      }
      Pt(
        r.value.getBoundingClientRect(),
        n.getBoundingClientRect(),
        t.clientY
      ) ? Me() : P();
    }
    function nt() {
      v.value && (h.value = !1, P(), te(), y.value?.click());
    }
    function ot() {
      v.value && (a(), P(), $.value = !1, p.value = !1, h.value = !h.value);
    }
    function ke() {
      if (!v.value)
        return;
      a();
      const t = W.value.trim();
      t && (h.value = !1, W.value = "", ue(t, "图片链接"), L());
    }
    async function lt(t) {
      if (!v.value)
        return;
      const e = t.target.files?.[0];
      if (e)
        try {
          O.value = !0, d("image-upload-start", e);
          const n = l.imageMode === "url" ? await ut(e) : await we(e), m = e.name.replace(/\.[^.]+$/, "") || "图片";
          ue(n, m), L(), d("image-upload-end", { file: e, src: n });
        } catch (n) {
          d("image-upload-error", { file: e, error: n });
        } finally {
          O.value = !1, t.target.value = "";
        }
    }
    function at() {
      v.value && (p.value = !1, P(), te(), M.value?.click());
    }
    function rt() {
      v.value && (a(), P(), $.value = !1, h.value = !1, p.value = !p.value);
    }
    function Te() {
      if (!v.value)
        return;
      a();
      const t = E.value.trim();
      t && (p.value = !1, E.value = "", se(t), L());
    }
    async function it(t) {
      if (!v.value)
        return;
      const e = t.target.files?.[0];
      if (e)
        try {
          j.value = !0, d("video-upload-start", e);
          const n = l.videoMode === "url" ? await st(e) : await we(e);
          se(n), L(), d("video-upload-end", { file: e, src: n });
        } catch (n) {
          d("video-upload-error", { file: e, error: n });
        } finally {
          j.value = !1, t.target.value = "";
        }
    }
    function we(t) {
      return new Promise((e, n) => {
        const m = new FileReader();
        m.onload = () => e(m.result), m.onerror = () => n(m.error || new Error("图片读取失败")), m.readAsDataURL(t);
      });
    }
    async function ut(t) {
      if (!l.uploadImage)
        throw new Error("imageMode 为 url 时必须传入 uploadImage(file) 函数");
      const e = await l.uploadImage(t), n = typeof e == "string" ? e : e?.url;
      if (!n)
        throw new Error("uploadImage 必须返回图片 URL 字符串，或返回包含 url 字段的对象");
      return n;
    }
    function ue(t, e = "图片") {
      Q(`<img src="${oe(t)}" alt="${oe(e)}">`);
    }
    async function st(t) {
      if (!l.uploadVideo)
        throw new Error("videoMode 为 url 时必须传入 uploadVideo(file) 函数");
      const e = await l.uploadVideo(t), n = typeof e == "string" ? e : e?.url;
      if (!n)
        throw new Error("uploadVideo 必须返回视频 URL 字符串，或返回包含 url 字段的对象");
      return n;
    }
    function se(t) {
      Q(`<video src="${oe(t)}" controls></video>`);
    }
    function Q(t) {
      v.value && (te(), Ct(), document.execCommand("insertHTML", !1, V(t)), P());
    }
    function dt() {
      if (!v.value)
        return;
      const t = window.getSelection();
      if (!t || t.rangeCount === 0 || t.isCollapsed) {
        document.execCommand("insertHTML", !1, "<code>代码</code>");
        return;
      }
      const e = t.getRangeAt(0), n = document.createElement("code");
      n.textContent = e.toString(), e.deleteContents(), e.insertNode(n), t.removeAllRanges();
    }
    function ct() {
      if (!v.value)
        return;
      a();
      const t = window.getSelection(), e = t && !t.isCollapsed ? t.toString() : "", n = pt(t);
      P(), $.value = !1, h.value = !1, p.value = !1, q.value = "https://", Z.value = n ? n.alt || "图片" : e, U.value = n ? n.outerHTML : "", S.value = !0;
    }
    function de() {
      if (!v.value)
        return;
      a();
      const t = q.value.trim();
      if (!t)
        return;
      const e = Z.value.trim() || t, n = U.value;
      S.value = !1, q.value = "", Z.value = "", U.value = "", Q(
        n ? `<a href="${oe(t)}">${n}</a>` : `<a href="${oe(t)}">${Mt(e)}</a>`
      ), L();
    }
    function pt(t) {
      if (!t || t.rangeCount === 0 || t.isCollapsed || !r.value)
        return null;
      const e = t.getRangeAt(0), n = e.startContainer.childNodes?.[e.startOffset];
      if (n?.nodeType === Node.ELEMENT_NODE && n.tagName?.toLowerCase() === "img")
        return n;
      const F = (e.commonAncestorContainer.nodeType === Node.ELEMENT_NODE ? e.commonAncestorContainer : e.commonAncestorContainer.parentElement)?.querySelector?.("img");
      return F && r.value.contains(F) ? F : null;
    }
    function vt() {
      v.value && (a(), Q("<hr><p><br></p>"), L());
    }
    function gt() {
      v.value && (a(), Q(
        "<table><thead><tr><th>标题</th><th>标题</th></tr></thead><tbody><tr><td>内容</td><td>内容</td></tr><tr><td>内容</td><td>内容</td></tr></tbody></table><p><br></p>"
      ), L(), Se());
    }
    function mt() {
      v.value && xe(Kt, (t) => t.querySelector("tbody tr:last-child td"));
    }
    function ft() {
      v.value && xe(Wt, (t) => {
        const e = [...t.querySelectorAll("tr")];
        return e.find((n) => n.querySelector("td"))?.querySelector("td:last-child") || e[0]?.querySelector("th:last-child, td:last-child");
      });
    }
    function xe(t, e) {
      if (!v.value)
        return;
      a();
      const n = bt();
      if (!n)
        return;
      const m = document.createElement("div");
      m.innerHTML = V(t(n.outerHTML));
      const F = m.querySelector("table");
      F && (n.replaceWith(F), z.value = F, kt(e(F) || F), L());
    }
    function bt() {
      return (!r.value || !z.value || !r.value.contains(z.value)) && Se(), z.value && r.value?.contains(z.value) ? z.value : null;
    }
    function Se() {
      const t = window.getSelection();
      if (!t || t.rangeCount === 0) {
        z.value = null;
        return;
      }
      Ce(t.getRangeAt(0).commonAncestorContainer);
    }
    function Ce(t) {
      if (!r.value) {
        z.value = null;
        return;
      }
      let e = t?.nodeType === Node.ELEMENT_NODE ? t : t?.parentElement;
      for (; e && e !== r.value; ) {
        if (e.tagName?.toLowerCase() === "table") {
          z.value = e;
          return;
        }
        e = e.parentElement;
      }
      z.value = null;
    }
    function ht() {
      const t = window.getSelection();
      if (!t || t.rangeCount === 0 || !r.value)
        return null;
      let e = t.anchorNode;
      for (e?.nodeType === Node.TEXT_NODE && (e = e.parentElement); e && e !== r.value; ) {
        if (e.nodeType === Node.ELEMENT_NODE && Le(e.tagName))
          return e;
        e = e.parentElement;
      }
      return null;
    }
    function yt(t) {
      const e = document.createElement("p");
      e.appendChild(document.createElement("br")), t.insertAdjacentElement("afterend", e), Ee(e);
    }
    function Me() {
      if (!v.value || !r.value)
        return;
      let t = r.value.lastElementChild;
      (!t || t.tagName.toLowerCase() !== "p" || t.textContent.trim()) && (t = document.createElement("p"), t.appendChild(document.createElement("br")), r.value.appendChild(t)), Ee(t), L();
    }
    function $t() {
      return r.value ? [...r.value.children].slice().reverse().find((e) => e.textContent.trim() || e.querySelector("img, video")) : null;
    }
    function Ee(t) {
      const e = document.createRange();
      e.setStart(t, 0), e.collapse(!0);
      const n = window.getSelection();
      n.removeAllRanges(), n.addRange(e), b.value = e.cloneRange();
    }
    function kt(t) {
      const e = document.createRange();
      e.selectNodeContents(t), e.collapse(!1);
      const n = window.getSelection();
      n.removeAllRanges(), n.addRange(e), b.value = e.cloneRange();
    }
    function Tt(t) {
      const e = document.createRange();
      e.selectNode(t);
      const n = window.getSelection();
      n.removeAllRanges(), n.addRange(e), b.value = e.cloneRange();
    }
    function te() {
      r.value?.focus();
    }
    function wt(t) {
      r.value && (r.value.innerHTML = V(t)), ie(t);
    }
    function xt() {
      return ee.value;
    }
    function St() {
      return Ut(ee.value);
    }
    i({
      clear: $e,
      focus: te,
      getHtml: xt,
      getMarkdown: St,
      insertHtml: Q,
      insertImage: ue,
      insertVideo: se,
      setHtml: wt
    });
    function Ct() {
      if (!b.value)
        return;
      const t = window.getSelection();
      t.removeAllRanges(), t.addRange(b.value);
    }
    function oe(t) {
      return String(t).replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
    }
    function Mt(t) {
      return String(t).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
    }
    return (t, e) => (k(), T("section", {
      ref_key: "rootRef",
      ref: c,
      class: "rv-editor panel editor-panel",
      "aria-label": "富文本编辑区"
    }, [
      s("div", Xt, [
        s("h2", null, X(o.label), 1),
        o.clearable && v.value ? (k(), T("button", {
          key: 0,
          type: "button",
          class: "rv-editor__danger-button danger-button",
          onClick: $e
        }, " 清空 ")) : A("", !0)
      ]),
      s("div", Gt, [
        s("div", Jt, [
          s("div", Yt, [
            _e.value ? (k(), T("button", {
              key: 0,
              type: "button",
              class: H(["rv-editor__select toolbar-select", { "tooltip-visible": x.value === "段落样式" }]),
              "aria-label": "段落样式",
              "aria-expanded": $.value,
              "data-tooltip": "段落样式",
              onMouseenter: e[0] || (e[0] = (n) => g("段落样式")),
              onMouseleave: a,
              onFocus: e[1] || (e[1] = (n) => g("段落样式")),
              onBlur: a,
              onTouchstartPassive: e[2] || (e[2] = (n) => B("段落样式")),
              onTouchend: a,
              onTouchcancel: a,
              onClick: e[3] || (e[3] = (n) => {
                h.value = !1, p.value = !1, $.value = !$.value;
              })
            }, [
              s("span", null, X(Xe.value), 1),
              e[48] || (e[48] = s("span", { class: "rv-editor__select-caret select-caret" }, "▾", -1))
            ], 42, Zt)) : A("", !0),
            $.value ? (k(), T("div", en, [
              (k(!0), T(ce, null, pe(be.value, (n) => (k(), T("button", {
                key: n.value,
                type: "button",
                class: H({ active: R.value === n.value }),
                onClick: (m) => Je(n.value)
              }, X(n.label), 11, tn))), 128))
            ])) : A("", !0)
          ]),
          (k(!0), T(ce, null, pe(qe.value, (n) => (k(), T("button", {
            key: `${n.command}-${n.value}`,
            type: "button",
            class: H(["rv-editor__icon-button icon-button", { "tooltip-visible": x.value === n.label }]),
            title: n.label,
            "aria-label": n.label,
            "data-tooltip": n.label,
            onMouseenter: (m) => g(n.label),
            onMouseleave: a,
            onFocus: (m) => g(n.label),
            onBlur: a,
            onTouchstartPassive: (m) => B(n.label),
            onTouchend: a,
            onTouchcancel: a,
            onClick: (m) => ne(n),
            onPointerdown: _
          }, X(n.icon), 43, nn))), 128)),
          (k(!0), T(ce, null, pe(Ue.value, (n) => (k(), T("button", {
            key: n.title,
            type: "button",
            title: n.title,
            "data-tooltip": n.title,
            class: H({ "tooltip-visible": x.value === n.title }),
            onMouseenter: (m) => g(n.title),
            onMouseleave: a,
            onFocus: (m) => g(n.title),
            onBlur: a,
            onTouchstartPassive: (m) => B(n.title),
            onTouchend: a,
            onTouchcancel: a,
            onClick: (m) => ne(n),
            onPointerdown: _
          }, X(n.label), 43, on))), 128)),
          Fe.value ? (k(), T("button", {
            key: 0,
            type: "button",
            class: H(["rv-editor__icon-button icon-button", { "tooltip-visible": x.value === "无序列表" }]),
            title: "无序列表",
            "aria-label": "无序列表",
            "data-tooltip": "无序列表",
            onMouseenter: e[4] || (e[4] = (n) => g("无序列表")),
            onMouseleave: a,
            onFocus: e[5] || (e[5] = (n) => g("无序列表")),
            onBlur: a,
            onTouchstartPassive: e[6] || (e[6] = (n) => B("无序列表")),
            onTouchend: a,
            onTouchcancel: a,
            onClick: e[7] || (e[7] = (n) => ne({ command: "insertUnorderedList" })),
            onPointerdown: _
          }, " ☰ ", 34)) : A("", !0),
          De.value ? (k(), T("button", {
            key: 1,
            type: "button",
            class: H(["rv-editor__icon-button icon-button", { "tooltip-visible": x.value === "有序列表" }]),
            title: "有序列表",
            "aria-label": "有序列表",
            "data-tooltip": "有序列表",
            onMouseenter: e[8] || (e[8] = (n) => g("有序列表")),
            onMouseleave: a,
            onFocus: e[9] || (e[9] = (n) => g("有序列表")),
            onBlur: a,
            onTouchstartPassive: e[10] || (e[10] = (n) => B("有序列表")),
            onTouchend: a,
            onTouchcancel: a,
            onClick: e[11] || (e[11] = (n) => ne({ command: "insertOrderedList" })),
            onPointerdown: _
          }, " 1. ", 34)) : A("", !0),
          je.value ? (k(), T("button", {
            key: 2,
            type: "button",
            class: H(["rv-editor__icon-button icon-button", { "tooltip-visible": x.value === "链接" }]),
            title: "链接",
            "aria-label": "链接",
            "data-tooltip": "链接",
            onMouseenter: e[12] || (e[12] = (n) => g("链接")),
            onMouseleave: a,
            onFocus: e[13] || (e[13] = (n) => g("链接")),
            onBlur: a,
            onTouchstartPassive: e[14] || (e[14] = (n) => B("链接")),
            onTouchend: a,
            onTouchcancel: a,
            onClick: ct,
            onPointerdown: _
          }, " 🔗 ", 34)) : A("", !0),
          he.value ? (k(), T("button", {
            key: 3,
            type: "button",
            class: H(["rv-editor__icon-button icon-button", { "tooltip-visible": x.value === "表格" }]),
            title: "表格",
            "aria-label": "表格",
            "data-tooltip": "表格",
            onMouseenter: e[15] || (e[15] = (n) => g("表格")),
            onMouseleave: a,
            onFocus: e[16] || (e[16] = (n) => g("表格")),
            onBlur: a,
            onTouchstartPassive: e[17] || (e[17] = (n) => B("表格")),
            onTouchend: a,
            onTouchcancel: a,
            onClick: gt,
            onPointerdown: _
          }, " ▦ ", 34)) : A("", !0),
          Oe.value ? (k(), T("div", ln, [
            s("button", {
              type: "button",
              "data-tooltip": "增加行",
              class: H({ "tooltip-visible": x.value === "增加行" }),
              onMouseenter: e[18] || (e[18] = (n) => g("增加行")),
              onMouseleave: a,
              onFocus: e[19] || (e[19] = (n) => g("增加行")),
              onBlur: a,
              onTouchstartPassive: e[20] || (e[20] = (n) => B("增加行")),
              onTouchend: a,
              onTouchcancel: a,
              onClick: mt,
              onPointerdown: e[21] || (e[21] = D(() => {
              }, ["prevent"]))
            }, " +行 ", 34),
            s("button", {
              type: "button",
              "data-tooltip": "增加列",
              class: H({ "tooltip-visible": x.value === "增加列" }),
              onMouseenter: e[22] || (e[22] = (n) => g("增加列")),
              onMouseleave: a,
              onFocus: e[23] || (e[23] = (n) => g("增加列")),
              onBlur: a,
              onTouchstartPassive: e[24] || (e[24] = (n) => B("增加列")),
              onTouchend: a,
              onTouchcancel: a,
              onClick: ft,
              onPointerdown: e[25] || (e[25] = D(() => {
              }, ["prevent"]))
            }, " +列 ", 34)
          ])) : A("", !0),
          Ke.value ? (k(), T("button", {
            key: 5,
            type: "button",
            class: H(["rv-editor__icon-button icon-button", { "tooltip-visible": x.value === "分割线" }]),
            title: "分割线",
            "aria-label": "分割线",
            "data-tooltip": "分割线",
            onMouseenter: e[26] || (e[26] = (n) => g("分割线")),
            onMouseleave: a,
            onFocus: e[27] || (e[27] = (n) => g("分割线")),
            onBlur: a,
            onTouchstartPassive: e[28] || (e[28] = (n) => B("分割线")),
            onTouchend: a,
            onTouchcancel: a,
            onClick: vt,
            onPointerdown: _
          }, " — ", 34)) : A("", !0),
          We.value ? (k(), T("button", {
            key: 6,
            type: "button",
            class: H(["rv-editor__icon-button icon-button", { "tooltip-visible": x.value === "图片" }]),
            title: "图片",
            "aria-label": O.value ? "图片处理中" : "图片",
            "aria-expanded": h.value,
            disabled: O.value,
            "data-tooltip": "图片",
            onMouseenter: e[29] || (e[29] = (n) => g("图片")),
            onMouseleave: a,
            onFocus: e[30] || (e[30] = (n) => g("图片")),
            onBlur: a,
            onTouchstartPassive: e[31] || (e[31] = (n) => B("图片")),
            onTouchend: a,
            onTouchcancel: a,
            onClick: ot
          }, X(O.value ? "…" : "▧"), 43, an)) : A("", !0),
          Qe.value ? (k(), T("button", {
            key: 7,
            type: "button",
            class: H(["rv-editor__icon-button icon-button", { "tooltip-visible": x.value === "视频" }]),
            title: "视频",
            "aria-label": j.value ? "视频处理中" : "视频",
            "aria-expanded": p.value,
            disabled: j.value,
            "data-tooltip": "视频",
            onMouseenter: e[32] || (e[32] = (n) => g("视频")),
            onMouseleave: a,
            onFocus: e[33] || (e[33] = (n) => g("视频")),
            onBlur: a,
            onTouchstartPassive: e[34] || (e[34] = (n) => B("视频")),
            onTouchend: a,
            onTouchcancel: a,
            onClick: rt
          }, X(j.value ? "…" : "▶"), 43, rn)) : A("", !0)
        ]),
        s("input", {
          ref_key: "fileInputRef",
          ref: y,
          class: "rv-editor__visually-hidden visually-hidden",
          type: "file",
          accept: "image/*",
          onChange: lt
        }, null, 544),
        s("input", {
          ref_key: "videoInputRef",
          ref: M,
          class: "rv-editor__visually-hidden visually-hidden",
          type: "file",
          accept: "video/*",
          onChange: it
        }, null, 544)
      ]),
      h.value ? (k(), T("div", {
        key: 0,
        class: "rv-editor__dialog-backdrop image-dialog-backdrop",
        role: "presentation",
        onPointerdown: e[37] || (e[37] = D((n) => h.value = !1, ["self"]))
      }, [
        s("section", un, [
          s("div", sn, [
            e[49] || (e[49] = s("h3", null, "添加图片", -1)),
            s("button", {
              type: "button",
              "aria-label": "关闭添加图片弹窗",
              onClick: e[35] || (e[35] = (n) => h.value = !1)
            }, " × ")
          ]),
          s("label", dn, [
            e[50] || (e[50] = s("span", null, "图片链接", -1)),
            le(s("input", {
              "onUpdate:modelValue": e[36] || (e[36] = (n) => W.value = n),
              type: "url",
              placeholder: "https://...",
              onKeydown: ae(D(ke, ["prevent"]), ["enter"])
            }, null, 40, cn), [
              [re, W.value]
            ])
          ]),
          s("div", pn, [
            s("button", {
              type: "button",
              class: "rv-editor__secondary-button secondary-button",
              onClick: ke
            }, " 插入链接 "),
            s("button", {
              type: "button",
              class: "rv-editor__primary-button primary-button",
              title: o.imageMode === "url" && !o.uploadImage ? "需要传入 uploadImage 函数" : "选择图片",
              disabled: o.imageMode === "url" && !o.uploadImage,
              onClick: nt
            }, " 选择图片 ", 8, vn)
          ])
        ])
      ], 32)) : A("", !0),
      p.value ? (k(), T("div", {
        key: 1,
        class: "rv-editor__dialog-backdrop image-dialog-backdrop",
        role: "presentation",
        onPointerdown: e[40] || (e[40] = D((n) => p.value = !1, ["self"]))
      }, [
        s("section", gn, [
          s("div", mn, [
            e[51] || (e[51] = s("h3", null, "添加视频", -1)),
            s("button", {
              type: "button",
              "aria-label": "关闭添加视频弹窗",
              onClick: e[38] || (e[38] = (n) => p.value = !1)
            }, " × ")
          ]),
          s("label", fn, [
            e[52] || (e[52] = s("span", null, "视频链接", -1)),
            le(s("input", {
              "onUpdate:modelValue": e[39] || (e[39] = (n) => E.value = n),
              type: "url",
              placeholder: "https://...",
              onKeydown: ae(D(Te, ["prevent"]), ["enter"])
            }, null, 40, bn), [
              [re, E.value]
            ])
          ]),
          s("div", hn, [
            s("button", {
              type: "button",
              class: "rv-editor__secondary-button secondary-button",
              onClick: Te
            }, " 插入链接 "),
            s("button", {
              type: "button",
              class: "rv-editor__primary-button primary-button",
              title: o.videoMode === "url" && !o.uploadVideo ? "需要传入 uploadVideo 函数" : "选择视频",
              disabled: o.videoMode === "url" && !o.uploadVideo,
              onClick: at
            }, " 选择视频 ", 8, yn)
          ])
        ])
      ], 32)) : A("", !0),
      S.value ? (k(), T("div", {
        key: 2,
        class: "rv-editor__dialog-backdrop image-dialog-backdrop",
        role: "presentation",
        onPointerdown: e[45] || (e[45] = D((n) => S.value = !1, ["self"]))
      }, [
        s("section", $n, [
          s("div", kn, [
            e[53] || (e[53] = s("h3", null, "添加链接", -1)),
            s("button", {
              type: "button",
              "aria-label": "关闭添加链接弹窗",
              onClick: e[41] || (e[41] = (n) => S.value = !1)
            }, " × ")
          ]),
          s("label", Tn, [
            e[54] || (e[54] = s("span", null, "链接地址", -1)),
            le(s("input", {
              "onUpdate:modelValue": e[42] || (e[42] = (n) => q.value = n),
              type: "url",
              placeholder: "https://...",
              onKeydown: ae(D(de, ["prevent"]), ["enter"])
            }, null, 40, wn), [
              [re, q.value]
            ])
          ]),
          s("label", xn, [
            e[55] || (e[55] = s("span", null, "链接文本", -1)),
            le(s("input", {
              "onUpdate:modelValue": e[43] || (e[43] = (n) => Z.value = n),
              type: "text",
              placeholder: "显示文本",
              disabled: !!U.value,
              onKeydown: ae(D(de, ["prevent"]), ["enter"])
            }, null, 40, Sn), [
              [re, Z.value]
            ])
          ]),
          s("div", Cn, [
            s("button", {
              type: "button",
              class: "rv-editor__secondary-button secondary-button",
              onClick: e[44] || (e[44] = (n) => S.value = !1)
            }, " 取消 "),
            s("button", {
              type: "button",
              class: "rv-editor__primary-button primary-button",
              onClick: de
            }, " 插入链接 ")
          ])
        ])
      ], 32)) : A("", !0),
      s("article", {
        ref_key: "editorRef",
        ref: r,
        class: "rv-editor__content rich-editor",
        contenteditable: v.value ? "true" : "false",
        "data-placeholder": o.placeholder,
        "aria-readonly": o.readonly,
        "aria-disabled": o.disabled,
        style: Ht(Ge.value),
        innerHTML: Rt(ze),
        onInput: L,
        onClick: tt,
        onPointerdown: _,
        onKeydown: et,
        onKeyup: P,
        onMouseup: P,
        onFocus: e[46] || (e[46] = (n) => d("focus", n)),
        onBlur: e[47] || (e[47] = (n) => d("blur", n)),
        onPaste: Ze
      }, null, 44, Mn)
    ], 512));
  }
}, Hn = {
  install(o) {
    o.component("RichTextEditor", En);
  }
};
export {
  En as RichTextEditor,
  Hn as default,
  Ut as editorHtmlToMarkdown,
  An as markdownToEditorHtml,
  V as sanitizeEditorHtml,
  Re as taggedTextToEditorHtml,
  Rn as wrapHtmlDocument
};
