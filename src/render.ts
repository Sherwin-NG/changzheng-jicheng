import {
  ARMY_LABEL,
  PAGES,
  armies,
  battles,
  extractH2,
  facts,
  meetings,
  nodes,
  people,
  research,
  routeMeta,
  sources,
  timeline,
  typeLabel,
  type PageId,
  yearOf,
} from "./content";
import { esc, sourceCard, sourceChips } from "./format";
import { renderMarkdown } from "./md";
import { shell } from "./shell";

export function renderPage(page: PageId): string {
  const body = {
    home: renderHome,
    background: () => essayPage("背景", "贰", "把时段和各路分开", extractH2(research, "整体历史背景")),
    forces: renderForces,
    timeline: renderTimeline,
    routes: renderRoutes,
    meetings: renderMeetings,
    battles: renderBattles,
    people: renderPeople,
    march: () => essayPage("行军", "玖", "地理、后勤与沿途民众", extractH2(research, "地理、后勤")),
    sources: renderSources,
  }[page]();
  return shell(page, body);
}

function chapter(index: string, kicker: string, title: string, lede: string): string {
  return `<header class="chapter wrap">
    <p class="chapter-index">${esc(index)}</p>
    <div>
      <p class="kicker">${esc(kicker)}</p>
      <h1>${esc(title)}</h1>
      <p class="lede">${lede}</p>
    </div>
  </header>`;
}

function renderHome(): string {
  const overall = armies.overall;
  const picked = ["F01", "F02", "F07", "F06", "F05"].map((id) => facts.find((f) => f.id === id)!);
  const toc = PAGES.filter((p) => p.id !== "home")
    .map(
      (p) => `<li><a href="${p.href}"><span>${esc(p.index)} ${esc(p.label)}</span><span class="dots"></span><span>阅读</span></a></li>`,
    )
    .join("");
  return `<section class="hero wrap">
    <div>
      <p class="kicker">独立整理 · 非官方展览</p>
      <h1>长征纪程</h1>
      <p class="lede">一九三四年十月至一九三六年十月，四路红军先后离开根据地、在西北会师。这一路不是一条线：中央红军一九三五年十月到达吴起镇，并不等于整个长征在那一天结束。</p>
      <p>本站是独立整理，不是博物馆、档案馆或党史机构的展览。日期、人数、里程和省份口径并列，每条都能点开来源。路线图只标示意节点，不断成精确轨迹，也不使用未授权的历史照片。</p>
      <p class="actions"><a class="button" href="./timeline.html">进入年表</a><a class="button button-quiet" href="./routes.html">看路线示意</a></p>
    </div>
    <aside class="hero-aside" aria-label="三条不能合并的时间">
      <h2>先分开这三层</h2>
      <ol>
        <li><strong>整个长征</strong><span>1934年10月至1936年10月22日将台堡会师</span></li>
        <li><strong>中央红军本路</strong><span>1935年10月19日到吴起镇，22日会议宣告本路结束</span></li>
        <li><strong>另外三路</strong><span>红二十五军、红四方面军、红二方面军各有自己的出发和结束</span></li>
      </ol>
    </aside>
  </section>
  <section class="wrap band">
    <h2>容易混成一句话的几件事</h2>
    <div class="callouts">${picked.map(factCard).join("")}</div>
  </section>
  <section class="wrap split-2">
    <div>
      <p class="kicker">阅读结构</p>
      <h2>${esc(armies.concept.label)}：四路对照，而不是一条红飘带</h2>
      <p>${esc(armies.concept.meaning)}。</p>
      ${sourceChips(armies.concept.sources)}
      <dl class="stats">
        <div><dt>通行时段</dt><dd>${esc(overall.duration_description)}</dd></div>
        <div><dt>当时途经</dt><dd>${esc(String(overall.provinces_then.count))}省</dd></div>
        <div><dt>按今区划</dt><dd>${esc(String(overall.provinces_now.count))}个省级行政区</dd></div>
        <div><dt>战役战斗</dt><dd>${esc(overall.campaigns_count)}</dd></div>
      </dl>
      ${sourceChips(overall.sources)}
      <p class="note">${esc(overall.provinces_then.note)}。${esc(overall.provinces_now.note)}。省份名单不拿来反推未经核验的每日路线。</p>
    </div>
    <div>
      <p class="kicker">目录</p>
      <ol class="toc">${toc}</ol>
    </div>
  </section>
  <section class="wrap note-block">
    <p>起点标志常用一九三四年十月十日中央和中革军委由瑞金出发，但于都河以北是十六日集结完毕、十七日起渡河。两层日期都保留。</p>
    <p>照片和文物图像不在本次核链的授权范围内，本站不放历史照片，也不把示意图说成测绘成果。</p>
  </section>`;
}

