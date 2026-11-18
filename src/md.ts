import { inline } from "./format";

/** 只渲染核链稿里实际用到的标记：标题、段落、列表、表格、粗体和源号。 */
export function renderMarkdown(md: string): string {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const html: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim() || line.trim() === "---") {
      i += 1;
      continue;
    }
    if (line.startsWith("### ")) {
      html.push(`<h3>${inline(line.slice(4))}</h3>`);
      i += 1;
      continue;
    }
    if (line.startsWith("## ")) {
      html.push(`<h2>${inline(line.slice(3))}</h2>`);
      i += 1;
      continue;
    }
    if (line.startsWith("> ")) {
      const quote: string[] = [];
      while (i < lines.length && lines[i].startsWith("> ")) {
        quote.push(lines[i].slice(2));
        i += 1;
      }
      html.push(`<blockquote><p>${inline(quote.join(""))}</p></blockquote>`);
      continue;
    }
    if (line.startsWith("|")) {
      const rows: string[][] = [];
      while (i < lines.length && lines[i].startsWith("|")) {
        if (!/^\|\s*-+/.test(lines[i])) {
          rows.push(
            lines[i]
              .split("|")
              .slice(1, -1)
              .map((cell) => cell.trim()),
          );
        }
        i += 1;
      }
      if (rows.length) {
        const head = rows[0].map((c) => `<th>${inline(c)}</th>`).join("");
        const body = rows
          .slice(1)
          .map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join("")}</tr>`)
          .join("");
        html.push(`<div class="table-wrap"><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`);
      }
      continue;
    }
    if (line.startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length && lines[i].startsWith("- ")) {
        items.push(`<li>${inline(lineItem(lines[i].slice(2)))}</li>`);
        i += 1;
      }
      html.push(`<ul>${items.join("")}</ul>`);
      continue;
    }
    if (/^\d+\.\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(`<li>${inline(lines[i].replace(/^\d+\.\s/, ""))}</li>`);
        i += 1;
      }
      html.push(`<ol>${items.join("")}</ol>`);
      continue;
    }
    const para: string[] = [line];
    i += 1;
    while (i < lines.length && lines[i].trim() && !blockStart(lines[i])) {
      para.push(lines[i]);
      i += 1;
    }
    html.push(`<p>${inline(para.join(""))}</p>`);
  }
  return html.join("\n");
}

function lineItem(text: string): string {
  return text;
}

function blockStart(line: string): boolean {
  return (
    line.startsWith("#") ||
    line.startsWith("- ") ||
    line.startsWith("|") ||
    line.startsWith("> ") ||
    /^\d+\.\s/.test(line) ||
    line.trim() === "---"
  );
}
