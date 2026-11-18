import { levelLabel, nodePlaces, placeById } from "./atlas";
import { nodes, searchDocs, sourceById, ARMY_LABEL } from "./content";
import { esc } from "./format";

const docs = searchDocs();

export function bind(page: string): void {
  bindNav();
  bindSearch();
  bindExpands();
  if (page === "timeline") bindTimeline();
  if (page === "routes") bindRoutes();
  const params = new URLSearchParams(location.search);
  const q = params.get("q");
  if (q) openSearch(q);
}

function bindNav(): void {
  const button = document.querySelector<HTMLButtonElement>(".nav-open");
  const panel = document.querySelector<HTMLElement>("#mobile-nav");
  if (!button || !panel) return;
  button.addEventListener("click", () => {
    const open = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", open ? "false" : "true");
    panel.hidden = open;
    if (!open) panel.querySelector("a")?.focus();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !panel.hidden) {
      panel.hidden = true;
      button.setAttribute("aria-expanded", "false");
      button.focus();
    }
  });
}

function bindSearch(): void {
  const dialog = document.querySelector<HTMLDialogElement>("#search-dialog");
  const input = document.querySelector<HTMLInputElement>("#q");
  const form = document.querySelector<HTMLFormElement>("#search-form");
  const openers = document.querySelectorAll<HTMLButtonElement>(".search-open");
  const closer = document.querySelector<HTMLButtonElement>(".search-close");
  if (!dialog || !input || !form) return;
  openers.forEach((opener) => opener.addEventListener("click", () => openSearch()));
  closer?.addEventListener("click", () => dialog.close());
  form.addEventListener("submit", (event) => event.preventDefault());
  input.addEventListener("input", () => renderSearch(input.value));
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
  document.addEventListener("keydown", (event) => {
    const target = event.target as HTMLElement | null;
    const typing = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA");
    if (event.key === "/" && !typing && !dialog.open) {
      event.preventDefault();
      openSearch();
    }
    if (!dialog.open) return;
    const links = [...dialog.querySelectorAll<HTMLAnchorElement>(".search-results a")];
    if (event.key === "ArrowDown" && links.length) {
      event.preventDefault();
      const current = links.indexOf(document.activeElement as HTMLAnchorElement);
      links[Math.min(links.length - 1, current + 1)]?.focus();
    }
    if (event.key === "ArrowUp" && links.length) {
      event.preventDefault();
      const current = links.indexOf(document.activeElement as HTMLAnchorElement);
      if (current <= 0) input.focus();
      else links[current - 1]?.focus();
    }
  });
}

function openSearch(preset = ""): void {
  const dialog = document.querySelector<HTMLDialogElement>("#search-dialog");
  const input = document.querySelector<HTMLInputElement>("#q");
  if (!dialog || !input) return;
  if (!dialog.open) dialog.showModal();
  if (preset) input.value = preset;
  renderSearch(input.value);
  input.focus();
}

function renderSearch(raw: string): void {
  const status = document.querySelector<HTMLElement>("#search-status");
  const list = document.querySelector<HTMLElement>("#search-results");
  if (!status || !list) return;
  const q = raw.trim();
  if (!q) {
    status.textContent = "输入关键词后，在年表、部队、会议、战役、人物、节点、口径和来源里查找。";
    list.innerHTML = "";
    return;
  }
  const folded = q.toLowerCase();
  const hits = docs.filter((doc) => `${doc.title} ${doc.text}`.toLowerCase().includes(folded));
  if (!hits.length) {
    status.textContent = `没有与「${q}」对应的条目。可换一个词，例如于都、吴起、会宁或红二十五军。`;
    list.innerHTML = "";
    return;
  }
  const shown = hits.slice(0, 40);
  status.textContent = `找到 ${hits.length} 条${hits.length > shown.length ? `，先显示 ${shown.length} 条` : ""}。`;
  list.innerHTML = shown
    .map((doc) => {
      const snippet = snippetAround(`${doc.title}。${doc.text}`, q);
      return `<li><a href="${esc(doc.href)}"><span class="badge">${esc(doc.kind)}</span> ${highlight(doc.title, q)}</a><p>${highlight(snippet, q)}</p></li>`;
    })
    .join("");
}

