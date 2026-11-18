import { renderPage } from "./render";
import { bind } from "./runtime";
import type { PageId } from "./content";

const page = (document.body.dataset.page ?? "home") as PageId;
const app = document.querySelector("#app");
if (!app) {
  throw new Error("缺少 #app");
}
app.innerHTML = renderPage(page);
bind(page);
