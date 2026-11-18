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
import { frames, legendHtml, osmCreditHtml, renderMap } from "./atlas";
import { esc, sourceCard, sourceChips } from "./format";
import { photo, shippedMedia } from "./figures";
import { renderMarkdown } from "./md";
import { shell } from "./shell";

function readerNote(code: string | undefined): string {
  if (!code) return "";
  if (/[A-Za-z]_[A-Za-z]/.test(code)) return "";
  return `<p class="note">${esc(code)}</p>`;
}

export function renderPage(page: PageId): string {
  const body = {
    home: renderHome,
    background: () =>
      essayPage(
        "把时段和各路分开",
        "两年里走的不是同一支队伍，结束的日子也不在同一天。下面是核链主文里的背景，源号可以点开。",
        extractH2(research, "整体历史背景"),
        `${photo("img-ruijin-yunshishan-2007")}<p>瑞金云石山是今天能走到的山，石壁上的字是后来题的。中央机关一九三四年十月十日从瑞金出发，主力渡河是几天后在于都。这张2007年的照片不能代替那两天的差别。</p>`,
      ),
    forces: renderForces,
    timeline: renderTimeline,
    routes: renderRoutes,
    meetings: renderMeetings,
    battles: renderBattles,
    people: renderPeople,
    march: () =>
      essayPage(
        "江、山、草地和沿途的人",
        "行军写的是路怎么走、粮食从哪里来、沿途的人遇到了什么。照片是今天的山口和湿地。",
        extractH2(research, "地理、后勤"),
        `${photo("img-jiajin-pass-2013")}<p>夹金山垭口是二〇一三年的样子。一九三五年红军从这里翻过雪山时，没有留下可以公开使用的现场照片。</p>${photo("img-zoige-wetland-2013")}<p>若尔盖湿地说明草地是一片洼地和水草，不是地图上可以一笔画过的细线。</p>`,
      ),
    sources: renderSources,
  }[page]();
  return shell(page, body);
}

function chapter(title: string, lede: string): string {
  return `<header class="chapter wrap">
    <h1>${esc(title)}</h1>
    <p class="lede">${lede}</p>
  </header>`;
}

