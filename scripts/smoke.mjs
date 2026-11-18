import { createServer } from "node:http";
import { existsSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { chromium } from "playwright-core";

const dist = join(process.cwd(), "dist");
const shotDir = process.env.SHOT_DIR || "/opt/cursor/artifacts";
mkdirSync(shotDir, { recursive: true });
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".json": "application/json",
};

function start(root, port) {
  const server = createServer((req, res) => {
    const url = new URL(req.url ?? "/", "http://127.0.0.1");
    let pathname = decodeURIComponent(url.pathname);
    if (pathname.endsWith("/")) pathname += "index.html";
    const file = normalize(join(root, pathname));
    if (!file.startsWith(root) || !existsSync(file) || statSync(file).isDirectory()) {
      res.writeHead(404, { "content-type": "text/plain" });
      res.end("not found");
      return;
    }
    res.writeHead(200, { "content-type": types[extname(file)] ?? "application/octet-stream" });
    res.end(readFileSync(file));
  });
  return new Promise((resolve) => server.listen(port, "127.0.0.1", () => resolve(server)));
}

const failures = [];
function check(name, ok, detail = "") {
  const line = `${ok ? "通过" : "失败"}  ${name}${detail ? ` — ${detail}` : ""}`;
  console.log(line);
  if (!ok) failures.push(line);
}

const rootServer = await start(dist, 43123);
const subRoot = "/tmp/pages-sub";
await import("node:fs/promises").then((fs) => fs.cp(dist, join(subRoot, "changzheng"), { recursive: true }));
const subServer = await start(subRoot, 43124);