function factCard(fact: { id: string; topic: string; canonical: string; variants?: string[]; do_not?: string; sources: string[] }): string {
  const variants = fact.variants?.length
    ? `<p class="variant">并列：${fact.variants.map((v) => esc(v)).join("；")}</p>`
    : "";
  const warn = fact.do_not ? `<p class="warn">${esc(fact.do_not)}</p>` : "";
  return `<article class="callout" id="${esc(fact.id)}">
    <h3>${esc(fact.topic)}</h3>
    <p>${esc(fact.canonical)}</p>
    ${variants}
    ${warn}
    ${sourceChips(fact.sources)}
  </article>`;
}

function essayPage(kicker: string, index: string, title: string, md: string): string {
  return `${chapter(index, kicker, title, "以下段落转录自核链主文，源号可点开。没有另写主文以外的情节。")}
  <article class="wrap prose">${renderMarkdown(md)}</article>`;
}

function renderForces(): string {
  const cards = armies.items.map(renderForce).join("");
  return `${chapter("叁", "四路红军", "出发、结束和人数都按各路自己的口径", "整个长征是“3＋1”。用中央红军的二万五千里或吴起镇，不能代替另外三路。")}
  <div class="wrap force-stack">${cards}</div>`;
}

type ArmyLoose = {
  id: string;
  name: string;
  later_name: string;
  notes: string;
  banner_on_departure: string;
  start: {
    canonical_marker: string;
    marker_place: string;
    sources: string[];
    date: string;
    place: string;
    assembly_crossing: { date_range: string; note: string; place: string };
    accounts: Array<{ label: string; summary: string; sources: string[] }>;
  };
  end: {
    date: string;
    place: string;
    political_declaration: string;
    sources: string[];
    arrival: string;
    rendezvous: string;
    reorganization: string;
    note: string;
  };
  headcount: Array<{ when: string; value: string; status?: string; note?: string; sources: string[] }>;
  mileage: { canonical: string; scope: string; sources: string[] };
  provinces: {
    count: number;
    list: string[];
    accounts: Array<{ count: number; list?: string[]; note?: string; sources: string[] }>;
  };
  duration: string;
  leaders_on_departure: { commander: string; deputy_commander: string; political_commissar: string };
  leaders_after_reorganization: {
    "15th_legion_commander": string;
    political_commissar: string;
    deputy_and_chief_of_staff: string;
  };
  distinctives: string[];
  sources: string[];
  leaders: { principal_leader: string; commander: string; political_commissar: string };
  ganzi_rendezvous: { dates: string[]; note: string; place: string; sources: string[] };
  formation_of_front_army: {
    date: string;
    units: string;
    commander: string;
    political_commissar: string;
    deputy_commander: string;
    deputy_political_commissar: string;
  };
};

