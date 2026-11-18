import landFc from "../content/geo/land.json";
import placesFc from "../content/geo/places.json";
import provincesFc from "../content/geo/provinces.json";
import riversFc from "../content/geo/rivers.json";
import { ARMY_LABEL } from "./content";
import { esc } from "./format";

type LngLat = [number, number];
type Feature = {
  type: "Feature";
  properties: Record<string, unknown>;
  geometry: { type: string; coordinates: unknown };
};

const land = (landFc as { features: Feature[] }).features;
const rivers = (riversFc as { features: Feature[] }).features;
const provinces = (provincesFc as { features: Feature[] }).features;

export interface Place {
  id: string;
  name: string;
  armies: string[];
  geometry_level: string;
  wikidata: string;
  note: string;
  lon: number;
  lat: number;
}

export const places: Place[] = (placesFc as { features: Feature[] }).features.map((feature) => {
  const [lon, lat] = feature.geometry.coordinates as LngLat;
  const p = feature.properties;
  return {
    id: String(p.id),
    name: String(p.name),
    armies: (p.armies as string[]) ?? [],
    geometry_level: String(p.geometry_level),
    wikidata: String(p.wikidata),
    note: String(p.note ?? ""),
    lon,
    lat,
  };
});

export const placeById = new Map(places.map((place) => [place.id, place]));

/** 路线名单上的节点，对应到已核验坐标。一对多表示只有县城或区域，没有渡口点。 */
export const nodePlaces: Record<string, string[]> = {
  N01: ["ruijin"],
  N02: ["yudu-site"],
  N03: ["daoxian", "xingan", "quanzhou"],
  N04: ["tongdao"],
  N05: ["liping"],
  N06: ["wengan"],
  N07: ["zunyi-site"],
  N08: ["maotai", "xishui", "chishui-city"],
  N11: ["jiaopingdu"],
  N13: ["yihai"],
  N14: ["anshunchang"],
  N15: ["luding-bridge"],
  N16: ["jiajin"],
  N17: ["xiaojin"],
  N19: ["zoige"],
  N20: ["diebu"],
  N22: ["hadapu"],
  N25: ["wuqi"],
  N27: ["luoshan"],
  N29: ["yanchuan"],
  N31: ["ganzi"],
  N32: ["sangzhi"],
  N34: ["huining"],
  N35: ["jiangtaibao"],
};

const placeNode = new Map<string, string>();
for (const [nodeId, ids] of Object.entries(nodePlaces)) {
  for (const id of ids) placeNode.set(id, nodeId);
}

const ARMY_STYLE: Record<string, { color: string; shape: "square" | "circle" | "diamond" | "triangle"; dash: string }> = {
  "central-red-army": { color: "#8e3328", shape: "square", dash: "10 8" },
  "25th-army": { color: "#8a5a22", shape: "circle", dash: "3 7" },
  "fourth-front-army": { color: "#1d4e89", shape: "diamond", dash: "16 6 3 6" },
  "second-front-army": { color: "#2c6848", shape: "triangle", dash: "2 8" },
};

const SHORT_LABEL: Record<string, string> = {
  "yudu-site": "于都",
  "zunyi-site": "遵义",
  "luding-bridge": "泸定桥",
  wengan: "瓮安",
  xiaojin: "小金",
  "chishui-city": "赤水",
  jiangtaibao: "将台堡",
  "anshunchang": "安顺场",
  jiaopingdu: "皎平渡",
};

const LEVEL_LABEL: Record<string, string> = {
  heritage_site: "遗址",
  town: "镇",
  county_seat: "县城驻地",
  county_or_city_seat: "市县驻地",
  city_seat: "城市驻地",
  mountain: "山体大致位置",
};

export function levelLabel(level: string): string {
  return LEVEL_LABEL[level] ?? level;
}

interface Segment {
  army: string;
  a: string;
  b: string;
}

interface RangeBox {
  name: string;
  west: number;
  south: number;
  east: number;
  north: number;
}

