import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (name) => JSON.parse(readFileSync(join(root, "content/data", name), "utf8"));

const sources = read("sources.json");
const timeline = read("timeline.json");
const armies = read("armies.json");
const meetings = read("meetings.json");
const battles = read("battles.json");
const people = read("people.json");
const nodes = read("route-nodes.json");
const facts = read("key-facts.json");

const errors = [];
const ids = new Set(sources.items.map((item) => item.id));
const core = sources.items.filter((item) => !item.supplementary);
const extra = sources.items.filter((item) => item.supplementary);
if (core.length !== 22) errors.push(`核心来源应为 22 条，实际 ${core.length}`);
if (extra.length !== 2) errors.push(`补充来源应为 2 条，实际 ${extra.length}`);
if (timeline.items.length !== 37) errors.push(`年表应为 37 条，实际 ${timeline.items.length}`);
if (!nodes.disclaimer.includes("精确")) errors.push("路线免责声明缺失");

function expectSources(label, list) {
  if (!Array.isArray(list)) {
    errors.push(`${label} 的 sources 不是数组`);
    return;
  }
  for (const id of list) {
    if (!ids.has(id)) errors.push(`${label} 引用了不存在的来源 ${id}`);
  }
}

function walk(value, label) {
  if (!value || typeof value !== "object") return;
  if (Array.isArray(value)) {
    value.forEach((item, index) => walk(item, `${label}[${index}]`));
    return;
  }
  if (Array.isArray(value.sources)) expectSources(label, value.sources);
  for (const [key, child] of Object.entries(value)) {
    if (key === "sources") continue;
    if (child && typeof child === "object") walk(child, `${label}.${key}`);
  }
}

for (const item of timeline.items) {
  if (!item.sources?.length) errors.push(`${item.id} 没有来源`);
  if (item.sources?.some((id) => !ids.has(id))) errors.push(`${item.id} 来源无法解析`);
}
walk(armies, "armies");
walk(meetings, "meetings");
walk(battles, "battles");
walk(people, "people");
walk(nodes, "nodes");
walk(facts, "facts");

for (const item of sources.items) {
  if (!item.institution && !item.publisher) errors.push(`${item.id} 缺少机构`);
  if (!item.title) errors.push(`${item.id} 缺少标题`);
  if (!/^https:\/\//.test(item.url)) errors.push(`${item.id} 不是 https 链接`);
  const check = String(item.http_check_2026_11_18 ?? "");
  if (check !== "200" && !check.includes("handshake") && !String(item.access_note).includes("非404")) {
    errors.push(`${item.id} 未标明握手失败不是 404`);
  }
}

const titles = new Map();
for (const item of timeline.items) {
  if (titles.has(item.title)) errors.push(`年表标题重复：${item.title}`);
  titles.set(item.title, item.id);
}
const ruijin = timeline.items.find((item) => item.id === "T03");
const yudu = timeline.items.find((item) => item.id === "T04");
if (!ruijin?.do_not_confuse_with?.includes("T04") || !yudu?.do_not_confuse_with?.includes("T03")) {
  errors.push("瑞金与于都必须互相标注不可混同");
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`内容检查通过：来源 ${sources.items.length}，年表 ${timeline.items.length}，节点 ${nodes.items.length}。`);