function snippetAround(text: string, q: string): string {
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i < 0) return text.slice(0, 90);
  const start = Math.max(0, i - 28);
  const end = Math.min(text.length, i + q.length + 52);
  return `${start > 0 ? "…" : ""}${text.slice(start, end)}${end < text.length ? "…" : ""}`;
}

function highlight(text: string, q: string): string {
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i < 0) return esc(text);
  return `${esc(text.slice(0, i))}<mark>${esc(text.slice(i, i + q.length))}</mark>${esc(text.slice(i + q.length))}`;
}

function bindExpands(): void {
  document.querySelectorAll<HTMLButtonElement>(".expand").forEach((button) => {
    button.addEventListener("click", () => toggleExpand(button));
  });
  document.addEventListener("keydown", (event) => {
    const current = document.activeElement;
    if (!(current instanceof HTMLElement) || !current.classList.contains("expand")) return;
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    const buttons = [...document.querySelectorAll<HTMLButtonElement>(".expand")].filter((b) => b.offsetParent !== null);
    const index = buttons.indexOf(current as HTMLButtonElement);
    if (index < 0) return;
    event.preventDefault();
    const next = buttons[index + (event.key === "ArrowDown" ? 1 : -1)];
    next?.focus();
  });
}

function toggleExpand(button: HTMLButtonElement): void {
  const id = button.getAttribute("aria-controls");
  const panel = id ? document.getElementById(id) : null;
  if (!panel) return;
  const open = button.getAttribute("aria-expanded") === "true";
  button.setAttribute("aria-expanded", open ? "false" : "true");
  panel.hidden = open;
  if (!open) {
    panel.tabIndex = -1;
    panel.focus();
  }
}

function bindTimeline(): void {
  const form = document.querySelector<HTMLFormElement>("#timeline-filters");
  if (!form) return;
  const params = new URLSearchParams(location.search);
  setRadio("year", params.get("year") ?? "");
  setRadio("army", params.get("army") ?? "");
  setRadio("kind", params.get("kind") ?? "");
  form.addEventListener("change", applyTimeline);
  document.querySelector("#clear-filters")?.addEventListener("click", () => {
    setRadio("year", "");
    setRadio("army", "");
    setRadio("kind", "");
    applyTimeline();
  });
  applyTimeline();
  const eventId = params.get("event");
  if (eventId) openEntry(eventId);
}

function setRadio(name: string, value: string): void {
  const input = document.querySelector<HTMLInputElement>(`input[name="${name}"][value="${CSS.escape(value)}"]`);
  if (input) input.checked = true;
}

function applyTimeline(): void {
  const year = selected("year");
  const army = selected("army");
  const kind = selected("kind");
  const params = new URLSearchParams(location.search);
  setParam(params, "year", year);
  setParam(params, "army", army);
  setParam(params, "kind", kind);
  const next = `${location.pathname}${params.toString() ? `?${params}` : ""}${location.hash}`;
  history.replaceState(null, "", next);
  let visible = 0;
  document.querySelectorAll<HTMLElement>("[data-entry]").forEach((entry) => {
    const ok =
      (!year || entry.dataset.year === year) &&
      (!army || (entry.dataset.armies ?? "").split(" ").includes(army)) &&
      (!kind || entry.dataset.type === kind);
    entry.hidden = !ok;
    if (ok) visible += 1;
  });
  const empty = document.querySelector<HTMLElement>("#timeline-empty");
  if (empty) empty.hidden = visible !== 0;
  const status = document.querySelector<HTMLElement>("#filter-status");
  if (status) status.textContent = `显示 ${visible} 条。`;
}

function selected(name: string): string {
  return document.querySelector<HTMLInputElement>(`input[name="${name}"]:checked`)?.value ?? "";
}

function setParam(params: URLSearchParams, key: string, value: string): void {
  if (value) params.set(key, value);
  else params.delete(key);
}

function openEntry(id: string): void {
  const entry = document.getElementById(id);
  const button = entry?.querySelector<HTMLButtonElement>(".expand");
  if (!entry || !button) return;
  if (entry.hidden) {
    setRadio("year", "");
    setRadio("army", "");
    setRadio("kind", "");
    applyTimeline();
  }
  if (button.getAttribute("aria-expanded") !== "true") toggleExpand(button);
  entry.scrollIntoView({ block: "start" });
}

