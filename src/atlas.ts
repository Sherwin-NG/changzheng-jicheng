import chishuiFc from "../content/geo/chishui.json";
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
const rivers = [
  ...(riversFc as { features: Feature[] }).features,
  ...(chishuiFc as { features: Feature[] }).features,
];
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
  jiaopingdu: "皎平渡口",
  sangzhi: "桑植·红二",
  ganzi: "甘孜",
  luoshan: "罗山·红二十五军",
  yanchuan: "延川·红二十五军",
};

const LEVEL_LABEL: Record<string, string> = {
  heritage_site: "遗址",
  town: "镇",
  county_seat: "县城驻地",
  county_or_city_seat: "市县驻地",
  city_seat: "城市驻地",
  mountain: "山体大致位置",
  ferry_site: "渡口遗址",
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
  army?: string;
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
  /** 只画这些点。不设则画出窗口内全部已核验点。 */
  only?: string[];
  segments: Segment[];
  ranges: RangeBox[];
  bands?: RangeBox[];
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
    labels: ["jiangtaibao", "huining", "wuqi", "hadapu", "ruijin", "yudu-site", "quanzhou", "zunyi-site", "maotai", "jiaopingdu", "luding-bridge", "jiajin", "zoige", "luoshan", "yanchuan", "ganzi", "sangzhi"],
    segments: closeSegments,
    ranges: [],
    bands: [
      { name: "红二十五军北上一带，不是行军线", army: "25th-army", west: 109.7, south: 31.7, east: 115.1, north: 37.3 },
      { name: "红四方面军已知点一带，不是行军线", army: "fourth-front-army", west: 99.5, south: 30.6, east: 105.6, north: 36.1 },
    ],
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
    only: ["daoxian", "xingan", "quanzhou"],
    segments: [],
    ranges: [{ name: "战役地段，不是进军折线", west: 110.35, south: 25.25, east: 111.95, north: 26.15 }],
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
    only: ["zunyi-site", "maotai", "xishui", "chishui-city"],
    segments: [],
    ranges: [{ name: "渡河范围，不标桥", west: 105.45, south: 27.55, east: 106.7, north: 28.85 }],
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
    only: ["jiaopingdu", "yihai", "anshunchang", "luding-bridge", "jiajin"],
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
    only: ["jiajin", "baoxing", "xiaojin", "zoige", "diebu"],
    segments: [
      { army: "central-red-army", a: "jiajin", b: "xiaojin" },
      { army: "central-red-army", a: "zoige", b: "diebu" },
    ],
    ranges: [{ name: "草地示意范围", west: 102.15, south: 32.9, east: 103.9, north: 34.35 }],
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
    labels: ["jiangtaibao", "huining", "wuqi", "hadapu", "xiji"],
    only: ["jiangtaibao", "huining", "wuqi", "hadapu", "xiji"],
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
  const geoW = maxX - minX;
  const geoH = maxY - minY;
  const scale = Math.min(innerW / geoW, innerH / geoH);
  const ox = pad.l + (innerW - geoW * scale) / 2;
  const oy = pad.t + (innerH - geoH * scale) / 2;
  const sx = (lon: number, lat: number) => {
    const [x, y] = projectAlbers(lon, lat);
    return [ox + (x - minX) * scale, oy + (maxY - y) * scale];
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
      const name = String(feature.properties.name ?? "");
      const rank = Number(feature.properties.scalerank ?? 7);
      const width = name === "赤水河" ? 6 : rank <= 3 ? 7 : 4.5;
      return ringsOf(feature.geometry)
        .map((ring) => `<path data-river="${esc(String(feature.properties.name))}" d="${pathOf(ring)}" stroke-width="${width}" />`)
        .join("");
    })
    .join("");

  const bandLabels: string[] = [];
  const bandPaths = (frame.bands ?? [])
    .map((range) => {
      const ring: LngLat[] = [
        [range.west, range.south],
        [range.east, range.south],
        [range.east, range.north],
        [range.west, range.north],
        [range.west, range.south],
      ];
      const lane = range.army ? ` data-lane="${esc(range.army)}"` : "";
      const [lx, ly] = sx((range.west + range.east) / 2, (range.south + range.north) / 2);
      bandLabels.push(
        `<text${lane} x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" font-size="18" fill="#1c2420">${esc(range.name)}</text>`,
      );
      return `<path${lane} d="${pathOf(ring)} Z" />`;
    })
    .join("");

  const rangeLabels: string[] = [];
  const rangePaths = frame.ranges
    .map((range) => {
      const ring: LngLat[] = [
        [range.west, range.south],
        [range.east, range.south],
        [range.east, range.north],
        [range.west, range.north],
        [range.west, range.south],
      ];
      const [lx, ly] = sx((range.west + range.east) / 2, range.north - (range.north - range.south) * 0.12);
      rangeLabels.push(`<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="middle" font-size="18" fill="#1c2420">${esc(range.name)}</text>`);
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
    const width = text.length * size * 0.95;
    const height = size * 1.2;
    const options = [
      { x: x + 8, y: y - 8 },
      { x: x + 10, y: y + size },
      { x: x - width - 8, y: y + 4 },
      { x: x - width / 2, y: y + size + 14 },
      { x: x - width / 2, y: y - size - 6 },
    ];
    for (const spot of options) {
      const box = { x: spot.x, y: spot.y - size, w: width, h: height };
      if (box.x < 8 || box.y < 8 || box.x + box.w > frame.width - 8 || box.y + box.h > frame.height - 36) continue;
      if (taken.some((item) => boxesHit(item, box))) continue;
      taken.push(box);
      const style = italic ? ` font-style="italic"` : "";
      return `<text x="${spot.x.toFixed(1)}" y="${spot.y.toFixed(1)}" font-size="${size}" fill="${fill}"${style}>${esc(text)}</text>`;
    }
    return "";
  };

  const visiblePlaces = places.filter((place) => {
    if (frame.only && !frame.only.includes(place.id)) return false;
    return place.lon >= frame.west && place.lon <= frame.east && place.lat >= frame.south && place.lat <= frame.north;
  });
  const labelSet = new Set(frame.labels);
  const labelOrder = new Map(frame.labels.map((id, index) => [id, index]));
  const ordered = [...visiblePlaces].sort((a, b) => {
    const ai = labelOrder.has(a.id) ? labelOrder.get(a.id)! : 1000;
    const bi = labelOrder.has(b.id) ? labelOrder.get(b.id)! : 1000;
    return ai - bi;
  });
  let dropped = 0;
  const symbols: string[] = [];
  for (const place of ordered) {
    const [x, y] = sx(place.lon, place.lat);
    const armies = place.armies.length ? place.armies : ["central-red-army"];
    const gap = frame.symbol * 2.8;
    const half = ((armies.length - 1) * gap) / 2 + frame.symbol + 6;
    taken.push({ x: x - half, y: y - frame.symbol - 8, w: half * 2, h: frame.symbol * 2 + 16 });
    const wantLabel = labelSet.has(place.id);
    const short = SHORT_LABEL[place.id] ?? place.name.split("（")[0];
    const labelMarkup = wantLabel ? textLabel(short, x, y - half - 6, 18, "#1c2420") : "";
    if (wantLabel && !labelMarkup) dropped += 1;
    const nodeId = placeNode.get(place.id) ?? "";
    const lanes = armies.join(" ");
    const label = `${place.name}，${levelLabel(place.geometry_level)}，示意图上的近似位置`;
    const body = armies
      .map((army, index) => {
        const style = ARMY_STYLE[army] ?? ARMY_STYLE["central-red-army"];
        const dx = (index - (armies.length - 1) / 2) * gap;
        return `<g transform="translate(${dx.toFixed(1)} 0)">${shapeMarkup(style.shape, style.color, frame.symbol)}</g>`;
      })
      .join("");
    const nameText = labelMarkup.replace(/x="([\d.-]+)" y="([\d.-]+)"/, (_m, tx: string, ty: string) => {
      return `x="${(Number(tx) - x).toFixed(1)}" y="${(Number(ty) - y).toFixed(1)}"`;
    });
    const groupClass = frame.interactive ? "node-pin" : "mark";
    const interactiveAttrs = frame.interactive
      ? ` data-node="${esc(nodeId)}" data-place="${esc(place.id)}" data-lanes="${esc(lanes)}" tabindex="0" role="button" aria-pressed="false" aria-label="${esc(label)}"`
      : ` aria-hidden="true"`;
    symbols.push(
      `<g class="${groupClass}" transform="translate(${x.toFixed(1)} ${y.toFixed(1)})"${interactiveAttrs}>${body}${nameText}</g>`,
    );
  }

  const insidePoints = new Map<string, LngLat[]>();
  for (const feature of rivers) {
    const name = String(feature.properties.name ?? "");
    if (!name) continue;
    for (const ring of ringsOf(feature.geometry)) {
      for (const point of ring) {
        if (point[0] < frame.west || point[0] > frame.east || point[1] < frame.south || point[1] > frame.north) continue;
        const list = insidePoints.get(name) ?? [];
        list.push(point);
        insidePoints.set(name, list);
      }
    }
  }
  for (const [name, points] of insidePoints) {
    const mid = points[Math.floor(points.length / 2)];
    const [x, y] = sx(mid[0], mid[1]);
    const markup = textLabel(name, x, y, name === "赤水河" || name === "湘江" || name === "金沙江" ? 24 : 20, "#1a4d5c", true);
    if (markup) labels.push(markup);
  }

  if (frame.showProvinces) {
    const seenProvince = new Set<string>();
    for (const feature of provinces) {
      const name = String(feature.properties.name ?? "");
      if (!name || seenProvince.has(name)) continue;
      const rawLon = Number(feature.properties.label_lon);
      const rawLat = Number(feature.properties.label_lat);
      let lon = rawLon;
      let lat = rawLat;
      const inside = lon >= frame.west && lon <= frame.east && lat >= frame.south && lat <= frame.north;
      if (!inside) {
        const pts = ringsOf(feature.geometry)
          .flat()
          .filter((point) => point[0] >= frame.west && point[0] <= frame.east && point[1] >= frame.south && point[1] <= frame.north);
        if (!pts.length) continue;
        lon = pts.reduce((sum, point) => sum + point[0], 0) / pts.length;
        lat = pts.reduce((sum, point) => sum + point[1], 0) / pts.length;
      }
      seenProvince.add(name);
      const [x, y] = sx(lon, lat);
      const short = name.replace("壮族自治区", "").replace("回族自治区", "").replace("维吾尔自治区", "").replace("自治区", "").replace("省", "").replace("市", "");
      const markup = textLabel(`今${short}`, x, y, 18, "#4d5c55");
      if (markup) labels.push(markup);
    }
  }

  const centerLat = (frame.south + frame.north) / 2;
  const centerLon = (frame.west + frame.east) / 2;
  const barPixels = (km: number) => {
    const dLon = km / (111.32 * Math.cos(centerLat * RAD));
    const [x0, y0] = sx(centerLon, centerLat);
    const [x1, y1] = sx(centerLon + dLon, centerLat);
    const dLat = km / 111.32;
    const [nx, ny] = sx(centerLon, centerLat + dLat);
    return { ew: Math.hypot(x1 - x0, y1 - y0), ns: Math.hypot(nx - x0, ny - y0) };
  };
  let nice = 50;
  let bar = barPixels(50).ew;
  for (const km of [20, 50, 100, 200, 400]) {
    const px = barPixels(km).ew;
    if (px >= 64 && px <= frame.width * 0.42 && 24 + px <= frame.width - 18) {
      nice = km;
      bar = px;
    }
  }
  const nsBar = barPixels(nice).ns;
  const scaleX = 22;
  const scaleY = frame.height - 28;
  if (scaleX + bar > frame.width - 12) {
    throw new Error(`${frame.id} 比例尺超出图框`);
  }

  const table = visiblePlaces
    .map(
      (place) =>
        `<tr><td>${esc(place.name)}</td><td>${esc(levelLabel(place.geometry_level))}</td><td>${place.lat.toFixed(2)}°N</td><td>${place.lon.toFixed(2)}°E</td><td>${esc(place.armies.map((id) => ARMY_LABEL[id] ?? id).join("、"))}</td></tr>`,
    )
    .join("");

  const svg = `<svg class="geo-map" viewBox="0 0 ${frame.width} ${frame.height}" role="img" aria-labelledby="${frame.id}-title ${frame.id}-desc" data-dropped-labels="${dropped}" data-scale-km="${nice}" data-ew-px="${bar.toFixed(2)}" data-ns-px="${nsBar.toFixed(2)}">
    <title id="${frame.id}-title">${esc(frame.title)}</title>
    <desc id="${frame.id}-desc">示意图，非精确行军轨迹。地点是可核验的近似坐标，虚线只连接相距较近的已知点。</desc>
    <rect width="${frame.width}" height="${frame.height}" fill="#e7eee6" />
    <g class="land" fill="#d5ddd4">${landPaths}</g>
    <g class="provinces" fill="none" stroke="#5e6b64" stroke-width="1.6" stroke-dasharray="5 4">${provincePaths}</g>
    <g class="rivers" fill="none" stroke="#1a4d5c" stroke-linecap="round" stroke-linejoin="round">${riverPaths}</g>
    <g class="bands" fill="rgba(28,36,32,0.05)" stroke="#3d4a44" stroke-width="1.5" stroke-dasharray="4 4">${bandPaths}</g>
    <g class="ranges" fill="rgba(142,51,40,0.08)" stroke="#8e3328" stroke-width="2" stroke-dasharray="8 6">${rangePaths}</g>
    <g class="lanes" fill="none" stroke-width="5" stroke-linecap="round">${routePaths}</g>
    <g class="symbols">${symbols.join("")}</g>
    <g class="map-labels" font-family="Noto Sans SC, sans-serif" stroke="#ffffff" stroke-width="5" paint-order="stroke" stroke-linejoin="round">${labels.join("")}${bandLabels.join("")}${rangeLabels.join("")}</g>
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

  const tableHtml = `<details class="tech"><summary>坐标表。读图可以先不展开。</summary><div class="table-wrap"><table class="map-table">
    <caption>点的层级和来源。这是核对用的表，不是行军测量记录。</caption>
    <thead><tr><th>地点</th><th>几何级别</th><th>纬度</th><th>经度</th><th>相关部队</th></tr></thead>
    <tbody>${table}</tbody>
  </table></div></details>`;

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
    <li><span class="swatch swatch-river"></span>蓝色线是 Natural Earth 1:1000万概化河网。赤水河来自 OpenStreetMap 的具名河道。都只用来认方位，不是战场测量线</li>
    <li><span class="swatch swatch-admin"></span>灰色虚线是今省级行政区，图内省名带「今」。不是1935年省界。西康未画</li>
    <li>浅色范围是示意地带，不是行军线，也不是测绘边界</li>
  </ul>`;
}
