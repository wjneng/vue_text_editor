import { ref as f, computed as y, watch as Ln, onMounted as An, onBeforeUnmount as Bn, openBlock as m, createElementBlock as b, createElementVNode as s, toDisplayString as G, createCommentVNode as w, normalizeClass as T, Fragment as fe, renderList as ge, withModifiers as P, normalizeStyle as rt, withDirectives as $e, withKeys as we, vModelText as Ce, unref as Hn } from "vue";
const zn = /* @__PURE__ */ new Set(["blockquote", "pre", "h1", "h2", "h3", "h4", "h5", "h6"]);
function it(o = "") {
  return zn.has(String(o).toLowerCase());
}
function Nn(o, r, u) {
  return !o || !r ? !1 : u > r.bottom && u <= o.bottom;
}
const Pn = [
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
], In = ["strong", "em", "u", "s", "code", "br", "img", "video", "a", "span", "font"], ut = [...Pn, ...In];
function Y(o = "") {
  let r = String(o).replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "").replace(/<(\/?)b(\s[^>]*)?>/gi, "<$1strong>").replace(/<(\/?)i(\s[^>]*)?>/gi, "<$1em>").replace(/<font(\s[^>]*)?>/gi, (u, l) => {
    const d = Yn(l);
    return d ? `<span style="color: ${d}">` : "<span>";
  }).replace(/<\/font>/gi, "</span>").replace(/<div(\s[^>]*)?>/gi, "<p>").replace(/<\/div>/gi, "</p>").replace(/<br\s*\/?>/gi, "<br>").replace(/<\/br>/gi, "");
  return r = r.replace(/<([a-z][a-z0-9-]*)([^>]*)>/gi, (u, l, d) => {
    const i = l.toLowerCase();
    if (!ut.includes(i))
      return "";
    if (i === "img") {
      const g = q(J(d, "src"));
      if (!g)
        return "";
      const $ = le(q(J(d, "alt") || "图片"));
      return `<img src="${le(g)}" alt="${$}">`;
    }
    if (i === "video") {
      const g = q(J(d, "src"));
      return g ? `<video src="${le(g)}" controls>` : "";
    }
    if (i === "a") {
      const g = q(J(d, "href"));
      return g ? `<a href="${le(g)}">` : "";
    }
    if (i === "span") {
      const g = Gn(d);
      return g ? `<span style="${g}">` : "<span>";
    }
    return i === "hr" ? "<hr>" : `<${i}>`;
  }), r = r.replace(/<\/([a-z][a-z0-9-]*)>/gi, (u, l) => {
    const d = l.toLowerCase();
    return ut.includes(d) && d !== "img" && d !== "br" && d !== "hr" ? `</${d}>` : "";
  }), On(r).trim();
}
function pt(o = "") {
  const r = ft(String(o || "").trim());
  return /<(h[1-6]|p|blockquote|pre|ul|ol|li|strong|em|u|s|code|img|video|a|hr|table|thead|tbody|tr|th|td)\b[\s\S]*>/i.test(r) ? Y(r) : null;
}
function _n({ html: o = "", text: r = "" } = {}) {
  const u = String(r || ""), l = String(o || "");
  return Vn(u) && !qn(l) ? st(u) : l ? pt(l) : st(u);
}
function st(o = "") {
  const r = String(o || "").replace(/\r\n?/g, `
`).trim();
  return r ? `<p>${_e(r).replace(/\n/g, "<br>")}</p>` : null;
}
function Yo(o = "") {
  const r = String(o || "").replace(/\r\n?/g, `
`).split(`
`), u = [];
  let l = [], d = [], i = [], g = [], $ = [], H = !1;
  const S = () => {
    l.length && (u.push(`<p>${ne(l.join(" "))}</p>`), l = []);
  }, _ = () => {
    d.length && (u.push(`<ul>${d.map((I) => `<li>${ne(I)}</li>`).join("")}</ul>`), d = []);
  }, h = () => {
    i.length && (u.push(`<ol>${i.map((I) => `<li>${ne(I)}</li>`).join("")}</ol>`), i = []);
  }, V = () => {
    g.length && (u.push(`<blockquote>${g.map((I) => ne(I)).join("<br>")}</blockquote>`), g = []);
  }, ae = () => {
    u.push(`<pre><code>${_e($.join(`
`).trim())}</code></pre>`), $ = [];
  };
  let E = 0;
  for (; E < r.length; ) {
    const I = r[E];
    if (/^```/.test(I.trim())) {
      H ? (ae(), H = !1) : (S(), _(), h(), V(), H = !0), E += 1;
      continue;
    }
    if (H) {
      $.push(I), E += 1;
      continue;
    }
    const O = I.trim(), R = Un(r, E);
    if (R) {
      S(), _(), h(), V(), u.push(R.html), E += R.linesUsed;
      continue;
    }
    if (!O) {
      S(), _(), h(), V(), E += 1;
      continue;
    }
    if (O.match(/^(-{3,}|\*{3,}|_{3,})$/)) {
      S(), _(), h(), V(), u.push("<hr>"), E += 1;
      continue;
    }
    const z = O.match(/^(#{1,6})\s+(.+)$/);
    if (z) {
      S(), _(), h(), V(), u.push(`<h${z[1].length}>${ne(z[2])}</h${z[1].length}>`), E += 1;
      continue;
    }
    const x = O.match(/^>\s?(.+)$/);
    if (x) {
      S(), _(), h(), g.push(x[1]), E += 1;
      continue;
    }
    const Q = O.match(/^[-*]\s+(.+)$/);
    if (Q) {
      S(), h(), V(), d.push(Q[1]), E += 1;
      continue;
    }
    const M = O.match(/^\d+\.\s+(.+)$/);
    if (M) {
      S(), _(), V(), i.push(M[1]), E += 1;
      continue;
    }
    l.push(O), E += 1;
  }
  return H && ae(), S(), _(), h(), V(), Y(u.join("") || "<p><br></p>");
}
function ft(o) {
  const r = o.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  return r ? r[1].trim() : o;
}
function Vn(o) {
  return String(o || "").replace(/\r\n?/g, `
`).split(`
`).filter((r) => r.trim()).length > 1;
}
function qn(o) {
  const r = ft(String(o || ""));
  return /<br\b/i.test(r) || /[\r\n]/.test(r) ? !0 : (r.match(/<(?:p|div|li|h[1-6]|blockquote|pre|tr|table)\b/gi)?.length || 0) > 1;
}
function On(o) {
  const r = String(o).split(/(<[^>]+>)/g);
  let u = !1;
  return r.map((l) => {
    if (!l)
      return "";
    const d = l.match(/^<\/?([a-z][a-z0-9-]*)\b/i);
    if (d) {
      const i = d[1].toLowerCase();
      return /^<\//.test(l) && ["pre", "code"].includes(i) ? u = !1 : !/^<\//.test(l) && ["pre", "code"].includes(i) && (u = !0), l;
    }
    return u ? l : l.replace(/\r\n?|\n/g, "<br>");
  }).join("");
}
function Un(o, r) {
  const u = o[r]?.trim(), l = o[r + 1]?.trim();
  if (!Pe(u) || !Dn(l))
    return null;
  const d = Ie(u), i = [];
  let g = r + 2;
  for (; Pe(o[g]?.trim()); )
    i.push(Ie(o[g].trim())), g += 1;
  const $ = `<thead><tr>${d.map((S) => `<th>${ne(S)}</th>`).join("")}</tr></thead>`, H = i.length ? `<tbody>${i.map((S) => `<tr>${d.map((_, h) => `<td>${ne(S[h] || "")}</td>`).join("")}</tr>`).join("")}</tbody>` : "<tbody></tbody>";
  return {
    html: `<table>${$}${H}</table>`,
    linesUsed: Math.max(2, g - r)
  };
}
function Pe(o = "") {
  return /^\|.+\|$/.test(o);
}
function Dn(o = "") {
  return Pe(o) ? Ie(o).every((r) => /^:?-{3,}:?$/.test(r.trim())) : !1;
}
function Ie(o = "") {
  return o.replace(/^\|/, "").replace(/\|$/, "").split("|").map((r) => r.trim());
}
function jn(o = "") {
  let r = Y(o);
  return r = r.replace(/<figure>\s*/gi, "").replace(/\s*<\/figure>/gi, "").replace(/<figcaption>[\s\S]*?<\/figcaption>/gi, "").replace(/<img\b([^>]*)>/gi, (u, l) => {
    const d = J(l, "src"), i = J(l, "alt") || "图片";
    return d ? `![${i}](${d})` : "";
  }).replace(/<video\b([^>]*)>(?:[\s\S]*?<\/video>)?/gi, (u, l) => {
    const d = J(l, "src");
    return d ? `<video src="${d}" controls></video>

` : "";
  }).replace(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi, (u, l, d) => {
    const i = J(l, "href"), g = oe(d).trim();
    return i && g ? `[${g}](${i})` : g;
  }).replace(/<hr>/gi, `---

`).replace(/<table>([\s\S]*?)<\/table>/gi, (u, l) => Wn(l)).replace(/<h1>([\s\S]*?)<\/h1>/gi, `# $1

`).replace(/<h2>([\s\S]*?)<\/h2>/gi, `## $1

`).replace(/<h3>([\s\S]*?)<\/h3>/gi, `### $1

`).replace(/<h4>([\s\S]*?)<\/h4>/gi, `#### $1

`).replace(/<h5>([\s\S]*?)<\/h5>/gi, `##### $1

`).replace(/<h6>([\s\S]*?)<\/h6>/gi, `###### $1

`).replace(/<blockquote>([\s\S]*?)<\/blockquote>/gi, (u, l) => {
    const d = oe(l).trim();
    return d ? `> ${d}

` : "";
  }).replace(/<pre>(?!<code>)([\s\S]*?)<\/pre>/gi, (u, l) => `\`\`\`
${q(oe(l)).trim()}
\`\`\`

`).replace(/<pre><code>([\s\S]*?)<\/code><\/pre>/gi, (u, l) => `\`\`\`
${q(oe(l)).trim()}
\`\`\`

`).replace(/<ul>([\s\S]*?)<\/ul>/gi, (u, l) => dt(l, "-")).replace(/<ol>([\s\S]*?)<\/ol>/gi, (u, l) => dt(l, "1.")).replace(/<p>([\s\S]*?)<\/p>/gi, `$1

`).replace(/<strong>([\s\S]*?)<\/strong>/gi, "**$1**").replace(/<em>([\s\S]*?)<\/em>/gi, "*$1*").replace(/<s>([\s\S]*?)<\/s>/gi, "~~$1~~").replace(/<code>([\s\S]*?)<\/code>/gi, "`$1`").replace(/<u>([\s\S]*?)<\/u>/gi, "<u>$1</u>").replace(/<br>/gi, `
`), q(Xn(r)).replace(/[ \t]+\n/g, `
`).replace(/\n{3,}/g, `

`).trim();
}
function Jo(o) {
  return [
    "<!doctype html>",
    '<html lang="zh-CN">',
    "<head>",
    '  <meta charset="UTF-8">',
    '  <meta name="viewport" content="width=device-width, initial-scale=1.0">',
    "  <title>导出的文档</title>",
    "</head>",
    `<body style="${k.body}">`,
    `  <main style="${k.main}">`,
    Kn(Y(o)),
    "  </main>",
    "</body>",
    "</html>"
  ].join(`
`);
}
const k = {
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
function Kn(o) {
  return o.replace(/<h1>/gi, `<h1 style="${k.h1}">`).replace(/<h2>/gi, `<h2 style="${k.h2}">`).replace(/<h3>/gi, `<h3 style="${k.h3}">`).replace(/<h4>/gi, `<h4 style="${k.h4}">`).replace(/<h5>/gi, `<h5 style="${k.h5}">`).replace(/<h6>/gi, `<h6 style="${k.h6}">`).replace(/<p>/gi, `<p style="${k.p}">`).replace(/<blockquote>/gi, `<blockquote style="${k.blockquote}">`).replace(/<ul>/gi, `<ul style="${k.ul}">`).replace(/<ol>/gi, `<ol style="${k.ol}">`).replace(/<hr>/gi, `<hr style="${k.hr}">`).replace(/<table>/gi, `<table style="${k.table}">`).replace(/<th>/gi, `<th style="${k.th}">`).replace(/<td>/gi, `<td style="${k.td}">`).replace(/<figure>/gi, `<figure style="${k.figure}">`).replace(/<pre><code>/gi, `<pre style="${k.pre}"><code style="${k.preCode}">`).replace(/<pre>/gi, `<pre style="${k.pre}">`).replace(/<code>/gi, `<code style="${k.code}">`).replace(/<img\b([^>]*)>/gi, `<img$1 style="${k.img}">`).replace(/<video\b([^>]*)>/gi, `<video$1 style="${k.video}">`);
}
function dt(o, r) {
  const u = [...o.matchAll(/<li>([\s\S]*?)<\/li>/gi)].map((l) => oe(l[1]).trim()).filter(Boolean);
  return u.length ? `${u.map((l) => `${r} ${l}`).join(`
`)}

` : "";
}
function Wn(o) {
  const r = [...o.matchAll(/<th>([\s\S]*?)<\/th>/gi)].map(($) => oe($[1]).trim()), u = [...o.matchAll(/<tr>([\s\S]*?)<\/tr>/gi)].map(($) => [...$[1].matchAll(/<td>([\s\S]*?)<\/td>/gi)].map((H) => oe(H[1]).trim())).filter(($) => $.length);
  if (!r.length && !u.length)
    return "";
  const l = Math.max(r.length, ...u.map(($) => $.length)), d = Array.from({ length: l }, ($, H) => r[H] || ""), i = Array.from({ length: l }, () => "---"), g = u.map(($) => Array.from({ length: l }, (H, S) => $[S] || ""));
  return [
    Ne(d),
    Ne(i),
    ...g.map(Ne),
    ""
  ].join(`
`);
}
function Ne(o) {
  return `| ${o.join(" | ")} |`;
}
function oe(o) {
  return String(o).replace(/<\/?[^>]+>/g, "");
}
function Xn(o) {
  return String(o).replace(/<\/?(p|h1|h2|h3|h4|h5|h6|blockquote|pre|ul|ol|li|figure|figcaption|hr|table|thead|tbody|tr|th|td)>/gi, "");
}
function ne(o) {
  return _e(o).replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+["'][^"']+["'])?\)/g, (r, u, l) => `<img src="${le(q(l.trim()))}" alt="${le(q(u.trim() || "图片"))}">`).replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+["'][^"']+["'])?\)/g, (r, u, l) => `<a href="${le(q(l.trim()))}">${u}</a>`).replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/\*([^*]+)\*/g, "<em>$1</em>").replace(/~~([^~]+)~~/g, "<s>$1</s>").replace(/`([^`]+)`/g, "<code>$1</code>");
}
function _e(o) {
  return String(o).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}
function J(o, r) {
  const u = new RegExp(`${r}=(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"), l = String(o || "").match(u);
  return l?.[1] || l?.[2] || l?.[3] || "";
}
function Gn(o) {
  const r = me(o, "font-family"), u = me(o, "color"), l = me(o, "background-color") || me(o, "background"), d = me(o, "font-size");
  return [
    r ? `font-family: ${r}` : "",
    d ? `font-size: ${d}` : "",
    u ? `color: ${u}` : "",
    l ? `background-color: ${l}` : ""
  ].filter(Boolean).join("; ");
}
function me(o, r) {
  const u = q(J(o, "style")), l = r.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), d = u.match(new RegExp(`(?:^|;)\\s*${l}\\s*:\\s*([^;]+)\\s*(?:;|$)`, "i"));
  if (!d)
    return "";
  const i = d[1].trim();
  return r === "font-size" ? Jn(i) : r === "font-family" ? Qn(i) : gt(i) ? i : "";
}
function Yn(o) {
  const r = q(J(o, "color")).trim();
  return gt(r) ? r : "";
}
function gt(o) {
  return /^#[0-9a-f]{3}(?:[0-9a-f]{3})?$/i.test(o) || /^rgba?\(\s*(?:\d{1,3}\s*,\s*){2}\d{1,3}(?:\s*,\s*(?:0|1|0?\.\d+))?\s*\)$/i.test(o);
}
function Jn(o) {
  const r = String(o || "").trim().toLowerCase();
  return /^(?:12|14|16|18|20|24|28|32)px$/.test(r) ? r : "";
}
function Qn(o) {
  const r = String(o || "").trim();
  return (/* @__PURE__ */ new Set([
    "system-ui, sans-serif",
    "'PingFang SC', sans-serif",
    "'Microsoft YaHei', 'PingFang SC', sans-serif",
    "SimHei, sans-serif",
    "SimSun, serif",
    "Arial, sans-serif",
    "Georgia, serif",
    "'SFMono-Regular', Consolas, 'Liberation Mono', monospace"
  ])).has(r) ? r : "";
}
function le(o) {
  return String(o).replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}