function renderForce(input: (typeof armies.items)[number]): string {
  const force = input as unknown as ArmyLoose;
  if (force.id === "central-red-army") {
    const f = force;
    return `<article class="force" id="${esc(f.id)}">
      <p class="kicker">第一路出发</p>
      <h2>${esc(f.name)} <span>／ ${esc(f.later_name)}</span></h2>
      <p>${esc(f.notes)}</p>
      <div class="split-2 tight">
        <section>
          <h3>瑞金：标志性出发</h3>
          <p>${esc(f.start.canonical_marker)}，${esc(f.start.marker_place)}。机关向于都集结，不等于这一天全部主力已经渡河。</p>
        </section>
        <section>
          <h3>于都：主力渡河</h3>
          <p>${esc(f.start.assembly_crossing.date_range)}。${esc(f.start.assembly_crossing.note)}。地点：${esc(f.start.assembly_crossing.place)}。</p>
        </section>
      </div>
      <p class="warn">不要把瑞金出发和于都渡河写成同一天。</p>
      <h3>本路结束，不是整个长征结束</h3>
      <p>${esc(f.end.date)} 抵达 ${esc(f.end.place)}。${esc(f.end.political_declaration)}。</p>
      ${renderHeadcount(f.headcount)}
      <p>里程的通行说法是「${esc(f.mileage.canonical)}」。${esc(f.mileage.scope)}。</p>
      <p>当时途经 ${esc(String(f.provinces.count))} 省：${esc(f.provinces.list.join("、"))}。历时 ${esc(f.duration)}。</p>
      ${sourceChips([...f.start.sources, ...f.end.sources, ...f.mileage.sources])}
      <p><a href="./timeline.html?army=central-red-army">只看这一路的年表</a> · <a href="./routes.html?force=central-red-army">只看这一路的节点</a></p>
    </article>`;
  }
  if (force.id === "25th-army") {
    const f = force;
    return `<article class="force" id="${esc(f.id)}">
      <p class="kicker">第二路出发 · ${esc(f.banner_on_departure)}</p>
      <h2>${esc(f.name)}</h2>
      <p>出发：${esc(f.start.date)}，${esc(f.start.place)}。军长 ${esc(f.leaders_on_departure.commander)}，副军长 ${esc(f.leaders_on_departure.deputy_commander)}，政治委员 ${esc(f.leaders_on_departure.political_commissar)}。</p>
      <h3>抵达、会师、合编是三天</h3>
      <ol class="date-steps">
        <li><strong>${esc(f.end.arrival)}</strong> 抵达 ${esc(f.end.place)}</li>
        <li><strong>${esc(f.end.rendezvous)}</strong></li>
        <li><strong>${esc(f.end.reorganization)}</strong> 与红二十六、二十七军合编为红十五军团</li>
      </ol>
      <p>${esc(f.end.note)}。合编后，军团长 ${esc(f.leaders_after_reorganization["15th_legion_commander"])}，政治委员 ${esc(f.leaders_after_reorganization.political_commissar)}，副军团长兼参谋长 ${esc(f.leaders_after_reorganization.deputy_and_chief_of_staff)}。</p>
      ${renderHeadcount(f.headcount)}
      <ul>${f.distinctives.map((d) => `<li>${esc(d)}</li>`).join("")}</ul>
      <p>途经 ${esc(f.provinces.list.join("、"))}，行程 ${esc(f.mileage.canonical)}，历时 ${esc(f.duration)}。</p>
      ${sourceChips(f.sources)}
      <p><a href="./timeline.html?army=25th-army">这一路的年表</a> · <a href="./routes.html?force=25th-army">这一路的节点</a></p>
    </article>`;
  }
  if (force.id === "fourth-front-army") {
    const f = force;
    const accounts = f.start.accounts
      .map(
        (a) => `<section>
          <h3>${esc(a.label)}</h3>
          <p>${esc(a.summary)}</p>
          ${sourceChips(a.sources)}
        </section>`,
      )
      .join("");
    const provinces = f.provinces.accounts
      .map((a) => {
        const list = "list" in a && a.list ? `：${a.list.join("、")}` : "";
        const note = "note" in a && a.note ? ` ${a.note}` : "";
        return `<li>${esc(String(a.count))}省${esc(list)}${esc(note)} ${sourceChips(a.sources)}</li>`;
      })
      .join("");
    return `<article class="force" id="${esc(f.id)}">
      <p class="kicker">起点有两种说法，并列，不裁定</p>
      <h2>${esc(f.name)}</h2>
      <div class="split-2 tight">${accounts}</div>
      <p class="warn">不要把 3 月说和 5 月说合成一个“正式出发日”。</p>
      <p>本路会师：${esc(f.end.date)}，${esc(f.end.place)}。历时写法要和所选起点一致：${esc(f.duration)}。</p>
      <p>主要领导人 ${esc(f.leaders.principal_leader)}，总指挥 ${esc(f.leaders.commander)}，政治委员 ${esc(f.leaders.political_commissar)}。${esc(f.notes)}</p>
      <h3>途经省数也不强行统一</h3>
      <ul class="plain">${provinces}</ul>
      <p>里程通行说法：${esc(f.mileage.canonical)}。</p>
      ${renderHeadcount(f.headcount)}
      ${sourceChips(f.end.sources)}
      <p><a href="./timeline.html?army=fourth-front-army">这一路的年表</a> · <a href="./routes.html?force=fourth-front-army">这一路的节点</a></p>
    </article>`;
  }
  if (force.id !== "second-front-army") return "";
  const f = force;
  const prov = f.provinces.accounts
    .map((a) => {
      const list = "list" in a && a.list ? `（${a.list.join("、")}）` : "";
      return `<li>${esc(String(a.count))}省${esc(list)}。${"note" in a && a.note ? esc(a.note) : ""} ${sourceChips(a.sources)}</li>`;
    })
    .join("");
  return `<article class="force" id="${esc(f.id)}">
    <p class="kicker">最晚出发 · ${esc(f.later_name)}</p>
    <h2>${esc(f.name)}</h2>
    <p>出发：${esc(f.start.date)}，${esc(f.start.place)}。</p>
    <p>甘孜：${esc(f.ganzi_rendezvous.dates.join("、"))}，${esc(f.ganzi_rendezvous.note)}。地点 ${esc(f.ganzi_rendezvous.place)}。</p>
    <p>${esc(f.formation_of_front_army.date)} 组成红二方面军，包括 ${esc(f.formation_of_front_army.units)}。总指挥 ${esc(f.formation_of_front_army.commander)}，政治委员 ${esc(f.formation_of_front_army.political_commissar)}，副总指挥 ${esc(f.formation_of_front_army.deputy_commander)}，副政治委员 ${esc(f.formation_of_front_army.deputy_political_commissar)}。</p>
    <p>本路结束，也是三大主力会师完成的标志：${esc(f.end.date)}，${esc(f.end.place)}。</p>
    <h3>途经省数：8 省与 9 省并存</h3>
    <ul class="plain">${prov}</ul>
    <p>里程：${esc(f.mileage.canonical)}。历时 ${esc(f.duration)}。</p>
    ${renderHeadcount(f.headcount)}
    ${sourceChips([...f.start.sources, ...f.end.sources])}
    <p><a href="./timeline.html?army=second-front-army">这一路的年表</a> · <a href="./routes.html?force=second-front-army">这一路的节点</a></p>
  </article>`;
}

