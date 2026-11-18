import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const root = dirname(fileURLToPath(import.meta.url));
const pages = [
  "index",
  "background",
  "forces",
  "timeline",
  "routes",
  "meetings",
  "battles",
  "people",
  "march",
  "sources",
];

/**
 * 生产构建使用相对路径，同一份 dist 既能放在域名根目录，
 * 也能放在 GitHub Pages 的 /仓库名/ 下面。开发时仍用根路径，避免 dev server 解析失败。
 */
export default defineConfig(({ command }) => ({
  base: command === "build" ? "./" : "/",
  server: { host: "127.0.0.1", port: 43123 },
  preview: { host: "127.0.0.1", port: 43123 },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    assetsDir: "assets",
    rollupOptions: {
      input: Object.fromEntries(pages.map((name) => [name, resolve(root, `${name}.html`)])),
    },
  },
}));