export interface Frame {
  id: string;
  title: string;
  west: number;
  south: number;
  east: number;
  north: number;
  width: number;
  height: number;
  symbol: number;
  interactive: boolean;
  labels: string[];
  segments: Segment[];
  ranges: RangeBox[];
  showProvinces: boolean;
}

const closeSegments: Segment[] = [
  ["ruijin", "yudu-site"],
  ["daoxian", "xingan"],
  ["xingan", "quanzhou"],
  ["quanzhou", "tongdao"],
  ["tongdao", "liping"],
  ["liping", "wengan"],
  ["wengan", "zunyi-site"],
  ["zunyi-site", "maotai"],
  ["yihai", "anshunchang"],
  ["anshunchang", "luding-bridge"],
  ["luding-bridge", "jiajin"],
  ["jiajin", "xiaojin"],
  ["zoige", "diebu"],
  ["diebu", "hadapu"],
].map(([a, b]) => ({ army: "central-red-army", a, b }));

export const frames: Record<string, Frame> = {
  overview: {
    id: "overview",
    title: "四路已知地点",
    west: 98.2,
    south: 23.6,
    east: 117.8,
    north: 38.2,
    width: 1000,
    height: 720,
    symbol: 8,
    interactive: true,
    labels: ["ruijin", "yudu-site", "quanzhou", "zunyi-site", "maotai", "jiaopingdu", "luding-bridge", "jiajin", "zoige", "hadapu", "wuqi", "huining", "jiangtaibao", "luoshan", "yanchuan", "ganzi", "sangzhi"],
    segments: closeSegments,
    ranges: [],
    showProvinces: true,
  },
  xiang: {
    id: "xiang",
    title: "湘江一带",
    west: 109.8,
    south: 24.8,
    east: 112.6,
    north: 26.6,
    width: 820,
    height: 560,
    symbol: 16,
    interactive: false,
    labels: ["daoxian", "xingan", "quanzhou"],
    segments: [
      { army: "central-red-army", a: "daoxian", b: "xingan" },
      { army: "central-red-army", a: "xingan", b: "quanzhou" },
    ],
    ranges: [{ name: "战役地段在三个县城之间，没有渡口坐标", west: 110.35, south: 25.25, east: 111.95, north: 26.15 }],
    showProvinces: true,
  },
  chishui: {
    id: "chishui",
    title: "赤水河一带",
    west: 105.15,
    south: 27.25,
    east: 107.4,
    north: 29.05,
    width: 760,
    height: 620,
    symbol: 16,
    interactive: false,
    labels: ["zunyi-site", "maotai", "xishui", "chishui-city"],
    segments: [],
    ranges: [{ name: "四次渡河的大致地带，不标桥点", west: 105.45, south: 27.55, east: 106.7, north: 28.85 }],
    showProvinces: true,
  },
  jinsha: {
    id: "jinsha",
    title: "金沙江与大渡河",
    west: 101.55,
    south: 25.7,
    east: 103.15,
    north: 30.75,
    width: 640,
    height: 860,
    symbol: 16,
    interactive: false,
    labels: ["jiaopingdu", "yihai", "anshunchang", "luding-bridge", "jiajin"],
    segments: [
      { army: "central-red-army", a: "yihai", b: "anshunchang" },
      { army: "central-red-army", a: "anshunchang", b: "luding-bridge" },
      { army: "central-red-army", a: "luding-bridge", b: "jiajin" },
    ],
    ranges: [],
    showProvinces: true,
  },
  snow: {
    id: "snow",
    title: "雪山与草地",
    west: 101.4,
    south: 29.7,
    east: 104.3,
    north: 34.55,
    width: 700,
    height: 780,
    symbol: 16,
    interactive: false,
    labels: ["jiajin", "baoxing", "xiaojin", "zoige", "diebu"],
    segments: [
      { army: "central-red-army", a: "jiajin", b: "xiaojin" },
      { army: "central-red-army", a: "zoige", b: "diebu" },
    ],
    ranges: [{ name: "草地是这一带的湿地，不是一条行军线", west: 102.15, south: 32.95, east: 103.85, north: 34.15 }],
    showProvinces: true,
  },
  endings: {
    id: "endings",
    title: "吴起、会宁、将台堡",
    west: 103.5,
    south: 33.7,
    east: 109.1,
    north: 37.5,
    width: 860,
    height: 600,
    symbol: 16,
    interactive: false,
    labels: ["hadapu", "wuqi", "huining", "jiangtaibao", "xiji"],
    segments: [],
    ranges: [],
    showProvinces: true,
  },
};