function renderHeadcount(items: Array<{ when: string; value: string; status?: string; note?: string; sources: string[] }>): string {
  const rows = items
    .map((item) => {
      const status = item.status === "canonical_official" || item.status === "canonical_magnitude" ? "通行表述" : "并列口径";
      return `<li><strong>${esc(item.when)}</strong> ${esc(item.value)} <span class="badge">${status}</span>${item.note ? `<span class="note"> ${esc(item.note)}</span>` : ""} ${sourceChips(item.sources)}</li>`;
    })
    .join("");
  return `<h3>人数按时间和统计范围分开，不相减</h3><ul class="plain">${rows}</ul>`;
}

function renderTimeline(): string {
  const years = ["1934", "1935", "1936"];
  const armiesOpts = Object.entries(ARMY_LABEL);
  const types = [...new Set(timeline.map((item) => item.type))];
  const entries = timeline
    .map((item) => {
      const confuse = item.do_not_confuse_with?.length
        ? `<p class="warn">不要和 ${item.do_not_confuse_with.map((id) => `<a href="./timeline.html?event=${esc(id)}">${esc(id)}</a>`).join("、")} 写成同一天。</p>`
        : "";
      const after = item.after_central_army_long_march
        ? `<p class="warn">这一条发生在中央红军长征结束之后。</p>`
        : "";
      const precision = item.precision ? `<p class="note">时间精度：${esc(item.precision)}。不补成未经核验的时刻表。</p>` : "";
      return `<article class="entry" id="${esc(item.id)}" data-entry="${esc(item.id)}" data-year="${esc(yearOf(item.date))}" data-armies="${esc(item.army.join(" "))}" data-type="${esc(item.type)}">
        <div class="entry-meta"><time>${esc(item.date_label)}</time><span class="badge">${esc(typeLabel(item.type))}</span></div>
        <h2>${esc(item.title)}</h2>
        <p>${esc(item.summary)}</p>
        <ul class="tags">${item.army.map((a) => `<li>${esc(ARMY_LABEL[a] ?? a)}</li>`).join("")}<li>${esc(item.place)}</li></ul>
        <button type="button" class="expand" aria-expanded="false" aria-controls="detail-${esc(item.id)}">展开说明与来源</button>
        <div id="detail-${esc(item.id)}" class="detail" hidden>
          ${confuse}${after}${precision}
          <p>地点：${esc(item.place)}。日期写法：${esc(item.date_label)}。</p>
          ${sourceChips(item.sources)}
          <div class="source-stack">${item.sources.map((id) => sourceBy(id)).join("")}</div>
        </div>
      </article>`;
    })
    .join("");
  return `${chapter("肆", "年表", `${timeline.length} 个分开写的节点`, "可以按年份、部队和种类筛选。中央红军到达吴起镇，与一九三六年十月的总结束分成两条。")}
  <div class="wrap timeline-layout">
    <form class="filters" id="timeline-filters">
      <fieldset>
        <legend>年份</legend>
        <label><input type="radio" name="year" value="" checked /> 全部</label>
        ${years.map((y) => `<label><input type="radio" name="year" value="${y}" /> ${y}</label>`).join("")}
      </fieldset>
      <fieldset>
        <legend>部队</legend>
        <label><input type="radio" name="army" value="" checked /> 全部</label>
        ${armiesOpts.map(([id, label]) => `<label><input type="radio" name="army" value="${esc(id)}" /> ${esc(label)}</label>`).join("")}
      </fieldset>
      <fieldset>
        <legend>种类</legend>
        <label><input type="radio" name="kind" value="" checked /> 全部</label>
        ${types.map((t) => `<label><input type="radio" name="kind" value="${esc(t)}" /> ${esc(typeLabel(t))}</label>`).join("")}
      </fieldset>
      <button type="button" id="clear-filters">清除筛选</button>
      <p id="filter-status" aria-live="polite"></p>
    </form>
    <div>
      <p id="timeline-empty" class="empty" hidden>当前筛选下没有条目。可以清除条件，或换一路部队。</p>
      <div id="timeline-list">${entries}</div>
    </div>
  </div>`;
}

