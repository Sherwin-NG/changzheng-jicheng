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
    <a class="brand" href="./index.html">长征纪程</a>
    <nav class="desktop-nav" aria-label="章节">${nav}</nav>
    <div class="mast-actions">
      <button type="button" class="search-open">检索</button>
      <button type="button" class="nav-open" aria-expanded="false" aria-controls="mobile-nav">目录</button>
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
      <p>本站由个人独立整理，供阅读和对照口径。它不代表任何博物馆、档案馆、党史机构或政府部门。</p>
      <p>照片都是 2006 年以来的遗址、纪念建筑或风景，图注写明拍摄年份。地图上的虚线只连接相距较近的已知点，示意图，非精确行军轨迹。</p>
    </div>
    <div>
      <p><kbd>/</kbd> 打开检索，<kbd>Esc</kbd> 关闭，<kbd>↑</kbd><kbd>↓</kbd> 在结果或年表中移动。</p>
      <nav class="pager" aria-label="前后章节">
        ${prev ? `<a href="${prev.href}">上一章 ${esc(prev.label)}</a>` : "<span></span>"}
        ${next ? `<a href="${next.href}">下一章 ${esc(next.label)}</a>` : "<span></span>"}
      </nav>
    </div>
  </div>
  <p class="wrap">${esc(current.label)}</p>
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