function renderHome(): string {
  const overall = armies.overall;
  const picked = ["F01", "F02", "F07", "F06", "F05"].map((id) => facts.find((f) => f.id === id)!);
  const blurbs: Record<string, string> = {
    background: "两年、四路，结束的日子不在同一天。",
    forces: "各路自己的出发、结束和人数。",
    timeline: "三十七个节点，可以按部队筛选。",
    routes: "用坐标看谁在东、谁在北，线不是轨迹。",
    meetings: "从通道转到榜罗镇，方向是一次次改的。",
    battles: "只写核过的战斗。湘江没有现场照片，用地图说明。",
    people: "只写已经核过的职责。",
    march: "江、雪山、草地，以及沿途的人。",
    sources: "不同的数字放在一起，每条都能点开。",
  };
  const toc = PAGES.filter((p) => p.id !== "home")
    .map((p) => `<li><a href="${p.href}">${esc(p.label)}</a><p>${esc(blurbs[p.id] ?? "")}</p></li>`)
    .join("");
  const homeMap = renderMap({ ...frames.overview, id: "home-map", interactive: false });
  return `<article class="opening wrap">
    <div>
      <h1>长征纪程</h1>
      <p class="lede">一九三四年十月至一九三六年十月，四路红军先后离开根据地，在西北会师。中央红军一九三五年十月到达吴起镇，并不等于整个长征在那一天结束。</p>
      <p>本站是独立整理，不是博物馆、档案馆或党史机构的展览。日期、人数、里程和省份有几种说法，就并列写着，每条都能点开来源。</p>
      <p class="actions"><a class="button" href="./timeline.html">进入年表</a> <a href="./routes.html">看四路的地图</a></p>
    </div>
    ${photo("img-yudu-ferry-2014", { eager: true })}
  </article>
  <section class="wrap reading">
    <h2>先把三层时间分开</h2>
    <p>整个长征写到一九三六年十月二十二日将台堡会师。</p>
    <p>中央红军这一路，一九三五年十月十九日到吴起镇，二十二日的会议宣告的是这一路结束。</p>
    <p>红二十五军、红四方面军、红二方面军各有自己的出发和结束。</p>
    <h2>容易写混的几件事</h2>
    ${picked.map(factCard).join("")}
    <h2>${esc(armies.concept.label)}</h2>
    <p>${esc(armies.concept.meaning)}。</p>
    ${sourceChips(armies.concept.sources)}
    <p>通行时段是${esc(overall.duration_description.replace(/。$/, ""))}。当时的叙述是${esc(String(overall.provinces_then.count))}省，按今天的区划是${esc(String(overall.provinces_now.count))}个省级行政区。战役战斗的通行说法是${esc(overall.campaigns_count)}。</p>
    ${sourceChips(overall.sources)}
    <p>${esc(overall.provinces_then.note)}。${esc(overall.provinces_now.note)}。省份名单不拿来反推未经核验的每日路线。</p>
    <p>起点常用一九三四年十月十日中央和中革军委由瑞金出发。于都河以北是十六日集结完毕、十七日起渡河。两层日期都保留。上面那张渡口照片拍于二〇一四年，不是一九三四年的现场。</p>
  </section>
  <section class="wrap map-block">
    <h2>四路不在一条线上</h2>
    <p>赣南在东，陕甘在北。红二十五军从河南罗山一带北上，红二、红六军团从湘西出来，红四方面军的已知点多在川西和甘南。空白的地方是还没有核到坐标的路段，不是他们没有走过。</p>
    ${mapView(homeMap.svg, "示意图，非精确行军轨迹。虚线只连接相距较近的已知点。灰色虚线是今省级行政区，不是一九三五年的省界。河网是 Natural Earth 的 1:1000 万概化数据，用来认方位。")}
    ${legendHtml()}
    <p><a href="./routes.html">地图的读法和四张局部图</a></p>
  </section>
  <section class="wrap">
    <h2>分章读</h2>
    <ul class="contents">${toc}</ul>
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

function essayPage(title: string, lede: string, md: string, extra = ""): string {
  return `${chapter(title, lede)}
  <article class="wrap reading">${extra}${renderMarkdown(md)}</article>`;
}

function renderForces(): string {
  const cards = armies.items.map(renderForce).join("");
  return `${chapter("出发、结束和人数都按各路自己的口径", "整个长征是“3＋1”。用中央红军的二万五千里或吴起镇，不能代替另外三路。")}
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
      <h2>${esc(f.name)}，后来称${esc(f.later_name)}</h2>
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
      <h2>${esc(f.name)}</h2>
      <p>出发时的旗帜写的是${esc(f.banner_on_departure)}。</p>
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
      <h2>${esc(f.name)}</h2>
      <p>起点有两种说法，并列，不裁定成一个日子。</p>
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
    <h2>${esc(f.name)}，后来称${esc(f.later_name)}</h2>
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
      const precision = readerNote(item.precision);
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
  return `${chapter(`${timeline.length} 个分开写的节点`, "可以按年份、部队和种类筛选。中央红军到达吴起镇，与一九三六年十月的总结束分成两条。")}
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

function mapView(svg: string, caption: string): string {
  return `<figure class="map-figure">
    <div class="map-slot">${svg}</div>
    <p><button type="button" class="map-zoom">放大读图</button></p>
    ${caption.startsWith("<") ? `<figcaption>${caption}</figcaption>` : `<figcaption><p>${caption}</p></figcaption>`}
  </figure>`;
}

function mapBlock(frameId: keyof typeof frames, prose: string): string {
  const drawn = renderMap(frames[frameId]);
  return `<section class="map-block" id="map-${frameId}">
    <div class="reading">${prose}</div>
    ${mapView(drawn.svg, `<p>示意图，非精确行军轨迹。虚线只连接相距较近的已知点。蓝色河是 Natural Earth 1:1000万概化河网，只用来认方位。灰色虚线是今省级行政区，不是一九三五年省界。西康没有画。</p>${osmCreditHtml()}`)}
    <div class="table-wrap">${drawn.table}</div>
  </section>`;
}

function renderRoutes(): string {
  const list = nodes
    .map(
      (n) => `<li>
        <button type="button" class="node-jump" data-node="${esc(n.id)}">${esc(n.name)}</button>
        <span>${esc(ARMY_LABEL[n.army] ?? n.army)} ${esc(n.date)}</span>
      </li>`,
    )
    .join("");
  const checks = Object.entries(ARMY_LABEL)
    .map(
      ([id, label]) =>
        `<label><input type="checkbox" name="lane" value="${esc(id)}" checked /> ${esc(label)}</label>`,
    )
    .join("");
  const overview = renderMap(frames.overview);
  const schematicFig = photo("img-map-schematic-zh-svg");
  return `${chapter("四路各自在哪里，不是一条红线", "北在图的上方。方块、圆点、菱形、三角各代表一路。虚线只连接离得较近的已知点，中间缺坐标的地方留白。")}
  <div class="wrap">
    <p class="disclaimer" id="map-disclaimer">${esc(routeMeta.disclaimer)} ${esc(routeMeta.mapDisclaimer)} 示意图，非精确行军轨迹。</p>
    <p>中央红军从瑞金、于都往西，过湘江一带后转向贵州。遵义以后在赤水河附近往复，总图不把四次渡河连成一条折线。皎平渡和泸定桥之间隔着还没有逐镇坐标的路，所以中间断开。哈达铺到吴起还隔着榜罗镇和六盘山，这两处没有单独的点，也不连。</p>
    <p>红二十五军只核到罗山县城和延川县城，相距太远，不画穿越河南、陕西的直线。红二、红六军团的桑植到甘孜也是这样。红四方面军的起点有三月、五月两种说法，总图上不替他们补一条从川陕边拉出来的线。</p>
    ${legendHtml()}
    <fieldset class="lane-toggle" id="lane-toggle">
      <legend>显示哪一路</legend>
      ${checks}
    </fieldset>
    <p id="map-empty" class="empty" hidden>请至少选择一路。关掉之后，这一路的点、虚线、范围和地名会隐藏。陆地、今省界和河还留在图上，用来看方位。</p>
    <div class="map-layout">
      ${mapView(overview.svg, `<p>阿尔伯斯投影，标准纬线 25° 和 40°，东西和南北用同一个比例。比例尺在左下角，按投影上的距离画出。示意图，非精确行军轨迹。浅色范围不是行军线。</p>${osmCreditHtml()}`)}
      <div id="node-panel" class="node-panel" aria-live="polite">
        <p>点一个符号，或点下面的名单。说明只重复核链稿里的角色；坐标写明是县城、镇还是遗址。</p>
      </div>
    </div>
    <div class="table-wrap">${overview.table}</div>
    <ul class="rules">${routeMeta.rules.map((r) => `<li>${esc(r)}</li>`).join("")}</ul>
    ${mapBlock("xiang", `<h2>湘江</h2><p>道县、兴安、全州是三个县城，不是渡口。蓝线是湘江干流：兴安、全州靠近江，道县在东边的支流一带，不在这条干流上。浅色方框只表示战役发生在这三县之间，不是一条进军折线。框上不再写字，以免挡住全州。这里没有可合法使用的战场照片，不用长沙的江景来顶。过江以后人数大减，通道、黎平才把方向改向贵州。</p>`)}
    ${mapBlock("chishui", `<h2>赤水</h2><p>蓝线是赤水河。浅色方框是四次渡河的阅读范围，不标桥，框上不写字，免得和「赤水」叠成别的河名。茅台镇在河附近，是三渡的通行地点之一。习水是县城，赤水是市政府所在地，都不能当成某一次的桥。乌江如果出现，是另一条河。</p>${photo("img-chishui-maotai-2016")}`)}
    ${mapBlock("jinsha", `<h2>金沙江和大渡河</h2><p>图上的皎平渡是渡口遗址，不是南边约二十公里的镇驻地。安顺场的渡口窄，后面的部队沿河向北到泸定桥。渡口到安顺场大约三百五十公里，中间没有逐日驻地，所以不连线。</p>${photo("img-jiaopingdu-bridge-2020")}${photo("img-dadu-terrace-2012")}${photo("img-luding-bridge-2018")}`)}
    ${mapBlock("snow", `<h2>雪山和草地</h2><p>夹金山在宝兴与小金之间。浅色方框只罩住若尔盖县城一带，表示草地在这里，不是从若尔盖画到迭部的一条过草地路线。迭部仍是单独的点。小金和若尔盖之间还有两河口、毛儿盖，没有逐镇坐标，所以中间留白。宝兴标在图上。</p>${photo("img-jiajin-pass-2013")}${photo("img-zoige-wetland-2013")}`)}
    ${mapBlock("endings", `<h2>三个不能合成一点的结束</h2><p>吴起镇是中央红军这一路的结束，在今陕西。会宁在今甘肃，是和红四方面军会师的地方。将台堡在今宁夏西吉，当时的叙述常把它记在甘肃。三处不连成一条线。中央红军到吴起，并不等于一九三六年十月将台堡的总结束。将台堡不放纪念碑特写，位置看这张图。</p>${photo("img-huining-tower-2012")}${photo("img-wuqi-today-2010")}`)}
    <section class="reading">
      <h2>一张别人画的对照图</h2>
      <p>下面这张是维基共享资源上的后期示意图，主要画中央红军一九三四到一九三五年，画不到会宁和将台堡。比例尺用的是英里。图上还有首尔，以及利多、英帕尔、曼德勒、腊戍、密支那这些更接近后来缅甸战场的地名。它不是本站的地图，也不能代表另外三路。</p>
      ${schematicFig}
    </section>
    <h2>三十五个节点</h2>
    <p>名单仍是原来的三十五个。没有单独坐标的，图上不补点。</p>
    <ol class="node-list">${list}</ol>
  </div>`;
}

function pictureLedger(): string {
  const rows = shippedMedia()
    .map((item) => {
      const license = item.licenseUrl ? `<a href="${esc(item.licenseUrl)}">${esc(item.license)}</a>` : esc(item.license);
      return `<li><strong>${esc(item.place)}</strong> ${esc(item.title)}，${esc(item.dateLabel)}，${esc(item.artist)}。${license}。<a href="${esc(item.filePage)}">原始文件页</a>。${esc(item.derivative)}</li>`;
    })
    .join("");
  return `<p>陆地、今省界和大多数河来自 Natural Earth，公共领域，比例尺是 1:1000 万。西康等民国省界没有可再分发的数据，所以不画。皎平渡用的是渡口坐标，不是镇驻地。</p>${osmCreditHtml()}<ul class="plain">${rows}</ul>`;
}

function renderMeetings(): string {
  const series = [...new Set(meetings.map((m) => m.series))];
  const groups = series
    .map((name) => {
      const items = meetings.filter((m) => m.series === name).map(meetingArticle).join("");
      return `<section class="group"><h2>${esc(name)}</h2>${items}</section>`;
    })
    .join("");
  return `${chapter("方向是一次次改的", "通道还没有定下大方向，黎平才改向黔北，遵义解决军事和组织问题。落脚陕北要到榜罗镇才正式确定。")}
  <div class="wrap stack">${groups}</div>`;
}

function meetingArticle(item: (typeof meetings)[number]): string {
  const note = item.date_note ? `<p class="note">${esc(item.date_note)}</p>` : "";
  const evaluation = item.historical_evaluation
    ? `<h3>已核读的历史评价</h3><p>${esc(item.historical_evaluation)}</p>`
    : "";
  const shot =
    item.name === "黎平会议"
      ? photo("img-liping-oldstreet-2006")
      : item.name === "遵义会议"
        ? photo("img-zunyi-site-2018")
        : item.name === "哈达铺会议"
          ? photo("img-hadapu-site-2026")
          : "";
  return `<article class="entry" id="${esc(item.id)}">
    <div class="entry-meta"><time>${esc(item.date)}</time><span class="badge">${esc(item.level)}</span></div>
    <h3>${esc(item.name)}</h3>
    ${shot}
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
  return `${chapter("只写核读较充分的战斗", "直罗镇放在中央红军长征结束之后，不并进途中战役。三渡、四渡不补成未经核验的时刻表。湘江没有合格的战场照片，这一段只用地图。")}
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
  const extra =
    item.id === "B01"
      ? mapBlock("xiang", "<p>湘江战役的地段在道县、兴安、全州之间。没有可核验的渡口照片，不用长沙江景代替。</p>")
      : item.id === "B03"
        ? photo("img-chishui-maotai-2016") + mapBlock("chishui", "<p>茅台镇的河岸是二〇一六年的样子。四次渡河的桥点没有逐一核验，图上只标范围。</p>")
        : item.id === "B04"
          ? photo("img-jiaopingdu-bridge-2020")
          : item.id === "B05"
            ? photo("img-dadu-terrace-2012")
            : item.id === "B06"
              ? photo("img-luding-bridge-2018") + mapBlock("jinsha", "<p>皎平渡标的是渡口，不是镇驻地。安顺场到泸定桥这一小段才标了方向。</p>")
              : "";
  return `<article class="entry" id="${esc(item.id)}">
    <div class="entry-meta"><time>${esc(item.date)}</time>${item.army.map((a) => `<span class="badge">${esc(ARMY_LABEL[a] ?? a)}</span>`).join("")}</div>
    <h3>${esc(item.name)}</h3>
    ${extra}
    <p class="meta">${esc(item.place)}</p>
    <p>${esc(item.summary)}</p>
    ${item.significance ? `<p>${esc(item.significance)}</p>` : ""}
    ${item.note ? `<p class="warn">${esc(item.note)}</p>` : ""}
    ${item.caution ? `<p class="warn">${esc(item.caution)}</p>` : ""}
    ${readerNote(item.precision)}
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
  return `${chapter("只写已核职责", "不补籍贯、生卒和未核任职起止。姓名不全的英雄群体不在这里补名。泸定桥突击队的完整名单，核链稿写明至今不能全部确认。")}
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
  return `${chapter("不同数字放在一起，不合成一个标准答案", "主表述和并列口径都保留。来源写明机构、题目和链接。握手失败不会被写成 404。")}
  <div class="wrap stack" id="method">
    <section id="facts"><h2>必须分开的口径</h2>${factBlocks}</section>
    <section class="prose" id="essay-caliber"><h2>核链主文的说明</h2>${renderMarkdown(extractH2(research, "史料阅读与争议口径"))}</section>
    <section class="prose" id="spirit"><h2>长征精神的规范表述</h2>${renderMarkdown(extractH2(research, "长征精神的规范表述"))}</section>
    <section class="prose" id="reading"><h2>延伸阅读的边界</h2>${renderMarkdown(extractH2(research, "史料阅读建议"))}</section>
    <section id="bibliography"><h2>22 条核心来源与 2 条补充</h2><p>下列链接使用核链稿记录的 HTTPS 地址。出版日来自各篇原文，不是本站的发表日。</p><div class="source-stack">${cards}</div></section>
    <section id="pictures"><h2>图片和底图</h2>${pictureLedger()}</section>
  </div>`;
}