function sourceBy(id: string) {
  const src = sources.find((s) => s.id === id);
  return src ? sourceCard(src, false) : "";
}

function renderRoutes(): string {
  const lanes = [
    { id: "central-red-army", y: 120 },
    { id: "25th-army", y: 270 },
    { id: "fourth-front-army", y: 420 },
    { id: "second-front-army", y: 560 },
  ];
  const placed = nodes.map((node) => ({ ...node, lanes: lanesFor(node) }));
  const pins: string[] = [];
  const paths: string[] = [];
  for (const lane of lanes) {
    const mine = placed.filter((n) => n.lanes.includes(lane.id));
    mine.sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
    const pts = mine.map((n, i) => {
      const x = mine.length === 1 ? 500 : 70 + (i / (mine.length - 1)) * 860;
      return { ...n, x, y: lane.y };
    });
    if (pts.length >= 2) {
      let d = `M ${pts[0].x} ${pts[0].y}`;
      for (let i = 1; i < pts.length; i += 1) {
        const p = pts[i - 1];
        const c = pts[i];
        const mx = (p.x + c.x) / 2;
        d += ` C ${mx} ${p.y}, ${mx} ${c.y}, ${c.x} ${c.y}`;
      }
      paths.push(`<path data-lane="${lane.id}" d="${d}" />`);
    }
    for (const p of pts) {
      const label = `${p.name}，${ARMY_LABEL[lane.id]}，版面位置，不是经纬度`;
      pins.push(`<button type="button" class="node-pin" data-node="${esc(p.id)}" data-lanes="${esc(lane.id)}" style="left:${(p.x / 1000) * 100}%;top:${(p.y / 680) * 100}%" aria-pressed="false" aria-label="${esc(label)}">${esc(p.id.replace("N", ""))}</button>`);
    }
  }
  const list = nodes
    .map(
      (n) => `<li>
        <button type="button" class="node-jump" data-node="${esc(n.id)}">${esc(n.name)}</button>
        <span>${esc(ARMY_LABEL[n.army] ?? n.army)} · ${esc(n.date)}</span>
      </li>`,
    )
    .join("");
  const checks = Object.entries(ARMY_LABEL)
    .map(
      ([id, label]) =>
        `<label><input type="checkbox" name="lane" value="${esc(id)}" checked /> ${esc(label)}</label>`,
    )
    .join("");
  return `${chapter("伍", "路线示意", "分路节点，不是测绘轨迹", "横轴只按阅读先后排列。圆点没有经纬度，不能连成“实际走过的红线”。")}
  <div class="wrap">
    <p class="disclaimer" id="map-disclaimer">${esc(routeMeta.disclaimer)} ${esc(routeMeta.mapDisclaimer)} 背景里的山形和水纹是原创意象，不对应某座山或某条河。</p>
    <ul class="rules">${routeMeta.rules.map((r) => `<li>${esc(r)}</li>`).join("")}</ul>
    <fieldset class="lane-toggle" id="lane-toggle">
      <legend>显示哪一路</legend>
      ${checks}
    </fieldset>
    <p id="map-empty" class="empty" hidden>请至少选择一路。</p>
    <div class="map-layout">
      <figure class="map-stage">
        <div class="map-scroll">
        <div class="map-canvas">
        <svg viewBox="0 0 1000 680" role="img" aria-labelledby="map-title map-desc">
          <title id="map-title">四路节点示意</title>
          <desc id="map-desc">${esc(routeMeta.disclaimer)}</desc>
          <rect width="1000" height="680" fill="#efe6d6" />
          <g class="terrain" aria-hidden="true">
            <path d="M0 180 C 160 120, 280 210, 420 150 C 560 90, 700 200, 1000 140 L 1000 230 C 760 250, 520 160, 300 230 C 160 280, 40 210, 0 250 Z" />
            <path d="M0 360 C 180 300, 340 410, 520 340 C 700 270, 840 390, 1000 330 L 1000 410 C 780 450, 560 360, 340 430 C 180 480, 60 400, 0 450 Z" />
            <path d="M40 520 C 200 480, 360 560, 560 510 C 760 460, 880 540, 980 500" fill="none" />
          </g>
          <g class="lanes">${paths.join("")}</g>
        </svg>
        <div class="pin-layer">${pins.join("")}</div>
        </div>
        </div>
        <figcaption>无比例尺。横轴不是东西方向，纵轴也不是南北方向。节点多的一路可以横向滚动。</figcaption>
      </figure>
      <div id="node-panel" class="node-panel" aria-live="polite">
        <p class="kicker">节点说明</p>
        <p>选择一个圆点或下方名单。说明只重复核链稿里的角色和今地，不补每日驻地。</p>
      </div>
    </div>
    <ol class="node-list">${list}</ol>
  </div>`;
}

