import mediaJson from "../content/data/media.json";
import { esc } from "./format";

export interface MediaItem {
  id: string;
  file_page: string;
  license: string;
  license_url: string | null;
  artist: string;
  years_label: string;
  place: string;
  caption_required: string;
  photo_type: string;
  commons_title: string;
  shipped?: boolean;
  ship_filename?: string;
  ship_width?: number | null;
  ship_height?: number | null;
  derivative?: string;
  must_not_label_as_1930s_photo?: boolean;
}

const items = (mediaJson.items as MediaItem[]).filter((item) => item.shipped && item.ship_filename);

export function mediaById(id: string): MediaItem | undefined {
  return items.find((item) => item.id === id);
}

export function shippedMedia(): MediaItem[] {
  return items;
}

export function photo(id: string, opts: { eager?: boolean } = {}): string {
  const item = mediaById(id);
  if (!item?.ship_filename) return "";
  const small = id === "img-wuqi-today-2010";
  const width = item.ship_width ?? (small ? 300 : 1600);
  const height = item.ship_height ?? (small ? 225 : 1067);
  const alt = `${item.years_label}年${item.place}的当代照片，${item.artist}拍摄。不是1934至1936年的历史照片。`;
  const license = item.license_url
    ? `<a href="${esc(item.license_url)}">${esc(item.license)}</a>`
    : esc(item.license);
  return `<figure class="plate${small ? " plate-small" : ""}" data-photo="${esc(id)}" data-place="${esc(item.place)}">
    <img src="./media/${esc(item.ship_filename)}" width="${width}" height="${height}" alt="${esc(alt)}" loading="${opts.eager ? "eager" : "lazy"}" decoding="async" />
    <figcaption>
      <p>${esc(item.caption_required)}</p>
      <p>${esc(item.place)}。${esc(item.artist)}，${esc(item.years_label)}。许可 ${license}。${esc(item.derivative ?? "")} <a href="${esc(item.file_page)}">原始文件页</a></p>
    </figcaption>
  </figure>`;
}
