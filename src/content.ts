import armiesJson from "../content/data/armies.json";
import battlesJson from "../content/data/battles.json";
import factsJson from "../content/data/key-facts.json";
import meetingsJson from "../content/data/meetings.json";
import peopleJson from "../content/data/people.json";
import nodesJson from "../content/data/route-nodes.json";
import sourcesJson from "../content/data/sources.json";
import timelineJson from "../content/data/timeline.json";
import researchMd from "../content/research-main.md?raw";
import linkRecheckJson from "../content/data/link-recheck.json";

export interface Source {
  id: string;
  title: string;
  authors: string[];
  publisher: string;
  original_publication: string;
  pub_date: string;
  url: string;
  accessed: string;
  http_check_2026_11_18: string;
  access_note: string;
  type: string;
  reliability: string;
  use_for: string[];
  supplementary?: boolean;
  author_affiliation?: string;
}

export interface TimelineItem {
  id: string;
  date: string;
  date_label: string;
  title: string;
  army: string[];
  type: string;
  place: string;
  summary: string;
  sources: string[];
  do_not_confuse_with?: string[];
  precision?: string;
  after_central_army_long_march?: boolean;
}

export interface Person {
  id: string;
  name: string;
  role: string;
  sources: string[];
  note?: string;
}

export interface Meeting {
  id: string;
  name: string;
  date: string;
  date_note?: string;
  place: string;
  level: string;
  series: string;
  decision: string;
  historical_evaluation?: string;
  sources: string[];
}

export interface Battle {
  id: string;
  name: string;
  date: string;
  place: string;
  army: string[];
  summary: string;
  significance?: string;
  sources: string[];
  caution?: string;
  note?: string;
  precision?: string;
}

export interface RouteNode {
  id: string;
  name: string;
  modern: string;
  army: string;
  role: string;
  date: string;
  sources: string[];
}

export interface Fact {
  id: string;
  topic: string;
  canonical: string;
  variants?: string[];
  do_not?: string;
  sources: string[];
  unit?: string;
  rejected_comparison?: string;
  examples?: string[];
  note?: string;
}

export const sources = sourcesJson.items as Source[];
export const timeline = timelineJson.items as TimelineItem[];
export const people = peopleJson.items as Person[];
export const meetings = meetingsJson.items as Meeting[];
export const battles = battlesJson.items as Battle[];
export const nodes = nodesJson.items as RouteNode[];
export const facts = factsJson.items as Fact[];
export const armies = armiesJson;
export const routeMeta = {
  disclaimer: nodesJson.disclaimer,
  rules: nodesJson.cartography_rules,
  mapDisclaimer: timelineJson.map_disclaimer,
};
export const research = researchMd;
export const sourceById = new Map(sources.map((s) => [s.id, s]));
export const linkRecheck = new Map(
  (linkRecheckJson as Array<{ id: string; code: string; err: string }>).map((row) => [row.id, row]),
);

export const ARMY_LABEL: Record<string, string> = {
  "central-red-army": "中央红军",
  "25th-army": "红二十五军",
  "fourth-front-army": "红四方面军",
  "second-front-army": "红二、红六军团",
};

export const TYPE_LABEL: Record<string, string> = {
  decision: "决策",
  prelude: "前奏",
  departure_marker: "出发标志",
  departure_crossing: "渡河出发",
  rendezvous: "会师",
  battle: "战役战斗",
  meeting: "会议",
  event: "事件",
  battle_and_possible_departure: "战役与可能的起点",
  possible_departure: "另一种起点",
  organization: "编制",
  arrival: "到达",
  rendezvous_and_overall_end: "会师与总结束",
};