function lanesFor(node: { army: string; role: string }): string[] {
  const ids = new Set<string>([node.army]);
  if (node.role.includes("红四方面军")) ids.add("fourth-front-army");
  if (node.role.includes("红一方面军") || node.role.includes("中央红军")) ids.add("central-red-army");
  if (node.role.includes("红二")) ids.add("second-front-army");
  if (node.role.includes("红二十五军")) ids.add("25th-army");
  return [...ids];
}

function renderMeetings(): string {
  const series = [...new Set(meetings.map((m) => m.series))];
  const groups = series
    .map((name) => {
      const items = meetings.filter((m) => m.series === name).map(meetingArticle).join("");
      return `<section class="group"><h2>${esc(name)}</h2>${items}</section>`;
    })
    .join("");
  return `${chapter("陆", "会议", "一条决策链，不是单点", "通道还没有定下大方向，黎平才改向黔北，遵义解决军事和组织问题。落脚陕北要到榜罗镇才正式确定。")}
  <div class="wrap stack">${groups}</div>`;
}

function meetingArticle(item: (typeof meetings)[number]): string {
  const note = item.date_note ? `<p class="note">${esc(item.date_note)}</p>` : "";
  const evaluation = item.historical_evaluation
    ? `<h3>已核读的历史评价</h3><p>${esc(item.historical_evaluation)}</p>`
    : "";
  return `<article class="entry" id="${esc(item.id)}">
    <div class="entry-meta"><time>${esc(item.date)}</time><span class="badge">${esc(item.level)}</span></div>
    <h3>${esc(item.name)}</h3>
    <p>${esc(item.place)}</p>
    ${note}
    <p>${esc(item.decision)}</p>
    ${evaluation}
    ${sourceChips(item.sources)}
  </article>`;
}