const browser = await chromium.launch({
  executablePath: "/opt/google/chrome/chrome",
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

async function open(url, viewport) {
  const page = await browser.newPage({ viewport });
  const errors = [];
  page.on("pageerror", (error) => errors.push(String(error)));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  const response = await page.goto(url, { waitUntil: "networkidle" });
  return { page, errors, status: response?.status() ?? 0 };
}

const desktop = { width: 1280, height: 900 };
const mobile = { width: 390, height: 844 };

const home = await open("http://127.0.0.1:43123/index.html", desktop);
check("首页状态", home.status === 200, String(home.status));
check("首页无控制台错误", home.errors.length === 0, home.errors.join(" | "));
check("首页标题", (await home.page.locator("h1").innerText()).includes("长征纪程"));
check("独立整理声明", (await home.page.locator("body").innerText()).includes("不是博物馆"));
check("吴起与总结束分开", (await home.page.locator("body").innerText()).includes("并不等于整个长征"));
await home.page.screenshot({ path: join(shotDir, "desktop-home.png"), fullPage: false });
await home.page.locator(".geo-map").first().screenshot({ path: join(shotDir, "desktop-home-map.png") });

await home.page.locator("a.button", { hasText: "进入年表" }).click();
await home.page.waitForURL(/timeline\.html/);
check("进入年表", home.page.url().includes("timeline.html"));
await home.page.locator("input[name='army'][value='25th-army']").check();
const timelineText = await home.page.locator("#timeline-list").innerText();
check("红二十五军筛选含何家冲", timelineText.includes("何家冲"));
check("该筛选不含瑞金出发", !timelineText.includes("由瑞金出发"));
await home.page.screenshot({ path: join(shotDir, "desktop-timeline-25th.png"), fullPage: true });

await home.page.locator("input[name='year'][value='1934']").check();
await home.page.locator("input[name='army'][value='fourth-front-army']").check();
check("空筛选有反馈", await home.page.locator("#timeline-empty").isVisible());
await home.page.screenshot({ path: join(shotDir, "desktop-timeline-empty.png"), fullPage: false });

await home.page.locator("h1").click();
await home.page.keyboard.press("/");
check("斜杠打开检索", await home.page.locator("#search-dialog").evaluate((el) => el.open));
await home.page.locator("#q").fill("于都");
await home.page.waitForTimeout(50);
check("检索于都有结果", (await home.page.locator("#search-status").innerText()).includes("找到"));
await home.page.locator("#q").fill("没有这个词zzzz");
await home.page.waitForTimeout(50);
check("检索空结果", (await home.page.locator("#search-status").innerText()).includes("没有与"));
await home.page.screenshot({ path: join(shotDir, "desktop-search-empty.png") });
await home.page.keyboard.press("Escape");

await home.page.goto("http://127.0.0.1:43123/timeline.html?event=T03", { waitUntil: "networkidle" });
const detail = home.page.locator("#detail-T03");
check("瑞金条目展开", await detail.isVisible());
check("瑞金详情提醒不要混同于都", (await detail.innerText()).includes("T04"));
const sourceHref = await detail.locator("a[href*='sources.html#S']").first().getAttribute("href");
check("来源锚点", Boolean(sourceHref && sourceHref.includes("sources.html#")));
await home.page.goto(`http://127.0.0.1:43123/${sourceHref?.replace("./", "")}`, { waitUntil: "networkidle" });
const external = home.page.locator("article#S03 a[href^='https://']");
check("外部来源可点", (await external.count()) === 1);
const href = await external.getAttribute("href");
check("外部来源是核链 URL", href === "https://www.xinhuanet.com/politics/2016-10/10/c_129315351.htm");
check("握手失败不写成404", !(await home.page.locator("#S04").innerText()).includes("已经不存在") || (await home.page.locator("#S04").innerText()).includes("不是 404") || (await home.page.locator("#S04").innerText()).includes("不是 HTTP 404"));
const s04 = await home.page.locator("#S04").innerText();
check("人民网党史页说明不是404", s04.includes("不是 404") || s04.includes("不是 HTTP 404"));
await home.page.screenshot({ path: join(shotDir, "desktop-sources.png"), fullPage: false });

await home.page.goto("http://127.0.0.1:43123/routes.html", { waitUntil: "networkidle" });
check("路线免责声明可见", await home.page.locator("#map-disclaimer").isVisible());
check("免责声明写明不是精确轨迹", (await home.page.locator("#map-disclaimer").innerText()).includes("精确"));
check("没有关闭免责声明的按钮", (await home.page.locator("#map-disclaimer button").count()) === 0);
await home.page.locator(".geo-map").first().screenshot({ path: join(shotDir, "desktop-routes.png") });
await home.page.screenshot({ path: join(shotDir, "desktop-routes-page.png"), fullPage: false });
await home.page.locator(".node-jump", { hasText: "于都" }).click();
check("节点说明写明不是精确轨迹", (await home.page.locator("#node-panel").innerText()).includes("非精确行军轨迹"));
const mapText = await home.page.locator(".geo-map").first().evaluate((el) => el.textContent ?? "");
check("总图有指北和比例尺", mapText.includes("北") && mapText.includes("公里"), mapText.slice(0, 180));
const overflow = await home.page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
check("路线页无横向溢出", overflow <= 1, String(overflow));
const imgCount = await home.page.locator("img").count();
const broken = [];
for (let i = 0; i < imgCount; i += 1) {
  const img = home.page.locator("img").nth(i);
  await img.scrollIntoViewIfNeeded();
  const result = await img.evaluate(async (el) => {
    try {
      await Promise.race([
        el.decode(),
        new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 8000)),
      ]);
    } catch {
      /* decode timeout or error */
    }
    return { src: el.currentSrc || el.src, width: el.naturalWidth };
  });
  if (result.width === 0) broken.push(result.src);
}
check("路线页图片可解码", broken.length === 0, `${imgCount} 张；${broken.join(" | ")}`);
await home.page.screenshot({ path: join(shotDir, "desktop-routes.png"), fullPage: false });
await home.page.locator("input[name='lane']").evaluateAll((boxes) => boxes.forEach((box) => {
  box.checked = false;
  box.dispatchEvent(new Event("change", { bubbles: true }));
}));
check("路线全部关闭有反馈", await home.page.locator("#map-empty").isVisible());