function bindRoutes(): void {
  const params = new URLSearchParams(location.search);
  const only = params.get("force");
  if (only) {
    document.querySelectorAll<HTMLInputElement>('input[name="lane"]').forEach((box) => {
      box.checked = box.value === only;
    });
  }
  document.querySelector("#lane-toggle")?.addEventListener("change", applyLanes);
  document.querySelectorAll<HTMLElement>(".node-pin, .node-jump").forEach((button) => {
    button.addEventListener("click", () => selectNode(button.dataset.node ?? "", button.dataset.place ?? ""));
  });
  applyLanes();
  const node = params.get("node");
  if (node) selectNode(node);
  document.addEventListener("keydown", (event) => {
    const current = document.activeElement;
    if (!(current instanceof Element) || !current.classList.contains("node-pin")) return;
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    const pins = [...document.querySelectorAll<HTMLElement>(".node-pin")].filter((pin) => !pin.hidden);
    const index = pins.indexOf(current as HTMLElement);
    if (index < 0) return;
    event.preventDefault();
    const next = pins[index + (event.key === "ArrowRight" ? 1 : -1)];
    if (!next) return;
    selectNode(next.dataset.node ?? "", next.dataset.place ?? "");
    next.focus();
  });
}

function applyLanes(): void {
  const selectedLanes = [...document.querySelectorAll<HTMLInputElement>('input[name="lane"]:checked')].map((box) => box.value);
  document.querySelectorAll<SVGPathElement>("[data-lane]").forEach((path) => {
    path.toggleAttribute("hidden", !selectedLanes.includes(path.dataset.lane ?? ""));
  });
  document.querySelectorAll<HTMLButtonElement>(".node-pin").forEach((pin) => {
    const lanes = (pin.dataset.lanes ?? "").split(" ");
    pin.hidden = !lanes.some((lane) => selectedLanes.includes(lane));
  });
  const empty = document.querySelector<HTMLElement>("#map-empty");
  if (empty) empty.hidden = selectedLanes.length !== 0;
}

function selectNode(id: string, placeId = ""): void {
  const node = nodes.find((item) => item.id === id);
  const linked = placeId || nodePlaces[id]?.[0] || "";
  const place = placeById.get(linked);
  const panel = document.querySelector<HTMLElement>("#node-panel");
  if ((!node && !place) || !panel) return;
  document.querySelectorAll<HTMLElement>(".node-pin").forEach((button) => {
    const on = (id && button.dataset.node === id && (!placeId || button.dataset.place === placeId)) || (!id && placeId && button.dataset.place === placeId);
    button.setAttribute("aria-pressed", on ? "true" : "false");
  });
  const srcs = (node?.sources ?? [])
    .map((sid) => {
      const src = sourceById.get(sid);
      return src ? `<a class="src" href="./sources.html#${esc(sid)}">${esc(sid)} ${esc(src.title)}</a>` : "";
    })
    .join("");
  const coord = place
    ? `<p>${esc(place.name)}，${place.lat.toFixed(2)}°N，${place.lon.toFixed(2)}°E。几何级别是${esc(levelLabel(place.geometry_level))}。${esc(place.note)}</p><p><a href="${esc(place.wikidata)}">Wikidata 上的这条坐标</a></p>`
    : `<p>这个地点还没有单独核验到可以打点的坐标，图上不补点。</p>`;
  const heading = node ? node.name : place?.name ?? "";
  const army = node ? ARMY_LABEL[node.army] ?? node.army : "";
  panel.innerHTML = `<p>${esc(node?.id ?? place?.id ?? "")} ${esc(army)}</p>
    <h2>${esc(heading)}</h2>
    ${node ? `<p>${esc(node.role)}</p><p>今地：${esc(node.modern)}</p><p>时间：${esc(node.date)}</p>` : ""}
    ${coord}
    <p class="warn">示意图，非精确行军轨迹。</p>
    ${srcs ? `<p class="sourceline"><span>来源</span>${srcs}</p>` : ""}`;
  if (!node) return;
  const params = new URLSearchParams(location.search);
  params.set("node", id);
  history.replaceState(null, "", `${location.pathname}?${params}${location.hash}`);
}