function renderBattles(): string {
  const later = new Set(["B11"]);
  const during = battles.filter((b) => !later.has(b.id));
  const after = battles.filter((b) => later.has(b.id));
  return `${chapter("柒", "战役", "只写核读较充分的战斗", "直罗镇放在中央红军长征结束之后，不并进途中战役。三渡、四渡不补成未经核验的时刻表。")}
  <div class="wrap stack">
    <section><h2>途中</h2>${during.map(battleArticle).join("")}</section>
    <section><h2>落脚之后的奠基</h2>${after.map(battleArticle).join("")}</section>
    <p>四路各种战役战斗的总述：${esc(battlesJsonOverall())}</p>
  </div>`;
}

function battlesJsonOverall(): string {
  return "各种战役战斗600余次，其中师以上规模120多次";
}

function battleArticle(item: (typeof battles)[number]): string {
  return `<article class="entry" id="${esc(item.id)}">
    <div class="entry-meta"><time>${esc(item.date)}</time>${item.army.map((a) => `<span class="badge">${esc(ARMY_LABEL[a] ?? a)}</span>`).join("")}</div>
    <h3>${esc(item.name)}</h3>
    <p class="meta">${esc(item.place)}</p>
    <p>${esc(item.summary)}</p>
    ${item.significance ? `<p>${esc(item.significance)}</p>` : ""}
    ${item.note ? `<p class="warn">${esc(item.note)}</p>` : ""}
    ${item.caution ? `<p class="warn">${esc(item.caution)}</p>` : ""}
    ${item.precision ? `<p class="note">${esc(item.precision)}</p>` : ""}
    ${sourceChips(item.sources)}
  </article>`;
}

