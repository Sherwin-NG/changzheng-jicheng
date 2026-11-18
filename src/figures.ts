import { esc } from "./format";

export interface MediaItem {
  id: string;
  file: string;
  width: number;
  height: number;
  place: string;
  title: string;
  alt: string;
  caption: string;
  artist: string;
  dateLabel: string;
  license: string;
  licenseUrl: string | null;
  filePage: string;
  derivative: string;
  small?: boolean;
}

const items: MediaItem[] = [
  {
    id: "img-yudu-ferry-2014",
    file: "img-yudu-ferry-2014.jpg",
    width: 1600,
    height: 1067,
    place: "于都",
    title: "于都南门渡口旧址标志碑",
    alt: "2014年于都南门渡口旧址的文物保护标志碑，背景是后来的楼房和健身器材。",
    caption: "2014年5月30日拍摄的于都南门渡口旧址文物保护标志碑。画面是石碑和后来的街道，不是渡口河面，也不是1934年的历史照片。",
    artist: "Zhangzhugang",
    dateLabel: "2014年5月30日",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
    filePage: "https://commons.wikimedia.org/wiki/File:Yudu_Zhongyang_Hongjun_Disan_Juntuan_Changzheng_Dukou_2014.05.30_12-02-00.jpg",
    derivative: "本站将原图缩小为网页用 JPEG，画面未改。",
  },
  {
    id: "img-ruijin-yunshishan-2007",
    file: "img-ruijin-yunshishan-2007.jpg",
    width: 1600,
    height: 1370,
    place: "瑞金",
    title: "瑞金云石山",
    alt: "2007年6月26日的瑞金云石山，石壁上有后来题的「长征第一山」。",
    caption: "2007年6月26日拍摄的瑞金云石山今貌。石壁上的「长征第一山」是后来的题字。这不是1934年的历史照片。",
    artist: "wanghongliu",
    dateLabel: "2007年6月26日",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
    filePage: "https://commons.wikimedia.org/wiki/File:%E9%95%BF%E5%BE%81%E7%AC%AC%E4%B8%80%E5%B1%B1-%E7%91%9E%E9%87%91%E4%BA%91%E7%9F%B3%E5%B1%B1_the_First_Hill_of_Long_March_-_panoramio.jpg",
    derivative: "本站将原图缩小为网页用 JPEG，画面未改。",
  },
  {
    id: "img-zunyi-site-2018",
    file: "img-zunyi-site-2018.jpg",
    width: 1600,
    height: 1078,
    place: "遵义",
    title: "遵义会议会址",
    alt: "2018年2月20日的遵义会议会址外观，门口有后来的游客。",
    caption: "2018年2月20日拍摄的遵义会议会址外观。这是后来看到的房子，不是1935年会场里的照片。",
    artist: "N509FZ",
    dateLabel: "2018年2月20日",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    filePage: "https://commons.wikimedia.org/wiki/File:Site_of_Zunyi_Conference_(20180220101816).jpg",
    derivative: "本站将原图缩小为网页用 JPEG，画面未改。",
  },
  {
    id: "img-liping-oldstreet-2006",
    file: "img-liping-oldstreet-2006.jpg",
    width: 1600,
    height: 1200,
    place: "黎平",
    title: "黎平老街",
    alt: "2006年10月4日的黎平老街，街上有后来的房屋和行人。",
    caption: "2006年10月4日拍摄的黎平老街。文件名把它和黎平会议所在的一带联系起来。这是后来的街道，不是1934年的会议现场。",
    artist: "Joseph Yu",
    dateLabel: "2006年10月4日",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
    filePage: "https://commons.wikimedia.org/wiki/File:%E9%BB%8E%E5%B9%B3%E5%8E%BF%E8%80%81%E8%A1%97%EF%BC%88%E9%BB%8E%E5%B9%B3%E4%BC%9A%E8%AE%AE%E6%89%80%E5%9C%A8%E5%9C%B0%EF%BC%89_-_panoramio.jpg",
    derivative: "本站将原图缩小为网页用 JPEG，画面未改。",
  },
  {
    id: "img-chishui-maotai-2016",
    file: "img-chishui-maotai-2016.jpg",
    width: 1600,
    height: 900,
    place: "茅台",
    title: "茅台镇赤水河岸",
    alt: "2016年8月5日茅台镇的赤水河岸，有后来的桥和房屋。",
    caption: "2016年8月5日拍摄的茅台镇赤水河岸。茅台是四渡赤水里三渡的通行地点之一。这是后来的河岸，不是当年的战场。",
    artist: "Wahsaw",
    dateLabel: "2016年8月5日",
    license: "CC0",
    licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
    filePage: "https://commons.wikimedia.org/wiki/File:Chishui_River_Bank_in_Maotai(Moutai)_Town,_Renhuai_City,_Zunyi,_Guizhou.jpg",
    derivative: "本站将原图缩小为网页用 JPEG，画面未改。",
  },
  {
    id: "img-luding-bridge-2018",
    file: "img-luding-bridge-2018.jpg",
    width: 1440,
    height: 1080,
    place: "泸定",
    title: "Luding Bridge over the Dadu River, 2018",
    alt: "2018年泸定县城的大渡河铁索桥，桥边是后来的街道和房屋。",
    caption: "2018年拍摄的泸定县城大渡河铁索桥今貌，桥边是后来的街道。文件说明写5月17日，元数据日期是6月17日，这里只写到年。这不是博物馆展板上的旧照片，也不是1935年的战场照片。",
    artist: "Huangdan2060",
    dateLabel: "2018年",
    license: "CC0",
    licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
    filePage: "https://commons.wikimedia.org/wiki/File:Luding_Bridge_over_the_Dadu_River,_in_Luding_County,_Sichuan,_China,_2018.jpg",
    derivative: "使用 Commons 原文件，没有裁切，也没有重新编码。",
  },
  {
    id: "img-jiajin-pass-2013",
    file: "img-jiajin-pass-2013.jpg",
    width: 1600,
    height: 900,
    place: "夹金山",
    title: "夹金山垭口",
    alt: "2013年7月7日的夹金山垭口公路和后来的路牌。",
    caption: "2013年7月7日拍摄的夹金山垭口。公路和路牌都是后来的。这不是1935年翻山时的照片。",
    artist: "Leeshan Chung",
    dateLabel: "2013年7月7日",
    license: "CC BY 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by/3.0",
    filePage: "https://commons.wikimedia.org/wiki/File:%E5%A4%B9%E9%87%91%E5%B1%B1%E5%9E%AD%E5%8F%A3_-_panoramio.jpg",
    derivative: "本站将原图缩小为网页用 JPEG，画面未改。",
  },
  {
    id: "img-zoige-wetland-2013",
    file: "img-zoige-wetland-2013.jpg",
    width: 1600,
    height: 898,
    place: "若尔盖",
    title: "若尔盖湿地",
    alt: "2013年6月6日的若尔盖湿地路牌和公路。",
    caption: "2013年6月6日拍摄的若尔盖湿地路牌和公路。它说明这一带是草地，不能当成红军某一天的脚印，也不是1935年的历史照片。",
    artist: "liuzusai刘祖赛",
    dateLabel: "2013年6月6日",
    license: "CC BY 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by/3.0",
    filePage: "https://commons.wikimedia.org/wiki/File:%E8%8B%A5%E5%B0%94%E7%9B%96%E6%B9%BF%E5%9C%B0_2013-06-06-liuzusai_-_panoramio.jpg",
    derivative: "本站将原图缩小为网页用 JPEG，画面未改。",
  },
  {
    id: "img-hadapu-site-2026",
    file: "img-hadapu-site-2026.jpg",
    width: 1600,
    height: 1067,
    place: "哈达铺",
    title: "哈达铺红军干部会议旧址",
    alt: "2026年2月2日的哈达铺会议旧址，门前有后来的汽车。",
    caption: "2026年2月2日拍摄的哈达铺红军干部会议旧址。这是后来的房子，不是1935年开会时的照片。",
    artist: "N509FZ",
    dateLabel: "2026年2月2日",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    filePage: "https://commons.wikimedia.org/wiki/File:Hadapu_Red_Army_Cadre_Conference_site_(20260202165723).jpg",
    derivative: "本站将原图缩小为网页用 JPEG，画面未改。",
  },
  {
    id: "img-huining-tower-2012",
    file: "img-huining-tower-2012.jpg",
    width: 1200,
    height: 1600,
    place: "会宁",
    title: "会师塔",
    alt: "2012年7月26日的会宁会师塔，塔前有后来的电子屏和标语。",
    caption: "2012年7月26日拍摄的会宁会师塔。塔和标语都是后来建的，不是1936年会师当天的照片。",
    artist: "DarthVachel",
    dateLabel: "2012年7月26日",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
    filePage: "https://commons.wikimedia.org/wiki/File:%E4%BC%9A%E5%B8%88%E5%A1%94.jpg",
    derivative: "本站将原图缩小为网页用 JPEG，画面未改。",
  },
  {
    id: "img-wuqi-today-2010",
    file: "img-wuqi-today-2010.jpg",
    width: 300,
    height: 225,
    place: "吴起",
    title: "Wuqi-today",
    alt: "2010年6月29日美国之音拍摄的吴起县城楼房，画面很小。",
    caption: "2010年6月29日美国之音张楠拍摄的吴起县城。文件名里的 today 指拍摄当时的城镇。这不是1935年的历史照片。原图只有300×225，页面按这个尺寸显示，没有放大。",
    artist: "VOA美国之音张楠",
    dateLabel: "2010年6月29日",
    license: "公有领域（PD-VOA）",
    licenseUrl: null,
    filePage: "https://commons.wikimedia.org/wiki/File:Voa_chinese_Wuqi-today_29jun10_300.jpg",
    derivative: "使用 Commons 原文件，14961 字节，没有重新编码，也没有放大。",
    small: true,
  },
  {
    id: "img-jiaopingdu-bridge-2020",
    file: "img-jiaopingdu-bridge-2020.jpg",
    width: 1600,
    height: 1200,
    place: "皎平渡",
    title: "New Jiaopingdu Bridge 2020B",
    alt: "2020年12月13日金沙江上的新皎平渡大桥和库区江面，没有诗碑。",
    caption: "2020年12月13日拍摄的新皎平渡大桥和金沙江库区。1935年的渡口已在蓄水后淹没。这是后来的公路桥和江面，不是当年渡江的照片，也不是诗碑。",
    artist: "Zhangzj cet",
    dateLabel: "2020年12月13日",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    filePage: "https://commons.wikimedia.org/wiki/File:New_Jiaopingdu_Bridge_2020B.jpg",
    derivative: "本站将原图缩小为网页用 JPEG，没有裁成诗碑或题字特写。",
  },
  {
    id: "img-dadu-terrace-2012",
    file: "img-dadu-terrace-2012.jpg",
    width: 1600,
    height: 1200,
    place: "大渡河",
    title: "俯瞰长征路观景台",
    alt: "2012年10月26日大渡河观景台上的摊位和远处的山。",
    caption: "2012年10月26日拍摄的大渡河「俯瞰长征路」观景台。画面主要是平台上的摊位，河不在中心。这不是1935年的历史照片。",
    artist: "rheins",
    dateLabel: "2012年10月26日",
    license: "CC BY 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by/3.0",
    filePage: "https://commons.wikimedia.org/wiki/File:%E2%80%9C%E4%BF%AF%E7%9E%B0%E9%95%BF%E5%BE%81%E8%B7%AF%E2%80%9D%E8%A7%82%E6%99%AF%E5%8F%B0_-_Dadu_River_Viewing_Terrace_-2012.10_-_panoramio.jpg",
    derivative: "本站将原图缩小为网页用 JPEG，画面未改。",
  },
  {
    id: "img-map-schematic-zh-svg",
    file: "img-map-schematic-zh-svg.svg",
    width: 1124,
    height: 865,
    place: "后人示意图",
    title: "LaLargaMarcha19341935-zh.svg",
    alt: "2019年的中央红军路线示意图，比例尺是英里，并带有与长征无关的地名。",
    caption: "2019年的中文派生图，主要表示中央红军1934至1935年的概念路线。它使用英里比例尺，并标有首尔和缅甸战场一带的地名。不是精确轨迹，也不能代表另外三路，更不是本站画的地图。",
    artist: "Guimard 原图，Rowanwindwhistler 与 GnolizX 派生",
    dateLabel: "2019年",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
    filePage: "https://commons.wikimedia.org/wiki/File:LaLargaMarcha19341935-zh.svg",
    derivative: "使用 Commons 上的 SVG 原文件。",
  },
];

export function mediaById(id: string): MediaItem | undefined {
  return items.find((item) => item.id === id);
}

export function shippedMedia(): MediaItem[] {
  return items;
}

export function photo(id: string, opts: { eager?: boolean } = {}): string {
  const item = mediaById(id);
  if (!item) return "";
  const license = item.licenseUrl
    ? `<a href="${esc(item.licenseUrl)}">${esc(item.license)}</a>`
    : esc(item.license);
  return `<figure class="plate${item.small ? " plate-small" : ""}" data-photo="${esc(id)}" data-place="${esc(item.place)}">
    <img src="./media/${esc(item.file)}" width="${item.width}" height="${item.height}" alt="${esc(item.alt)}" loading="${opts.eager ? "eager" : "lazy"}" decoding="async" />
    <figcaption>
      <p>${esc(item.caption)}</p>
      <p>${esc(item.title)}。${esc(item.artist)}，${esc(item.dateLabel)}。许可 ${license}。${esc(item.derivative)} <a href="${esc(item.filePage)}">原始文件页</a></p>
    </figcaption>
  </figure>`;
}