await home.page.goto("http://127.0.0.1:43123/battles.html", { waitUntil: "networkidle" });
check("战役页有湘江说明", (await home.page.locator("body").innerText()).includes("不用长沙"));
await home.page.screenshot({ path: join(shotDir, "desktop-battles.png"), fullPage: false });
await home.page.locator(".geo-map").first().screenshot({ path: join(shotDir, "desktop-battles-map.png") });
const battleOverflow = await home.page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
check("战役页无横向溢出", battleOverflow <= 1, String(battleOverflow));
await home.page.goto("http://127.0.0.1:43123/forces.html", { waitUntil: "networkidle" });
const forces = await home.page.locator("body").innerText();
check("四路页并列红四起点", forces.includes("3月说") && forces.includes("5月说"));
check("红二十五军三天分开", forces.includes("抵达、会师、合编是三天"));
check("二万五千里不是四路总和", forces.includes("不是四路总和") || forces.includes("不是机关直线距离"));
await home.page.screenshot({ path: join(shotDir, "desktop-forces.png"), fullPage: false });

const mobileHome = await open("http://127.0.0.1:43123/index.html", mobile);
check("手机首页无控制台错误", mobileHome.errors.length === 0, mobileHome.errors.join(" | "));
await mobileHome.page.locator(".nav-open").click();
check("手机目录展开", await mobileHome.page.locator("#mobile-nav").isVisible());
await mobileHome.page.screenshot({ path: join(shotDir, "mobile-home-menu.png"), fullPage: false });
await mobileHome.page.locator("#mobile-nav a", { hasText: "年表" }).click();
await mobileHome.page.waitForURL(/timeline\.html/);
await mobileHome.page.locator("input[name='army'][value='central-red-army']").check();
check("手机筛选中央红军", (await mobileHome.page.locator("#filter-status").innerText()).includes("显示"));
await mobileHome.page.screenshot({ path: join(shotDir, "mobile-timeline.png"), fullPage: false });
await mobileHome.page.goto("http://127.0.0.1:43123/routes.html", { waitUntil: "networkidle" });
check("手机路线免责声明", await mobileHome.page.locator("#map-disclaimer").isVisible());
const mobileOverflow = await mobileHome.page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
check("手机路线无横向溢出", mobileOverflow <= 1, String(mobileOverflow));
await mobileHome.page.locator(".geo-map").first().screenshot({ path: join(shotDir, "mobile-routes.png") });
await mobileHome.page.goto("http://127.0.0.1:43123/index.html", { waitUntil: "networkidle" });
const mobileHomeOverflow = await mobileHome.page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
check("手机首页无横向溢出", mobileHomeOverflow <= 1, String(mobileHomeOverflow));
await mobileHome.page.screenshot({ path: join(shotDir, "mobile-home.png"), fullPage: false });

const sub = await open("http://127.0.0.1:43124/changzheng/index.html", desktop);
check("子路径页面", sub.status === 200);
check("子路径无控制台错误", sub.errors.length === 0, sub.errors.join(" | "));
const cssHref = await sub.page.locator("link[rel='stylesheet']").getAttribute("href");
check("子路径样式是相对地址", Boolean(cssHref && cssHref.startsWith("./")));
const cssResponse = await sub.page.request.get(new URL(cssHref, sub.page.url()).href);
check("子路径样式可加载", cssResponse.status() === 200);
await sub.page.locator("a", { hasText: "四路" }).first().click();
await sub.page.waitForURL(/forces\.html/);
check("子路径章节跳转", sub.page.url().includes("/changzheng/forces.html"));
await sub.page.screenshot({ path: join(shotDir, "subpath-forces.png"), fullPage: false });

await browser.close();
rootServer.close();
subServer.close();

if (failures.length) {
  console.error(`\n${failures.length} 项未通过`);
  process.exit(1);
}
console.log("\n浏览器测试全部通过");