function renderPeople(): string {
  const groups: Array<{ title: string; ids: string[] }> = [
    { title: "中央与中央红军", ids: ["P01", "P02", "P03", "P04", "P05", "P06", "P07", "P08", "P09", "P10", "P11", "P12"] },
    { title: "红四方面军", ids: ["P13", "P14", "P15"] },
    { title: "红二方面军", ids: ["P16", "P17", "P18", "P19", "P20"] },
    { title: "红二十五军与陕甘红军", ids: ["P21", "P22", "P23", "P24"] },
    { title: "留守、沿途与战斗中的姓名", ids: ["P25", "P26", "P27", "P28", "P29", "P30", "P31"] },
  ];
  const body = groups
    .map((g) => {
      const cards = g.ids
        .map((id) => people.find((p) => p.id === id))
        .filter((p): p is (typeof people)[number] => Boolean(p))
        .map(
          (p) => `<article class="person" id="${esc(p.id)}">
            <h3>${esc(p.name)}</h3>
            <p>${esc(p.role)}</p>
            ${p.note ? `<p class="note">${esc(p.note)}</p>` : ""}
            ${sourceChips(p.sources)}
          </article>`,
        )
        .join("");
      return `<section><h2>${esc(g.title)}</h2><div class="person-grid">${cards}</div></section>`;
    })
    .join("");
  return `${chapter("捌", "人物", "只写已核职责", "不补籍贯、生卒和未核任职起止。姓名不全的英雄群体不在这里补名。泸定桥突击队的完整名单，核链稿写明至今不能全部确认。")}
  <div class="wrap stack">${body}</div>`;
}

function renderSources(): string {
  const factBlocks = facts
    .map((f) => {
      const variants = f.variants?.map((v) => `<li>${esc(v)}</li>`).join("") ?? "";
      const examples = f.examples?.map((v) => `<li>${esc(v)}</li>`).join("") ?? "";
      return `<article class="entry" id="${esc(f.id)}">
        <h3>${esc(f.topic)}</h3>
        <p>${esc(f.canonical)}</p>
        ${variants ? `<ul>${variants}</ul>` : ""}
        ${examples ? `<ul>${examples}</ul>` : ""}
        ${f.unit ? `<p class="note">${esc(f.unit)}</p>` : ""}
        ${f.rejected_comparison ? `<p class="warn">${esc(f.rejected_comparison)}</p>` : ""}
        ${f.do_not ? `<p class="warn">${esc(f.do_not)}</p>` : ""}
        ${f.note ? `<p class="note">${esc(f.note)}</p>` : ""}
        ${f.sources.length ? sourceChips(f.sources) : `<p class="note">这是编辑边界，核链稿没有另附专文源号。</p>`}
      </article>`;
    })
    .join("");
  const cards = sources.map((src) => sourceCard(src)).join("");
  return `${chapter("拾", "口径与文献", "不同数字放在一起，不合成一个标准答案", "主表述和并列口径都保留。来源写明机构、题目和链接。握手失败不会被写成 404。")}
  <div class="wrap stack" id="method">
    <section id="facts"><h2>必须分开的口径</h2>${factBlocks}</section>
    <section class="prose" id="essay-caliber"><h2>核链主文的说明</h2>${renderMarkdown(extractH2(research, "史料阅读与争议口径"))}</section>
    <section class="prose" id="spirit"><h2>长征精神的规范表述</h2>${renderMarkdown(extractH2(research, "长征精神的规范表述"))}</section>
    <section class="prose" id="reading"><h2>延伸阅读的边界</h2>${renderMarkdown(extractH2(research, "史料阅读建议"))}</section>
    <section id="bibliography"><h2>22 条核心来源与 2 条补充</h2><p>下列链接使用核链稿记录的 HTTPS 地址。出版日来自各篇原文，不是本站的发表日。</p><div class="source-stack">${cards}</div>    </section>
  </div>`;
}