export const PAGES = [
  { id: "home", href: "./index.html", label: "总览", index: "壹" },
  { id: "background", href: "./background.html", label: "背景", index: "贰" },
  { id: "forces", href: "./forces.html", label: "四路", index: "叁" },
  { id: "timeline", href: "./timeline.html", label: "年表", index: "肆" },
  { id: "routes", href: "./routes.html", label: "路线", index: "伍" },
  { id: "meetings", href: "./meetings.html", label: "会议", index: "陆" },
  { id: "battles", href: "./battles.html", label: "战役", index: "柒" },
  { id: "people", href: "./people.html", label: "人物", index: "捌" },
  { id: "march", href: "./march.html", label: "行军", index: "玖" },
  { id: "sources", href: "./sources.html", label: "口径", index: "拾" },
] as const;

export type PageId = (typeof PAGES)[number]["id"];

export function armyLabel(id: string): string {
  return ARMY_LABEL[id] ?? id;
}

export function typeLabel(id: string): string {
  return TYPE_LABEL[id] ?? id;
}

export function yearOf(date: string): string {
  const m = date.match(/\d{4}/);
  return m ? m[0] : "";
}

export function extractH2(md: string, titlePart: string): string {
  const lines = md.split("\n");
  let start = -1;
  let end = lines.length;
  for (let i = 0; i < lines.length; i += 1) {
    if (lines[i].startsWith("## ") && lines[i].includes(titlePart)) {
      start = i + 1;
      continue;
    }
    if (start >= 0 && lines[i].startsWith("## ")) {
      end = i;
      break;
    }
  }
  if (start < 0) return "";
  return lines.slice(start, end).join("\n").trim();
}

export interface SearchDoc {
  id: string;
  kind: string;
  title: string;
  text: string;
  href: string;
}

function joinText(parts: Array<string | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export function searchDocs(): SearchDoc[] {
  const docs: SearchDoc[] = [];
  for (const item of timeline) {
    docs.push({
      id: item.id,
      kind: "年表",
      title: item.title,
      text: joinText([
        item.date_label,
        item.place,
        item.summary,
        item.army.map(armyLabel).join(" "),
        typeLabel(item.type),
        item.sources.join(" "),
      ]),
      href: `./timeline.html?event=${item.id}`,
    });
  }
  for (const item of armies.items) {
    const extra = item as { later_name?: string; notes?: string; mileage?: unknown };
    docs.push({
      id: item.id,
      kind: "部队",
      title: item.name,
      text: joinText([extra.later_name, extra.notes, item.name, JSON.stringify(extra.mileage ?? "")]),
      href: `./forces.html#${item.id}`,
    });
  }
  for (const item of meetings) {
    docs.push({
      id: item.id,
      kind: "会议",
      title: item.name,
      text: joinText([item.date, item.place, item.series, item.decision, item.historical_evaluation]),
      href: `./meetings.html#${item.id}`,
    });
  }
  for (const item of battles) {
    docs.push({
      id: item.id,
      kind: "战役",
      title: item.name,
      text: joinText([item.date, item.place, item.summary, item.significance, item.note, item.caution]),
      href: `./battles.html#${item.id}`,
    });
  }
  for (const item of people) {
    docs.push({
      id: item.id,
      kind: "人物",
      title: item.name,
      text: joinText([item.role, item.note]),
      href: `./people.html#${item.id}`,
    });
  }
  for (const item of nodes) {
    docs.push({
      id: item.id,
      kind: "示意节点",
      title: item.name,
      text: joinText([item.modern, item.role, item.date, armyLabel(item.army)]),
      href: `./routes.html?node=${item.id}`,
    });
  }
  for (const item of facts) {
    docs.push({
      id: item.id,
      kind: "口径",
      title: item.topic,
      text: joinText([item.canonical, ...(item.variants ?? []), item.do_not, item.note, item.unit]),
      href: `./sources.html#${item.id}`,
    });
  }
  for (const item of sources) {
    docs.push({
      id: item.id,
      kind: "来源",
      title: item.title,
      text: joinText([
        item.publisher,
        item.original_publication,
        item.authors.join(" "),
        item.pub_date,
        item.access_note,
      ]),
      href: `./sources.html#${item.id}`,
    });
  }
  return docs;
}