const RAD = Math.PI / 180;

function projectAlbers(lon: number, lat: number): [number, number] {
  const phi1 = 25 * RAD;
  const phi2 = 40 * RAD;
  const lat0 = 32 * RAD;
  const lon0 = 105;
  const n = 0.5 * (Math.sin(phi1) + Math.sin(phi2));
  const c = Math.cos(phi1) ** 2 + 2 * n * Math.sin(phi1);
  const rho0 = Math.sqrt(c - 2 * n * Math.sin(lat0)) / n;
  const rho = Math.sqrt(c - 2 * n * Math.sin(lat * RAD)) / n;
  const theta = n * (lon - lon0) * RAD;
  return [rho * Math.sin(theta) * 6371, (rho0 - rho * Math.cos(theta)) * 6371];
}

function ringsOf(geometry: Feature["geometry"]): LngLat[][] {
  if (geometry.type === "Polygon") return geometry.coordinates as LngLat[][];
  if (geometry.type === "LineString") return [geometry.coordinates as LngLat[]];
  return [];
}

function featureBBox(feature: Feature): [number, number, number, number] | null {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const ring of ringsOf(feature.geometry)) {
    for (const [x, y] of ring) {
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }
  if (!Number.isFinite(minX)) return null;
  return [minX, minY, maxX, maxY];
}

function overlaps(a: [number, number, number, number], b: [number, number, number, number]): boolean {
  return !(a[2] < b[0] || a[0] > b[2] || a[3] < b[1] || a[1] > b[3]);
}

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

function boxesHit(a: Box, b: Box): boolean {
  return !(a.x + a.w < b.x || b.x + b.w < a.x || a.y + a.h < b.y || b.y + b.h < a.y);
}

function shapeMarkup(shape: string, color: string, r: number): string {
  const stroke = `stroke="#ffffff" stroke-width="${Math.max(2, r * 0.28)}"`;
  if (shape === "square") return `<rect class="mark-shape" x="${-r}" y="${-r}" width="${r * 2}" height="${r * 2}" fill="${color}" ${stroke} />`;
  if (shape === "circle") return `<circle class="mark-shape" r="${r}" fill="${color}" ${stroke} />`;
  if (shape === "diamond") return `<polygon class="mark-shape" points="0,${-r * 1.15} ${r},0 0,${r * 1.15} ${-r},0" fill="${color}" ${stroke} />`;
  return `<polygon class="mark-shape" points="0,${-r * 1.15} ${r},${r * 0.85} ${-r},${r * 0.85}" fill="${color}" ${stroke} />`;
}