function q(o) {
  return String(o).replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}
const Zn = "标题", mt = "内容";
function eo(o = "") {
  return (String(o).match(/<tr>[\s\S]*?<\/tr>/gi) || []).reduce((u, l) => Math.max(u, oo(l)), 0);
}
function to(o = "") {
  const r = String(o), u = Math.max(1, eo(r)), l = `<tr>${Array.from({ length: u }, () => `<td>${mt}</td>`).join("")}</tr>`;
  return /<tbody>[\s\S]*?<\/tbody>/i.test(r) ? r.replace(/<\/tbody>/i, `${l}</tbody>`) : r.replace(/<\/table>/i, `<tbody>${l}</tbody></table>`);
}
function no(o = "") {
  return String(o).replace(/<tr>([\s\S]*?)<\/tr>/gi, (r, u) => {
    const d = /<th>[\s\S]*?<\/th>/i.test(u) && !/<td>[\s\S]*?<\/td>/i.test(u) ? `<th>${Zn}</th>` : `<td>${mt}</td>`;
    return `<tr>${u}${d}</tr>`;
  });
}
function oo(o = "") {
  return (String(o).match(/<(th|td)>[\s\S]*?<\/\1>/gi) || []).length;
}
const lo = { class: "rv-editor__heading panel-heading" }, ao = {
  class: "rv-editor__toolbar editor-toolbar",
  "aria-label": "样式快捷选择"
}, ro = { class: "rv-editor__toolbar-row toolbar-row" }, io = ["aria-expanded"], uo = {
  key: 1,
  class: "rv-editor__menu toolbar-menu"
}, so = ["onClick"], co = ["aria-expanded", "disabled"], vo = {
  key: 0,
  class: "rv-editor__menu toolbar-menu font-family-menu"
}, po = ["onClick"], fo = ["title", "aria-label", "data-tooltip", "onMouseenter", "onFocus", "onTouchstartPassive", "onClick"], go = ["title", "data-tooltip", "onMouseenter", "onFocus", "onTouchstartPassive", "onClick"], mo = ["aria-expanded", "disabled"], bo = {
  key: 0,
  class: "rv-editor__menu toolbar-menu"
}, ho = ["onClick"], yo = {
  key: 2,
  class: "rv-editor__dropdown toolbar-dropdown"
}, ko = ["disabled"], To = ["value"], $o = {
  key: 3,
  class: "rv-editor__dropdown toolbar-dropdown"
}, wo = ["disabled"], Co = ["value"], So = {
  key: 8,
  class: "rv-editor__table-actions table-actions",
  "aria-label": "表格操作"
}, xo = ["aria-label", "aria-expanded", "disabled"], Mo = ["aria-label", "aria-expanded", "disabled"], Fo = {
  class: "rv-editor__dialog image-dialog",
  role: "dialog",
  "aria-modal": "true",
  "aria-label": "添加图片"
}, Eo = { class: "rv-editor__dialog-heading image-dialog-heading" }, Ro = { class: "rv-editor__url-field image-url-field" }, Lo = ["onKeydown"], Ao = { class: "rv-editor__dialog-actions image-dialog-actions" }, Bo = ["title", "disabled"], Ho = {
  class: "rv-editor__dialog image-dialog",
  role: "dialog",
  "aria-modal": "true",
  "aria-label": "添加视频"
}, zo = { class: "rv-editor__dialog-heading image-dialog-heading" }, No = { class: "rv-editor__url-field image-url-field" }, Po = ["onKeydown"], Io = { class: "rv-editor__dialog-actions image-dialog-actions" }, _o = ["title", "disabled"], Vo = {
  class: "rv-editor__dialog image-dialog",
  role: "dialog",
  "aria-modal": "true",
  "aria-label": "添加链接"
}, qo = { class: "rv-editor__dialog-heading image-dialog-heading" }, Oo = { class: "rv-editor__url-field image-url-field" }, Uo = ["onKeydown"], Do = { class: "rv-editor__url-field image-url-field" }, jo = ["disabled", "onKeydown"], Ko = { class: "rv-editor__dialog-actions image-dialog-actions" }, Wo = ["contenteditable", "data-placeholder", "aria-readonly", "aria-disabled", "innerHTML"], ct = "#172026", vt = "#fff3bf", Xo = {
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
  setup(o, { expose: r, emit: u }) {
    const l = o, d = u, i = f(null), g = f(null), $ = f(null), H = f(null), S = f(null), _ = f(null), h = f(null), V = f(null), ae = f(null), E = f(null), I = f(null), O = f("p"), R = f(!1), U = f(!1), z = f(!1), x = f(!1), Q = f(""), M = f(!1), be = f(""), D = f(!1), ue = f(""), se = f(""), he = f(""), de = f(!1), ce = f(!1), F = f(""), j = f(null), re = f(Y(l.modelValue || l.initialValue)), Se = f(ct), xe = f(vt), Z = f("system-ui, sans-serif"), ye = f("16px"), K = f(!1), bt = re.value, Ve = [
      { label: "正文", value: "p" },
      { label: "H1", value: "h1" },
      { label: "H2", value: "h2" },
      { label: "H3", value: "h3" },
      { label: "H4", value: "h4" },
      { label: "H5", value: "h5" },
      { label: "H6", value: "h6" }
    ], ht = [
      { key: "blockquote", label: "引用", icon: "❝", command: "formatBlock", value: "blockquote" },
      { key: "codeBlock", label: "代码块", icon: "{ }", command: "formatBlock", value: "pre" }
    ], yt = [
      { key: "bold", label: "B", command: "bold", title: "加粗" },
      { key: "italic", label: "I", command: "italic", title: "斜体" },
      { key: "underline", label: "U", command: "underline", title: "下划线" },
      { key: "strike", label: "S", command: "strikeThrough", title: "删除线" },
      { key: "inlineCode", label: "</>", command: "formatBlock", value: "p", wrap: "code", title: "行内代码" }
    ], qe = [
      { label: "12", value: "12px" },
      { label: "14", value: "14px" },
      { label: "16", value: "16px" },
      { label: "18", value: "18px" },
      { label: "20", value: "20px" },
      { label: "24", value: "24px" },
      { label: "28", value: "28px" },
      { label: "32", value: "32px" }
    ], ke = [
      { label: "默认", value: "system-ui, sans-serif" },
      { label: "苹方", value: "'PingFang SC', sans-serif" },
      { label: "微软雅黑", value: "'Microsoft YaHei', 'PingFang SC', sans-serif" },
      { label: "黑体", value: "SimHei, sans-serif" },
      { label: "宋体", value: "SimSun, serif" },
      { label: "Arial", value: "Arial, sans-serif" },
      { label: "Georgia", value: "Georgia, serif" },
      { label: "等宽", value: "'SFMono-Regular', Consolas, 'Liberation Mono', monospace" }
    ], kt = [
      "heading",
      "blockquote",
      "codeBlock",
      "bold",
      "italic",
      "underline",
      "strike",
      "inlineCode",
      "fontFamily",
      "fontSize",
      "textColor",
      "backgroundColor",
      "unorderedList",
      "orderedList",
      "table",
      "link",
      "divider",
      "image",
      "video"
    ], N = y(() => new Set(
      Array.isArray(l.enabledTools) && l.enabledTools.length ? Vt(l.enabledTools) : kt
    )), Oe = y(() => N.value.has("heading") ? Ve : Ve.slice(0, 1)), Tt = y(() => ht.filter((t) => N.value.has(t.key))), $t = y(() => yt.filter((t) => N.value.has(t.key))), wt = y(() => N.value.has("heading")), Ct = y(() => N.value.has("unorderedList")), St = y(() => N.value.has("orderedList")), Ue = y(() => N.value.has("table")), xt = y(() => Ue.value && !!j.value), Mt = y(() => N.value.has("link")), Ft = y(() => N.value.has("divider")), Et = y(() => N.value.has("image")), Rt = y(() => N.value.has("video")), Lt = y(() => N.value.has("fontFamily")), At = y(() => N.value.has("fontSize")), Bt = y(() => N.value.has("textColor")), Ht = y(() => N.value.has("backgroundColor")), Me = y(() => v.value && K.value), Fe = y(() => v.value && K.value), Ee = y(() => v.value && K.value), Re = y(() => v.value && K.value), zt = y(
      () => Oe.value.find((t) => t.value === O.value)?.label || "正文"
    ), Nt = y(
      () => ke.find((t) => t.value === Z.value)?.label || "默认"
    ), Pt = y(() => ({
      minHeight: l.minHeight
    })), v = y(() => !l.readonly && !l.disabled);
    Ln(
      () => l.modelValue,
      (t) => {
        const e = Y(t || l.initialValue);
        e !== re.value && (re.value = e, i.value && i.value.innerHTML !== e && (i.value.innerHTML = e));
      }
    ), An(() => {
      document.addEventListener("pointerdown", De), document.addEventListener("selectionchange", Ke);
    }), Bn(() => {
      document.removeEventListener("pointerdown", De), document.removeEventListener("selectionchange", Ke);
    });
    function ve(t) {
      if (v.value) {
        if (a(), te(), t.wrap === "code") {
          Qt(), B();
          return;
        }
        document.execCommand(t.command, !1, t.value), B(), C();
      }
    }
    function It(t) {
      v.value && (a(), t && (O.value = t, R.value = !1, ve({ command: "formatBlock", value: t })));
    }
    function _t() {
      v.value && (a(), C(), U.value = !1, z.value = !1, x.value = !1, M.value = !1, D.value = !1, R.value = !R.value);
    }
    function De(t) {
      !R.value && !U.value && !z.value && !x.value && !M.value && !D.value || g.value?.contains(t.target) || W();
    }
    function W() {
      R.value = !1, U.value = !1, z.value = !1, x.value = !1, M.value = !1, D.value = !1;
    }
    function p(t) {
      F.value = t;
    }
    function a() {
      F.value = "";
    }
    function A(t) {
      p(t);
    }
    function Vt(t) {
      const e = new Set(t);
      return e.has("list") && (e.add("unorderedList"), e.add("orderedList")), [...e];
    }
    function je() {
      v.value && (i.value && (i.value.innerHTML = "<p><br></p>"), Le("<p><br></p>"), Se.value = ct, xe.value = vt, Z.value = "system-ui, sans-serif", ye.value = "16px", te());
    }
    function B() {
      if (!v.value || !i.value)
        return;
      const t = pt(i.value.innerText);
      t && (i.value.innerHTML = t), Le(i.value.innerHTML);
    }
    function Le(t) {
      const e = Y(t);
      re.value = e, d("update:modelValue", e), d("change", e);
    }
    function C() {
      const t = window.getSelection();
      if (!t || t.rangeCount === 0 || !i.value) {
        K.value = !1;
        return;
      }
      const e = t.getRangeAt(0);
      if (i.value.contains(e.commonAncestorContainer)) {
        h.value = e.cloneRange(), K.value = ie(e), et(e.commonAncestorContainer), Ye(e);
        return;
      }
      K.value = !1;
    }
    function Ke() {
      if (!i.value) {
        K.value = !1;
        return;
      }
      const t = window.getSelection();
      if (!t || t.rangeCount === 0) {
        K.value = !1;
        return;
      }
      const e = t.getRangeAt(0);
      if (i.value.contains(e.commonAncestorContainer)) {
        K.value = ie(e), Ye(e);
        return;
      }
      K.value = !1;
    }
    function qt(t) {
      if (!v.value)
        return;
      const e = t.clipboardData?.getData("text/html"), n = t.clipboardData?.getData("text/plain"), c = _n({ html: e, text: n });
      c && (t.preventDefault(), ee(c), B());
    }
    function Ot(t) {
      if (!v.value || t.key !== "Enter" || t.shiftKey)
        return;
      const e = $n();
      !e || !it(e.tagName) || (t.preventDefault(), wn(e), B());
    }
    function Ut(t) {
      if (!v.value)
        return;
      const e = t.target?.tagName?.toLowerCase();
      if (e === "img" || e === "video") {
        xn(t.target), C();
        return;
      }
      if (t.target !== i.value) {
        C();
        return;
      }
      const n = Cn();
      if (!n) {
        tt();
        return;
      }
      Nn(
        i.value.getBoundingClientRect(),
        n.getBoundingClientRect(),
        t.clientY
      ) ? tt() : C();
    }
    function Dt() {
      v.value && (x.value = !1, C(), te(), $.value?.click());
    }
    function jt() {
      v.value && (a(), C(), R.value = !1, M.value = !1, x.value = !x.value);
    }
    function We() {
      if (!v.value)
        return;
      a();
      const t = Q.value.trim();
      t && (x.value = !1, Q.value = "", Ae(t, "图片链接"), B());
    }
    async function Kt(t) {
      if (!v.value)
        return;
      const e = t.target.files?.[0];
      if (e)
        try {
          de.value = !0, d("image-upload-start", e);
          const n = l.imageMode === "url" ? await Yt(e) : await Ge(e), c = e.name.replace(/\.[^.]+$/, "") || "图片";
          Ae(n, c), B(), d("image-upload-end", { file: e, src: n });
        } catch (n) {
          d("image-upload-error", { file: e, error: n });
        } finally {
          de.value = !1, t.target.value = "";
        }
    }
    function Wt() {
      v.value && (M.value = !1, C(), te(), H.value?.click());
    }
    function Xt() {
      v.value && (a(), C(), R.value = !1, x.value = !1, M.value = !M.value);
    }
    function Xe() {
      if (!v.value)
        return;
      a();
      const t = be.value.trim();
      t && (M.value = !1, be.value = "", Be(t), B());
    }
    async function Gt(t) {
      if (!v.value)
        return;
      const e = t.target.files?.[0];
      if (e)
        try {
          ce.value = !0, d("video-upload-start", e);
          const n = l.videoMode === "url" ? await Jt(e) : await Ge(e);
          Be(n), B(), d("video-upload-end", { file: e, src: n });
        } catch (n) {
          d("video-upload-error", { file: e, error: n });
        } finally {
          ce.value = !1, t.target.value = "";
        }
    }
    function Ge(t) {
      return new Promise((e, n) => {
        const c = new FileReader();
        c.onload = () => e(c.result), c.onerror = () => n(c.error || new Error("图片读取失败")), c.readAsDataURL(t);
      });
    }
    async function Yt(t) {
      if (!l.uploadImage)
        throw new Error("imageMode 为 url 时必须传入 uploadImage(file) 函数");
      const e = await l.uploadImage(t), n = typeof e == "string" ? e : e?.url;
      if (!n)
        throw new Error("uploadImage 必须返回图片 URL 字符串，或返回包含 url 字段的对象");
      return n;
    }
    function Ae(t, e = "图片") {
      ee(`<img src="${pe(t)}" alt="${pe(e)}">`);
    }
    async function Jt(t) {
      if (!l.uploadVideo)
        throw new Error("videoMode 为 url 时必须传入 uploadVideo(file) 函数");
      const e = await l.uploadVideo(t), n = typeof e == "string" ? e : e?.url;
      if (!n)
        throw new Error("uploadVideo 必须返回视频 URL 字符串，或返回包含 url 字段的对象");
      return n;
    }
    function Be(t) {
      ee(`<video src="${pe(t)}" controls></video>`);
    }
    function ee(t) {
      v.value && (te(), ot(), document.execCommand("insertHTML", !1, Y(t)), C());
    }
    function Qt() {
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
    function Zt() {
      Me.value && (a(), C(), Me.value && (V.value = h.value?.cloneRange() || null, R.value = !1, z.value = !1, x.value = !1, M.value = !1, D.value = !1, U.value = !U.value));
    }
    function en(t) {
      !v.value || !pn(t) || !ie(V.value) || (Z.value = t, h.value = V.value.cloneRange(), U.value = !1, Te({ fontFamily: t }));
    }
    function Ye(t) {
      if (!t || !i.value) {
        Z.value = "system-ui, sans-serif";
        return;
      }
      if (!t.collapsed) {
        const c = tn(t);
        Z.value = c.size === 1 ? [...c][0] : "system-ui, sans-serif";
        return;
      }
      const e = t.startContainer?.nodeType === Node.TEXT_NODE ? t.startContainer.parentElement : t.startContainer, n = Je(e);
      Z.value = n || "system-ui, sans-serif";
    }
    function Je(t) {
      let e = t;
      for (; e && e !== i.value; ) {
        if (e.nodeType === Node.ELEMENT_NODE) {
          const n = fn(e.style?.fontFamily || "");
          if (n)
            return n;
        }
        e = e.parentElement;
      }
      return "";
    }
    function tn(t) {
      const e = /* @__PURE__ */ new Set(), n = t.commonAncestorContainer.nodeType === Node.TEXT_NODE ? t.commonAncestorContainer.parentElement : t.commonAncestorContainer, c = document.createTreeWalker(
        n,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode(at) {
            return !at.textContent.trim() || !t.intersectsNode(at) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
          }
        }
      );
      let X = n.nodeType === Node.TEXT_NODE ? n : c.nextNode();
      for (; X; )
        e.add(Je(X.parentElement) || "system-ui, sans-serif"), X = c.nextNode();
      return e;
    }
    function nn() {
      Fe.value && (a(), C(), Fe.value && (ae.value = h.value?.cloneRange() || null, R.value = !1, U.value = !1, x.value = !1, M.value = !1, D.value = !1, z.value = !z.value));
    }
    function on(t) {
      !v.value || !vn(t) || !ie(ae.value) || (ye.value = t, h.value = ae.value.cloneRange(), z.value = !1, Te({ fontSize: t }));
    }
    function ln() {
      Ee.value && (a(), C(), Ee.value && (E.value = h.value?.cloneRange() || null, W(), S.value?.click()));
    }
    function an(t) {
      rn(t.target.value);
    }
    function rn(t) {
      !v.value || !ze(t) || !ie(E.value) || (Se.value = lt(t), h.value = E.value.cloneRange(), Te({ color: t }));
    }
    function un() {
      Re.value && (a(), C(), Re.value && (I.value = h.value?.cloneRange() || null, W(), _.value?.click()));
    }
    function sn(t) {
      dn(t.target.value);
    }
    function dn(t) {
      !v.value || !ze(t) || !ie(I.value) || (xe.value = lt(t), h.value = I.value.cloneRange(), Te({ backgroundColor: t }));
    }
    function Te(t) {
      te(), ot();
      const e = window.getSelection(), n = cn(t);
      if (!e || e.rangeCount === 0 || e.isCollapsed) {
        document.execCommand("insertHTML", !1, `<span style="${n}">文字</span>`), B(), C();
        return;
      }
      const c = e.getRangeAt(0), L = document.createElement("span");
      Object.assign(L.style, t), L.textContent = c.toString(), c.deleteContents(), c.insertNode(L), e.removeAllRanges();
      const X = document.createRange();
      X.selectNodeContents(L), e.addRange(X), B(), C();
    }
    function cn(t) {
      return [
        t.fontFamily ? `font-family: ${t.fontFamily}` : "",
        t.fontSize ? `font-size: ${t.fontSize}` : "",
        t.color ? `color: ${t.color}` : "",
        t.backgroundColor ? `background-color: ${t.backgroundColor}` : ""
      ].filter(Boolean).join("; ");
    }
    function ie(t) {
      return !!(t && !t.collapsed && t.toString().trim().length > 0);
    }
    function vn(t) {
      return qe.some((e) => e.value === t);
    }
    function pn(t) {
      return ke.some((e) => e.value === t);
    }
    function fn(t) {
      const e = String(t || "").replaceAll('"', "'").replace(/\s*,\s*/g, ", ").trim();
      return ke.find((n) => n.value.replaceAll('"', "'") === e)?.value || "";
    }
    function gn() {
      if (!v.value)
        return;
      a();
      const t = window.getSelection(), e = t && !t.isCollapsed ? t.toString() : "", n = mn(t);
      C(), R.value = !1, x.value = !1, M.value = !1, ue.value = "https://", se.value = n ? n.alt || "图片" : e, he.value = n ? n.outerHTML : "", D.value = !0;
    }
    function He() {
      if (!v.value)
        return;
      a();
      const t = ue.value.trim();
      if (!t)
        return;
      const e = se.value.trim() || t, n = he.value;
      D.value = !1, ue.value = "", se.value = "", he.value = "", ee(
        n ? `<a href="${pe(t)}">${n}</a>` : `<a href="${pe(t)}">${Rn(e)}</a>`
      ), B();
    }
    function mn(t) {
      if (!t || t.rangeCount === 0 || t.isCollapsed || !i.value)
        return null;
      const e = t.getRangeAt(0), n = e.startContainer.childNodes?.[e.startOffset];
      if (n?.nodeType === Node.ELEMENT_NODE && n.tagName?.toLowerCase() === "img")
        return n;
      const L = (e.commonAncestorContainer.nodeType === Node.ELEMENT_NODE ? e.commonAncestorContainer : e.commonAncestorContainer.parentElement)?.querySelector?.("img");
      return L && i.value.contains(L) ? L : null;
    }
    function bn() {
      v.value && (a(), ee("<hr><p><br></p>"), B());
    }
    function hn() {
      v.value && (a(), ee(
        "<table><thead><tr><th>标题</th><th>标题</th></tr></thead><tbody><tr><td>内容</td><td>内容</td></tr><tr><td>内容</td><td>内容</td></tr></tbody></table><p><br></p>"
      ), B(), Ze());
    }
    function yn() {
      v.value && Qe(to, (t) => t.querySelector("tbody tr:last-child td"));
    }
    function kn() {
      v.value && Qe(no, (t) => {
        const e = [...t.querySelectorAll("tr")];
        return e.find((n) => n.querySelector("td"))?.querySelector("td:last-child") || e[0]?.querySelector("th:last-child, td:last-child");
      });
    }
    function Qe(t, e) {
      if (!v.value)
        return;
      a();
      const n = Tn();
      if (!n)
        return;
      const c = document.createElement("div");
      c.innerHTML = Y(t(n.outerHTML));
      const L = c.querySelector("table");
      L && (n.replaceWith(L), j.value = L, Sn(e(L) || L), B());
    }
    function Tn() {
      return (!i.value || !j.value || !i.value.contains(j.value)) && Ze(), j.value && i.value?.contains(j.value) ? j.value : null;
    }
    function Ze() {
      const t = window.getSelection();
      if (!t || t.rangeCount === 0) {
        j.value = null;
        return;
      }
      et(t.getRangeAt(0).commonAncestorContainer);
    }
    function et(t) {
      if (!i.value) {
        j.value = null;
        return;
      }
      let e = t?.nodeType === Node.ELEMENT_NODE ? t : t?.parentElement;
      for (; e && e !== i.value; ) {
        if (e.tagName?.toLowerCase() === "table") {
          j.value = e;
          return;
        }
        e = e.parentElement;
      }
      j.value = null;
    }
    function $n() {
      const t = window.getSelection();
      if (!t || t.rangeCount === 0 || !i.value)
        return null;
      let e = t.anchorNode;
      for (e?.nodeType === Node.TEXT_NODE && (e = e.parentElement); e && e !== i.value; ) {
        if (e.nodeType === Node.ELEMENT_NODE && it(e.tagName))
          return e;
        e = e.parentElement;
      }
      return null;
    }
    function wn(t) {
      const e = document.createElement("p");
      e.appendChild(document.createElement("br")), t.insertAdjacentElement("afterend", e), nt(e);
    }
    function tt() {
      if (!v.value || !i.value)
        return;
      let t = i.value.lastElementChild;
      (!t || t.tagName.toLowerCase() !== "p" || t.textContent.trim()) && (t = document.createElement("p"), t.appendChild(document.createElement("br")), i.value.appendChild(t)), nt(t), B();
    }
    function Cn() {
      return i.value ? [...i.value.children].slice().reverse().find((e) => e.textContent.trim() || e.querySelector("img, video")) : null;
    }
    function nt(t) {
      const e = document.createRange();
      e.setStart(t, 0), e.collapse(!0);
      const n = window.getSelection();
      n.removeAllRanges(), n.addRange(e), h.value = e.cloneRange();
    }
    function Sn(t) {
      const e = document.createRange();
      e.selectNodeContents(t), e.collapse(!1);
      const n = window.getSelection();
      n.removeAllRanges(), n.addRange(e), h.value = e.cloneRange();
    }
    function xn(t) {
      const e = document.createRange();
      e.selectNode(t);
      const n = window.getSelection();
      n.removeAllRanges(), n.addRange(e), h.value = e.cloneRange();
    }
    function te() {
      i.value?.focus();
    }
    function Mn(t) {
      i.value && (i.value.innerHTML = Y(t)), Le(t);
    }
    function Fn() {
      return re.value;
    }
    function En() {
      return jn(re.value);
    }
    r({
      clear: je,
      focus: te,
      getHtml: Fn,
      getMarkdown: En,
      insertHtml: ee,
      insertImage: Ae,
      insertVideo: Be,
      setHtml: Mn
    });
    function ot() {
      if (!h.value)
        return;
      const t = window.getSelection();
      t.removeAllRanges(), t.addRange(h.value);
    }
    function pe(t) {
      return String(t).replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
    }
    function Rn(t) {
      return String(t).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
    }
    function ze(t) {
      return /^#[0-9a-f]{3}(?:[0-9a-f]{3})?$/i.test(String(t || "").trim());
    }
    function lt(t) {
      const e = String(t || "").trim();
      if (!e)
        return "";
      if (ze(e))
        return e.toLowerCase();
      const n = e.match(/^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*(?:0|1|0?\.\d+))?\s*\)$/i);
      if (!n)
        return e.toLowerCase();
      const c = n.slice(1, 4).map(Number);
      if (c.some((X) => X < 0 || X > 255))
        return e.toLowerCase();
      const L = (X) => X.toString(16).padStart(2, "0");
      return `#${c.map(L).join("")}`;
    }
    return (t, e) => (m(), b("section", {
      ref_key: "rootRef",
      ref: g,
      class: "rv-editor panel editor-panel",
      "aria-label": "富文本编辑区"
    }, [
      s("div", lo, [
        s("h2", null, G(o.label), 1),
        o.clearable && v.value ? (m(), b("button", {
          key: 0,
          type: "button",
          class: "rv-editor__danger-button danger-button",
          onClick: je
        }, " 清空 ")) : w("", !0)
      ]),
      s("div", ao, [
        s("div", ro, [
          s("div", {
            class: T(["rv-editor__dropdown toolbar-dropdown", { "is-open": R.value }])
          }, [
            wt.value ? (m(), b("button", {
              key: 0,
              type: "button",
              class: T(["rv-editor__select toolbar-select", { "tooltip-visible": F.value === "段落样式" }]),
              "aria-label": "段落样式",
              "aria-expanded": R.value,
              "data-tooltip": "段落样式",
              onMouseenter: e[0] || (e[0] = (n) => p("段落样式")),
              onMouseleave: a,
              onFocus: e[1] || (e[1] = (n) => p("段落样式")),
              onBlur: a,
              onTouchstartPassive: e[2] || (e[2] = (n) => A("段落样式")),
              onTouchend: a,
              onTouchcancel: a,
              onClick: _t
            }, [
              s("span", null, G(zt.value), 1),
              e[65] || (e[65] = s("span", { class: "rv-editor__select-caret select-caret" }, "▾", -1))
            ], 42, io)) : w("", !0),
            R.value ? (m(), b("div", uo, [
              (m(!0), b(fe, null, ge(Oe.value, (n) => (m(), b("button", {
                key: n.value,
                type: "button",
                class: T({ active: O.value === n.value }),
                onClick: (c) => It(n.value)
              }, G(n.label), 11, so))), 128))
            ])) : w("", !0)
          ], 2),
          Lt.value ? (m(), b("div", {
            key: 0,
            class: T(["rv-editor__dropdown toolbar-dropdown", { "is-open": U.value }])
          }, [
            s("button", {
              type: "button",
              class: T(["rv-editor__select toolbar-select font-family-select", { "tooltip-visible": F.value === "字体" }]),
              "aria-label": "字体",
              "aria-expanded": U.value,
              "data-tooltip": "字体",
              onMouseenter: e[3] || (e[3] = (n) => p("字体")),
              onMouseleave: a,
              onFocus: e[4] || (e[4] = (n) => p("字体")),
              onBlur: a,
              onTouchstartPassive: e[5] || (e[5] = (n) => A("字体")),
              onTouchend: a,
              onTouchcancel: a,
              onMousedown: e[6] || (e[6] = P(() => {
              }, ["prevent"])),
              onClick: Zt,
              disabled: !Me.value
            }, [
              s("span", null, G(Nt.value), 1),
              e[66] || (e[66] = s("span", { class: "rv-editor__select-caret select-caret" }, "▾", -1))
            ], 42, co),
            U.value ? (m(), b("div", vo, [
              (m(), b(fe, null, ge(ke, (n) => s("button", {
                key: n.value,
                type: "button",
                class: T({ active: Z.value === n.value }),
                style: rt({ fontFamily: n.value }),
                onMousedown: e[7] || (e[7] = P(() => {
                }, ["prevent"])),
                onClick: (c) => en(n.value)
              }, G(n.label), 47, po)), 64))
            ])) : w("", !0)
          ], 2)) : w("", !0),
          (m(!0), b(fe, null, ge(Tt.value, (n) => (m(), b("button", {
            key: `${n.command}-${n.value}`,
            type: "button",
            class: T(["rv-editor__icon-button icon-button", { "tooltip-visible": F.value === n.label }]),
            title: n.label,
            "aria-label": n.label,
            "data-tooltip": n.label,
            onMouseenter: (c) => p(n.label),
            onMouseleave: a,
            onFocus: (c) => p(n.label),
            onBlur: a,
            onTouchstartPassive: (c) => A(n.label),
            onTouchend: a,
            onTouchcancel: a,
            onClick: (c) => ve(n),
            onPointerdown: W
          }, G(n.icon), 43, fo))), 128)),
          (m(!0), b(fe, null, ge($t.value, (n) => (m(), b("button", {
            key: n.title,
            type: "button",
            title: n.title,
            "data-tooltip": n.title,
            class: T({ "tooltip-visible": F.value === n.title }),
            onMouseenter: (c) => p(n.title),
            onMouseleave: a,
            onFocus: (c) => p(n.title),
            onBlur: a,
            onTouchstartPassive: (c) => A(n.title),
            onTouchend: a,
            onTouchcancel: a,
            onClick: (c) => ve(n),
            onPointerdown: W
          }, G(n.label), 43, go))), 128)),
          At.value ? (m(), b("div", {
            key: 1,
            class: T(["rv-editor__dropdown toolbar-dropdown", { "is-open": z.value }])
          }, [
            s("button", {
              type: "button",
              class: T(["rv-editor__select toolbar-select", { "tooltip-visible": F.value === "文字大小" }]),
              "aria-label": "文字大小",
              "aria-expanded": z.value,
              "data-tooltip": "文字大小",
              onMouseenter: e[8] || (e[8] = (n) => p("文字大小")),
              onMouseleave: a,
              onFocus: e[9] || (e[9] = (n) => p("文字大小")),
              onBlur: a,
              onTouchstartPassive: e[10] || (e[10] = (n) => A("文字大小")),
              onTouchend: a,
              onTouchcancel: a,
              onMousedown: e[11] || (e[11] = P(() => {
              }, ["prevent"])),
              onClick: nn,
              disabled: !Fe.value
            }, [
              s("span", null, G(ye.value.replace("px", "")), 1),
              e[67] || (e[67] = s("span", { class: "rv-editor__select-caret select-caret" }, "▾", -1))
            ], 42, mo),
            z.value ? (m(), b("div", bo, [
              (m(), b(fe, null, ge(qe, (n) => s("button", {
                key: n.value,
                type: "button",
                class: T({ active: ye.value === n.value }),
                onMousedown: e[12] || (e[12] = P(() => {
                }, ["prevent"])),
                onClick: (c) => on(n.value)
              }, G(n.label), 43, ho)), 64))
            ])) : w("", !0)
          ], 2)) : w("", !0),
          Bt.value ? (m(), b("div", yo, [
            s("button", {
              type: "button",
              "aria-label": "字体颜色",
              "data-tooltip": "字体颜色",
              class: T({ "tooltip-visible": F.value === "字体颜色" }),
              onMouseenter: e[13] || (e[13] = (n) => p("字体颜色")),
              onMouseleave: a,
              onFocus: e[14] || (e[14] = (n) => p("字体颜色")),
              onBlur: a,
              onTouchstartPassive: e[15] || (e[15] = (n) => A("字体颜色")),
              onTouchend: a,
              onTouchcancel: a,
              onMousedown: e[16] || (e[16] = P(() => {
              }, ["prevent"])),
              onClick: ln,
              disabled: !Ee.value
            }, [...e[68] || (e[68] = [
              s("span", { class: "color-button-icon" }, "A", -1)
            ])], 42, ko),
            s("input", {
              ref_key: "textColorInputRef",
              ref: S,
              class: "rv-editor__visually-hidden visually-hidden",
              type: "color",
              value: Se.value,
              "aria-label": "选择字体颜色",
              onInput: an
            }, null, 40, To)
          ])) : w("", !0),
          Ht.value ? (m(), b("div", $o, [
            s("button", {
              type: "button",
              "aria-label": "文字背景色",
              "data-tooltip": "文字背景色",
              class: T({ "tooltip-visible": F.value === "文字背景色" }),
              onMouseenter: e[17] || (e[17] = (n) => p("文字背景色")),
              onMouseleave: a,
              onFocus: e[18] || (e[18] = (n) => p("文字背景色")),
              onBlur: a,
              onTouchstartPassive: e[19] || (e[19] = (n) => A("文字背景色")),
              onTouchend: a,
              onTouchcancel: a,
              onMousedown: e[20] || (e[20] = P(() => {
              }, ["prevent"])),
              onClick: un,
              disabled: !Re.value
            }, [...e[69] || (e[69] = [
              s("span", { class: "color-button-icon background-color-button-icon" }, "A", -1)
            ])], 42, wo),
            s("input", {
              ref_key: "backgroundColorInputRef",
              ref: _,
              class: "rv-editor__visually-hidden visually-hidden",
              type: "color",
              value: xe.value,
              "aria-label": "选择文字背景色",
              onInput: sn
            }, null, 40, Co)
          ])) : w("", !0),
          Ct.value ? (m(), b("button", {
            key: 4,
            type: "button",
            class: T(["rv-editor__icon-button icon-button", { "tooltip-visible": F.value === "无序列表" }]),
            title: "无序列表",
            "aria-label": "无序列表",
            "data-tooltip": "无序列表",
            onMouseenter: e[21] || (e[21] = (n) => p("无序列表")),
            onMouseleave: a,
            onFocus: e[22] || (e[22] = (n) => p("无序列表")),
            onBlur: a,
            onTouchstartPassive: e[23] || (e[23] = (n) => A("无序列表")),
            onTouchend: a,
            onTouchcancel: a,
            onClick: e[24] || (e[24] = (n) => ve({ command: "insertUnorderedList" })),
            onPointerdown: W
          }, " ☰ ", 34)) : w("", !0),
          St.value ? (m(), b("button", {
            key: 5,
            type: "button",
            class: T(["rv-editor__icon-button icon-button", { "tooltip-visible": F.value === "有序列表" }]),
            title: "有序列表",
            "aria-label": "有序列表",
            "data-tooltip": "有序列表",
            onMouseenter: e[25] || (e[25] = (n) => p("有序列表")),
            onMouseleave: a,
            onFocus: e[26] || (e[26] = (n) => p("有序列表")),
            onBlur: a,
            onTouchstartPassive: e[27] || (e[27] = (n) => A("有序列表")),
            onTouchend: a,
            onTouchcancel: a,
            onClick: e[28] || (e[28] = (n) => ve({ command: "insertOrderedList" })),
            onPointerdown: W
          }, " 1. ", 34)) : w("", !0),
          Mt.value ? (m(), b("button", {
            key: 6,
            type: "button",
            class: T(["rv-editor__icon-button icon-button", { "tooltip-visible": F.value === "链接" }]),
            title: "链接",
            "aria-label": "链接",
            "data-tooltip": "链接",
            onMouseenter: e[29] || (e[29] = (n) => p("链接")),
            onMouseleave: a,
            onFocus: e[30] || (e[30] = (n) => p("链接")),
            onBlur: a,
            onTouchstartPassive: e[31] || (e[31] = (n) => A("链接")),
            onTouchend: a,
            onTouchcancel: a,
            onClick: gn,
            onPointerdown: W
          }, " 🔗 ", 34)) : w("", !0),
          Ue.value ? (m(), b("button", {
            key: 7,
            type: "button",
            class: T(["rv-editor__icon-button icon-button", { "tooltip-visible": F.value === "表格" }]),
            title: "表格",
            "aria-label": "表格",
            "data-tooltip": "表格",
            onMouseenter: e[32] || (e[32] = (n) => p("表格")),
            onMouseleave: a,
            onFocus: e[33] || (e[33] = (n) => p("表格")),
            onBlur: a,
            onTouchstartPassive: e[34] || (e[34] = (n) => A("表格")),
            onTouchend: a,
            onTouchcancel: a,
            onClick: hn,
            onPointerdown: W
          }, " ▦ ", 34)) : w("", !0),
          xt.value ? (m(), b("div", So, [
            s("button", {
              type: "button",
              "data-tooltip": "增加行",
              class: T({ "tooltip-visible": F.value === "增加行" }),
              onMouseenter: e[35] || (e[35] = (n) => p("增加行")),
              onMouseleave: a,
              onFocus: e[36] || (e[36] = (n) => p("增加行")),
              onBlur: a,
              onTouchstartPassive: e[37] || (e[37] = (n) => A("增加行")),
              onTouchend: a,
              onTouchcancel: a,
              onClick: yn,
              onPointerdown: e[38] || (e[38] = P(() => {
              }, ["prevent"]))
            }, " +行 ", 34),
            s("button", {
              type: "button",
              "data-tooltip": "增加列",
              class: T({ "tooltip-visible": F.value === "增加列" }),
              onMouseenter: e[39] || (e[39] = (n) => p("增加列")),
              onMouseleave: a,
              onFocus: e[40] || (e[40] = (n) => p("增加列")),
              onBlur: a,
              onTouchstartPassive: e[41] || (e[41] = (n) => A("增加列")),
              onTouchend: a,
              onTouchcancel: a,
              onClick: kn,
              onPointerdown: e[42] || (e[42] = P(() => {
              }, ["prevent"]))
            }, " +列 ", 34)
          ])) : w("", !0),
          Ft.value ? (m(), b("button", {
            key: 9,
            type: "button",
            class: T(["rv-editor__icon-button icon-button", { "tooltip-visible": F.value === "分割线" }]),
            title: "分割线",
            "aria-label": "分割线",
            "data-tooltip": "分割线",
            onMouseenter: e[43] || (e[43] = (n) => p("分割线")),
            onMouseleave: a,
            onFocus: e[44] || (e[44] = (n) => p("分割线")),
            onBlur: a,
            onTouchstartPassive: e[45] || (e[45] = (n) => A("分割线")),
            onTouchend: a,
            onTouchcancel: a,
            onClick: bn,
            onPointerdown: W
          }, " — ", 34)) : w("", !0),
          Et.value ? (m(), b("button", {
            key: 10,
            type: "button",
            class: T(["rv-editor__icon-button icon-button", { "tooltip-visible": F.value === "图片" }]),
            title: "图片",
            "aria-label": de.value ? "图片处理中" : "图片",
            "aria-expanded": x.value,
            disabled: de.value,
            "data-tooltip": "图片",
            onMouseenter: e[46] || (e[46] = (n) => p("图片")),
            onMouseleave: a,
            onFocus: e[47] || (e[47] = (n) => p("图片")),
            onBlur: a,
            onTouchstartPassive: e[48] || (e[48] = (n) => A("图片")),
            onTouchend: a,
            onTouchcancel: a,
            onClick: jt
          }, G(de.value ? "…" : "▧"), 43, xo)) : w("", !0),
          Rt.value ? (m(), b("button", {
            key: 11,
            type: "button",
            class: T(["rv-editor__icon-button icon-button", { "tooltip-visible": F.value === "视频" }]),
            title: "视频",
            "aria-label": ce.value ? "视频处理中" : "视频",
            "aria-expanded": M.value,
            disabled: ce.value,
            "data-tooltip": "视频",
            onMouseenter: e[49] || (e[49] = (n) => p("视频")),
            onMouseleave: a,
            onFocus: e[50] || (e[50] = (n) => p("视频")),
            onBlur: a,
            onTouchstartPassive: e[51] || (e[51] = (n) => A("视频")),
            onTouchend: a,
            onTouchcancel: a,
            onClick: Xt
          }, G(ce.value ? "…" : "▶"), 43, Mo)) : w("", !0)
        ]),
        s("input", {
          ref_key: "fileInputRef",
          ref: $,
          class: "rv-editor__visually-hidden visually-hidden",
          type: "file",
          accept: "image/*",
          onChange: Kt
        }, null, 544),
        s("input", {
          ref_key: "videoInputRef",
          ref: H,
          class: "rv-editor__visually-hidden visually-hidden",
          type: "file",
          accept: "video/*",
          onChange: Gt
        }, null, 544)
      ]),
      x.value ? (m(), b("div", {
        key: 0,
        class: "rv-editor__dialog-backdrop image-dialog-backdrop",
        role: "presentation",
        onPointerdown: e[54] || (e[54] = P((n) => x.value = !1, ["self"]))
      }, [
        s("section", Fo, [
          s("div", Eo, [
            e[70] || (e[70] = s("h3", null, "添加图片", -1)),
            s("button", {
              type: "button",
              "aria-label": "关闭添加图片弹窗",
              onClick: e[52] || (e[52] = (n) => x.value = !1)
            }, " × ")
          ]),
          s("label", Ro, [
            e[71] || (e[71] = s("span", null, "图片链接", -1)),
            $e(s("input", {
              "onUpdate:modelValue": e[53] || (e[53] = (n) => Q.value = n),
              type: "url",
              placeholder: "https://...",
              onKeydown: we(P(We, ["prevent"]), ["enter"])
            }, null, 40, Lo), [
              [Ce, Q.value]
            ])
          ]),
          s("div", Ao, [
            s("button", {
              type: "button",
              class: "rv-editor__secondary-button secondary-button",
              onClick: We
            }, " 插入链接 "),
            s("button", {
              type: "button",
              class: "rv-editor__primary-button primary-button",
              title: o.imageMode === "url" && !o.uploadImage ? "需要传入 uploadImage 函数" : "选择图片",
              disabled: o.imageMode === "url" && !o.uploadImage,
              onClick: Dt
            }, " 选择图片 ", 8, Bo)
          ])
        ])
      ], 32)) : w("", !0),
      M.value ? (m(), b("div", {
        key: 1,
        class: "rv-editor__dialog-backdrop image-dialog-backdrop",
        role: "presentation",
        onPointerdown: e[57] || (e[57] = P((n) => M.value = !1, ["self"]))
      }, [
        s("section", Ho, [
          s("div", zo, [
            e[72] || (e[72] = s("h3", null, "添加视频", -1)),
            s("button", {
              type: "button",
              "aria-label": "关闭添加视频弹窗",
              onClick: e[55] || (e[55] = (n) => M.value = !1)
            }, " × ")
          ]),
          s("label", No, [
            e[73] || (e[73] = s("span", null, "视频链接", -1)),
            $e(s("input", {
              "onUpdate:modelValue": e[56] || (e[56] = (n) => be.value = n),
              type: "url",
              placeholder: "https://...",
              onKeydown: we(P(Xe, ["prevent"]), ["enter"])
            }, null, 40, Po), [
              [Ce, be.value]
            ])
          ]),
          s("div", Io, [
            s("button", {
              type: "button",
              class: "rv-editor__secondary-button secondary-button",
              onClick: Xe
            }, " 插入链接 "),
            s("button", {
              type: "button",
              class: "rv-editor__primary-button primary-button",
              title: o.videoMode === "url" && !o.uploadVideo ? "需要传入 uploadVideo 函数" : "选择视频",
              disabled: o.videoMode === "url" && !o.uploadVideo,
              onClick: Wt
            }, " 选择视频 ", 8, _o)
          ])
        ])
      ], 32)) : w("", !0),
      D.value ? (m(), b("div", {
        key: 2,
        class: "rv-editor__dialog-backdrop image-dialog-backdrop",
        role: "presentation",
        onPointerdown: e[62] || (e[62] = P((n) => D.value = !1, ["self"]))
      }, [
        s("section", Vo, [
          s("div", qo, [
            e[74] || (e[74] = s("h3", null, "添加链接", -1)),
            s("button", {
              type: "button",
              "aria-label": "关闭添加链接弹窗",
              onClick: e[58] || (e[58] = (n) => D.value = !1)
            }, " × ")
          ]),
          s("label", Oo, [
            e[75] || (e[75] = s("span", null, "链接地址", -1)),
            $e(s("input", {
              "onUpdate:modelValue": e[59] || (e[59] = (n) => ue.value = n),
              type: "url",
              placeholder: "https://...",
              onKeydown: we(P(He, ["prevent"]), ["enter"])
            }, null, 40, Uo), [
              [Ce, ue.value]
            ])
          ]),
          s("label", Do, [
            e[76] || (e[76] = s("span", null, "链接文本", -1)),
            $e(s("input", {
              "onUpdate:modelValue": e[60] || (e[60] = (n) => se.value = n),
              type: "text",
              placeholder: "显示文本",
              disabled: !!he.value,
              onKeydown: we(P(He, ["prevent"]), ["enter"])
            }, null, 40, jo), [
              [Ce, se.value]
            ])
          ]),
          s("div", Ko, [
            s("button", {
              type: "button",
              class: "rv-editor__secondary-button secondary-button",
              onClick: e[61] || (e[61] = (n) => D.value = !1)
            }, " 取消 "),
            s("button", {
              type: "button",
              class: "rv-editor__primary-button primary-button",
              onClick: He
            }, " 插入链接 ")
          ])
        ])
      ], 32)) : w("", !0),
      s("article", {
        ref_key: "editorRef",
        ref: i,
        class: "rv-editor__content rich-editor",
        contenteditable: v.value ? "true" : "false",
        "data-placeholder": o.placeholder,
        "aria-readonly": o.readonly,
        "aria-disabled": o.disabled,
        style: rt(Pt.value),
        innerHTML: Hn(bt),
        onInput: B,
        onClick: Ut,
        onPointerdown: W,
        onKeydown: Ot,
        onKeyup: C,
        onMouseup: C,
        onFocus: e[63] || (e[63] = (n) => d("focus", n)),
        onBlur: e[64] || (e[64] = (n) => d("blur", n)),
        onPaste: qt
      }, null, 44, Wo)
    ], 512));
  }
}, Qo = {
  install(o) {
    o.component("RichTextEditor", Xo);
  }
};
export {
  Xo as RichTextEditor,
  Qo as default,
  jn as editorHtmlToMarkdown,
  Yo as markdownToEditorHtml,
  Y as sanitizeEditorHtml,
  pt as taggedTextToEditorHtml,
  Jo as wrapHtmlDocument
};
