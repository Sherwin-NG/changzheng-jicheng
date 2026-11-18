import { linkRecheck, sourceById, type Source } from "./content";

export function esc(value: string | number | undefined | null): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function inline(value: string): string {
  const safe = esc(value);
  return safe
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\[((?:S|X)\d+)\]/g, (_m, id: string) => sourceAnchor(id));
}

export function sourceAnchor(id: string): string {
  const src = sourceById.get(id);
  const title = src ? src.title : id;
  return `<a class="src" href="./sources.html#${esc(id)}" title="${esc(title)}">${esc(id)}</a>`;
}

export function sourceChips(ids: string[]): string {
  if (!ids.length) {
    return `<p class="sourceline">这条没有专文源号。</p>`;
  }
  return `<p class="sourceline"><span>来源</span>${ids.map(sourceAnchor).join("")}</p>`;
}

export function recheckText(src: Source): string {
  const row = linkRecheck.get(src.id);
  if (!row) return "";
  if (row.code === "200") return "构建环境再次请求，HTTP 状态仍是 200。";
  if (row.code === "404") return "构建环境再次请求得到 HTTP 404。";
  return "构建环境再次请求时没有得到 HTTP 状态：证书主机名与站点不一致。这仍不是 404，不能写成页面已经不存在。";
}

export function accessText(src: Source): string {
  if (src.http_check_2026_11_18 === "200") {
    return "核链时以 HTTPS 打开，状态为 200。";
  }
  if (src.http_check_2026_11_18.includes("handshake")) {
    return "核链时读到过全文。部分网络访问该站会握手失败。这不是 HTTP 404，不能写成页面已经不存在。";
  }
  return src.access_note;
}

export function sourceCard(src: Source, anchor = true): string {
  const authors = src.authors.length ? src.authors.join("、") : "未署名机构稿";
  const supplement = src.supplementary ? `<span class="badge">补充</span>` : "";
  const idAttr = anchor ? ` id="${esc(src.id)}"` : "";
  return `<article class="source-card"${idAttr}>
    <header>
      <p class="kicker">${esc(src.id)} ${supplement}</p>
      <h3>${esc(src.title)}</h3>
    </header>
    <p>${esc(authors)}${src.author_affiliation ? ` · ${esc(src.author_affiliation)}` : ""}</p>
    <p class="meta">${esc(src.publisher)} · 原载${esc(src.original_publication)} · ${esc(src.pub_date)}</p>
    <p>${esc(src.access_note)}</p>
    <p class="meta">${esc(accessText(src))} ${esc(recheckText(src))} 核链所记访问日 ${esc(src.accessed)}，不是这条史料的出版日。</p>
    <p><a href="${esc(src.url)}" target="_blank" rel="noopener noreferrer">打开：${esc(src.publisher)}《${esc(src.title)}》</a></p>
  </article>`;
}

export function paragraphs(text: string): string {
  return text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${inline(p.replace(/\n/g, ""))}</p>`)
    .join("");
}