export function renderMap(frame: Frame): { svg: string; table: string; dropped: number } {
  const pad = { t: 18, r: 18, b: 46, l: 18 };
  const innerW = frame.width - pad.l - pad.r;
  const innerH = frame.height - pad.t - pad.b;
  const corners: LngLat[] = [
    [frame.west, frame.south],
    [frame.east, frame.south],
    [frame.west, frame.north],
    [frame.east, frame.north],
  ];
  const projected = corners.map(([lon, lat]) => projectAlbers(lon, lat));
  const minX = Math.min(...projected.map((p) => p[0]));
  const maxX = Math.max(...projected.map((p) => p[0]));
  const minY = Math.min(...projected.map((p) => p[1]));
  const maxY = Math.max(...projected.map((p) => p[1]));
  const sx = (lon: number, lat: number) => {
    const [x, y] = projectAlbers(lon, lat);
    return [pad.l + ((x - minX) / (maxX - minX)) * innerW, pad.t + ((maxY - y) / (maxY - minY)) * innerH];
  };
  const windowBox: [number, number, number, number] = [frame.west, frame.south, frame.east, frame.north];
  const pathOf = (coords: LngLat[]) =>
    coords
      .map(([lon, lat], index) => {
        const [x, y] = sx(lon, lat);
        return `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(" ");

  const landPaths = land
    .filter((feature) => {
      const box = featureBBox(feature);
      return box ? overlaps(box, windowBox) : false;
    })
    .map((feature) => ringsOf(feature.geometry).map((ring) => `<path d="${pathOf(ring)} Z" />`).join(""))
    .join("");

  const provincePaths = frame.showProvinces
    ? provinces
        .filter((feature) => {
          const box = featureBBox(feature);
          return box ? overlaps(box, windowBox) : false;
        })
        .map((feature) => ringsOf(feature.geometry).map((ring) => `<path d="${pathOf(ring)}" />`).join(""))
        .join("")
    : "";

  const riverPaths = rivers
    .filter((feature) => {
      const box = featureBBox(feature);
      return box ? overlaps(box, windowBox) : false;
    })
    .map((feature) => {
      const rank = Number(feature.properties.scalerank ?? 7);
      const width = rank <= 3 ? 7 : 4.5;
      return ringsOf(feature.geometry)
        .map((ring) => `<path data-river="${esc(String(feature.properties.name))}" d="${pathOf(ring)}" stroke-width="${width}" />`)
        .join("");
    })
    .join("");

  const rangePaths = frame.ranges
    .map((range) => {
      const ring: LngLat[] = [
        [range.west, range.south],
        [range.east, range.south],
        [range.east, range.north],
        [range.west, range.north],
        [range.west, range.south],
      ];
      return `<path d="${pathOf(ring)} Z" />`;
    })
    .join("");

  const routePaths = frame.segments
    .map((segment) => {
      const from = placeById.get(segment.a);
      const to = placeById.get(segment.b);
      const style = ARMY_STYLE[segment.army];
      if (!from || !to || !style) return "";
      const laneAttr = frame.interactive ? "data-lane" : "data-route";
      return `<path ${laneAttr}="${esc(segment.army)}" d="${pathOf([[from.lon, from.lat], [to.lon, to.lat]])}" stroke="${style.color}" stroke-dasharray="${style.dash}" />`;
    })
    .join("");

  const taken: Box[] = [
    { x: frame.width - 78, y: 8, w: 70, h: 78 },
    { x: 8, y: frame.height - 78, w: 180, h: 70 },
  ];
  const labels: string[] = [];
  const textLabel = (text: string, x: number, y: number, size: number, fill: string, italic = false) => {
    const width = text.length * size;
    const height = size * 1.15;
    const options = [
      { x: x + 14, y: y + 4 },
      { x: x - width - 14, y: y + 4 },
      { x: x - width / 2, y: y - 16 },
      { x: x - width / 2, y: y + size + 10 },
    ];
    for (const spot of options) {
      const box = { x: spot.x, y: spot.y - size, w: width, h: height };
      if (box.x < 6 || box.y < 6 || box.x + box.w > frame.width - 6 || box.y + box.h > frame.height - 40) continue;
      if (taken.some((item) => boxesHit(item, box))) continue;
      taken.push(box);
      const style = italic ? ` font-style="italic"` : "";
      labels.push(
        `<text x="${spot.x.toFixed(1)}" y="${spot.y.toFixed(1)}" font-size="${size}" fill="${fill}"${style}>${esc(text)}</text>`,
      );
      return true;
    }
    return false;
  };

  const visiblePlaces = places.filter(
    (place) => place.lon >= frame.west && place.lon <= frame.east && place.lat >= frame.south && place.lat <= frame.north,
  );
  const labelSet = new Set(frame.labels);
  const ordered = [...visiblePlaces].sort((a, b) => Number(labelSet.has(b.id)) - Number(labelSet.has(a.id)));
  let dropped = 0;
  const symbols: string[] = [];
  for (const place of ordered) {
    const [x, y] = sx(place.lon, place.lat);
    const armies = place.armies.length ? place.armies : ["central-red-army"];
    const wantLabel = labelSet.has(place.id);
    const short = SHORT_LABEL[place.id] ?? place.name.split("（")[0];
    if (wantLabel && !textLabel(short, x, y, 26, "#1c2420")) dropped += 1;
    const nodeId = placeNode.get(place.id) ?? "";
    const lanes = armies.join(" ");
    const label = `${place.name}，${levelLabel(place.geometry_level)}，示意图上的近似位置`;
    const body = armies
      .map((army, index) => {
        const style = ARMY_STYLE[army] ?? ARMY_STYLE["central-red-army"];
        const dx = (index - (armies.length - 1) / 2) * frame.symbol * 2.3;
        return `<g transform="translate(${dx.toFixed(1)} 0)">${shapeMarkup(style.shape, style.color, frame.symbol)}</g>`;
      })
      .join("");
    if (frame.interactive) {
      symbols.push(
        `<g class="node-pin" transform="translate(${x.toFixed(1)} ${y.toFixed(1)})" data-node="${esc(nodeId)}" data-place="${esc(place.id)}" data-lanes="${esc(lanes)}" tabindex="0" role="button" aria-pressed="false" aria-label="${esc(label)}">${body}</g>`,
      );
    } else {
      symbols.push(`<g class="mark" transform="translate(${x.toFixed(1)} ${y.toFixed(1)})" aria-hidden="true">${body}</g>`);
    }
  }

  const riverNamed = new Map<string, Feature>();
  for (const feature of rivers) {
    const name = String(feature.properties.name ?? "");
    const box = featureBBox(feature);
    if (!name || !box || !overlaps(box, windowBox)) continue;
    const coords = ringsOf(feature.geometry)[0] ?? [];
    const prev = riverNamed.get(name);
    const prevLen = prev ? ringsOf(prev.geometry)[0]?.length ?? 0 : 0;
    if (coords.length > prevLen) riverNamed.set(name, feature);
  }
  for (const [name, feature] of riverNamed) {
    const coords = ringsOf(feature.geometry)[0] ?? [];
    if (coords.length < 2) continue;
    const mid = coords[Math.floor(coords.length / 2)];
    if (mid[0] < frame.west || mid[0] > frame.east || mid[1] < frame.south || mid[1] > frame.north) continue;
    const [x, y] = sx(mid[0], mid[1]);
    textLabel(name, x, y, 22, "#1a4d5c", true);
  }

  if (frame.showProvinces) {
    const seenProvince = new Set<string>();
    for (const feature of provinces) {
      const lon = Number(feature.properties.label_lon);
      const lat = Number(feature.properties.label_lat);
      const name = String(feature.properties.name ?? "");
      if (!name || seenProvince.has(name) || lon < frame.west || lon > frame.east || lat < frame.south || lat > frame.north) continue;
      seenProvince.add(name);
      const [x, y] = sx(lon, lat);
      textLabel(name.replace("壮族自治区", "").replace("回族自治区", "").replace("维吾尔自治区", "").replace("自治区", ""), x, y, 20, "#4d5c55");
    }
  }

  const centerLat = (frame.south + frame.north) / 2;
  const centerLon = (frame.west + frame.east) / 2;
  const spanKm = ((frame.east - frame.west) * 111.32 * Math.cos(centerLat * RAD));
  const nice = [50, 100, 200, 400].find((km) => km / spanKm > 0.12 && km / spanKm < 0.28) ?? 200;
  const dLon = nice / (111.32 * Math.cos(centerLat * RAD));
  const [x0] = sx(centerLon, centerLat);
  const [x1] = sx(centerLon + dLon, centerLat);
  const bar = Math.abs(x1 - x0);
  const scaleX = 22;
  const scaleY = frame.height - 28;

  const table = visiblePlaces
    .map(
      (place) =>
        `<tr><td>${esc(place.name)}</td><td>${esc(levelLabel(place.geometry_level))}</td><td>${place.lat.toFixed(2)}°N</td><td>${place.lon.toFixed(2)}°E</td><td>${esc(place.armies.map((id) => ARMY_LABEL[id] ?? id).join("、"))}</td></tr>`,
    )
    .join("");

  const svg = `<svg class="geo-map" viewBox="0 0 ${frame.width} ${frame.height}" role="img" aria-labelledby="${frame.id}-title ${frame.id}-desc" data-dropped-labels="${dropped}">
    <title id="${frame.id}-title">${esc(frame.title)}</title>
    <desc id="${frame.id}-desc">示意图，非精确行军轨迹。地点是可核验的近似坐标，虚线只连接相距较近的已知点。</desc>
    <rect width="${frame.width}" height="${frame.height}" fill="#e7eee6" />
    <g class="land" fill="#d5ddd4">${landPaths}</g>
    <g class="provinces" fill="none" stroke="#5e6b64" stroke-width="1.6" stroke-dasharray="5 4">${provincePaths}</g>
    <g class="rivers" fill="none" stroke="#1a4d5c" stroke-linecap="round" stroke-linejoin="round">${riverPaths}</g>
    <g class="ranges" fill="rgba(142,51,40,0.08)" stroke="#8e3328" stroke-width="2" stroke-dasharray="8 6">${rangePaths}</g>
    <g class="lanes" fill="none" stroke-width="5" stroke-linecap="round">${routePaths}</g>
    <g class="symbols">${symbols.join("")}</g>
    <g class="map-labels" font-family="Noto Sans SC, sans-serif" stroke="#ffffff" stroke-width="5" paint-order="stroke" stroke-linejoin="round">${labels.join("")}</g>
    <g class="north" transform="translate(${frame.width - 46} 36)" aria-hidden="true">
      <polygon points="0,-16 7,12 -7,12" fill="#1c2420" />
      <text x="0" y="28" text-anchor="middle" font-size="18" font-family="Noto Sans SC, sans-serif" fill="#1c2420" stroke="#ffffff" stroke-width="4" paint-order="stroke">北</text>
    </g>
    <g class="scale" aria-hidden="true">
      <line x1="${scaleX}" y1="${scaleY}" x2="${(scaleX + bar).toFixed(1)}" y2="${scaleY}" stroke="#1c2420" stroke-width="3" />
      <line x1="${scaleX}" y1="${scaleY - 5}" x2="${scaleX}" y2="${scaleY + 5}" stroke="#1c2420" stroke-width="2" />
      <line x1="${(scaleX + bar).toFixed(1)}" y1="${scaleY - 5}" x2="${(scaleX + bar).toFixed(1)}" y2="${scaleY + 5}" stroke="#1c2420" stroke-width="2" />
      <text x="${scaleX}" y="${scaleY - 8}" font-size="16" font-family="Noto Sans SC, sans-serif" fill="#1c2420" stroke="#ffffff" stroke-width="4" paint-order="stroke">${nice}公里</text>
    </g>
    <text x="${frame.width / 2}" y="${frame.height - 12}" text-anchor="middle" font-size="16" font-family="Noto Sans SC, sans-serif" fill="#1c2420">示意图，非精确行军轨迹</text>
  </svg>`;

  const tableHtml = `<table class="map-table">
    <caption>这张图上的点。坐标来自 Wikidata，级别见几何说明，不是行军测量点。</caption>
    <thead><tr><th>地点</th><th>几何级别</th><th>纬度</th><th>经度</th><th>相关部队</th></tr></thead>
    <tbody>${table}</tbody>
  </table>`;

  return { svg, table: tableHtml, dropped };
}

export function legendHtml(): string {
  const items = Object.entries(ARMY_STYLE)
    .map(([id, style]) => {
      const word = { square: "方块", circle: "圆点", diamond: "菱形", triangle: "三角" }[style.shape];
      return `<li><span class="swatch swatch-${style.shape}" style="--army:${style.color}"></span>${esc(ARMY_LABEL[id] ?? id)}，${word}</li>`;
    })
    .join("");
  return `<ul class="legend">
    ${items}
    <li>一个地点和几路都有关时，几种形状并排。</li>
    <li><span class="swatch swatch-line"></span>虚线只连接相距较近的已知点，表示先后方向</li>
    <li><span class="swatch swatch-river"></span>蓝色线是 Natural Earth 10m 河网，用来认方位，不是战场测量线</li>
    <li><span class="swatch swatch-admin"></span>灰色虚线是今省级行政区，不是1935年省界</li>
  </ul>`;
}
