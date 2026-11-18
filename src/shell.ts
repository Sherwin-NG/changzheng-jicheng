import { PAGES, type PageId } from "./content";
import { esc } from "./format";

export function shell(page: PageId, main: string): string {
  const current = PAGES.find((p) => p.id === page)!;
  const nav = PAGES.map(
    (p) =>
      `<a href="${p.href}"${p.id === page ? ' aria-current="page"' : ""}>${esc(p.label)}</a>`,
  ).join("");
  const order = PAGES.findIndex((p) => p.id === page);
  const prev = order > 0 ? PAGES[order - 1] : null;
  const next = order < PAGES.length - 1 ? PAGES[order + 1] : null;
  return `<a class="skip" href="#content">跳到正文</a>
<header class="site-header">
  <div class="wrap mast">
    <p class="mast-note">独立整理 · 非官方 · 示意图不是行军轨迹</p>
    <div class="mast-row">
      <a class="brand" href="./index.html">
        <span class="brand-mark" aria-hidden="true">征</span>
        <span>
          <span class="brand-title">长征纪程</span>
          <span class="brand-sub">一九三四 — 一九三六</span>
        </span>
      </a>
      <nav class="desktop-nav" aria-label="章节">${nav}</nav>
      <div class="mast-actions">
        <button type="button" class="search-open">检索</button>
        <button type="button" class="nav-open" aria-expanded="false" aria-controls="mobile-nav">目录</button>
      </div>
    </div>
  </div>
</header>
<div id="mobile-nav" class="mobile-nav" hidden>
  <nav class="wrap" aria-label="章节">${nav}</nav>
</div>
<main id="content" tabindex="-1">
  ${main}
</main>
<footer class="site-footer">
  <div class="wrap footer-grid">
    <div>
      <p class="brand-title">长征纪程</p>
      <p>本站由个人独立整理，供阅读和对照口径。它不代表任何博物馆、档案馆、党史机构或政府部门。</p>
      <p>史实依据核链稿。稿内写明的核链日是查阅日期，不是历史文献的出版日，也不是把建站当天写成发表日期。</p>
    </div>
    <div>
      <p>键位</p>
      <p><kbd>/</kbd> 打开检索 · <kbd>Esc</kbd> 关闭 · <kbd>↑</kbd><kbd>↓</kbd> 在结果或年表中移动</p>
      <nav class="pager" aria-label="前后章节">
        ${prev ? `<a href="${prev.href}">上一章 · ${esc(prev.label)}</a>` : "<span></span>"}
        ${next ? `<a href="${next.href}">下一章 · ${esc(next.label)}</a>` : "<span></span>"}
      </nav>
    </div>
  </div>
  <p class="wrap footer-end">${esc(current.index)} ${esc(current.label)}</p>
</footer>
<dialog id="search-dialog" aria-labelledby="search-title">
  <div class="search-panel">
    <div class="search-head">
      <h2 id="search-title">检索本站</h2>
      <button type="button" class="search-close" aria-label="关闭检索">关闭</button>
    </div>
    <form role="search" id="search-form">
      <label for="q">关键词</label>
      <input id="q" name="q" type="search" autocomplete="off" placeholder="例如：于都、吴起、二万五千里、红二十五军" />
    </form>
    <p id="search-status" class="search-status" aria-live="polite"></p>
    <ol id="search-results" class="search-results"></ol>
  </div>
</dialog>`;
}
