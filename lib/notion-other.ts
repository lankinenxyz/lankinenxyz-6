import "server-only";

const notionApiVersion = "2022-06-28";
const revalidateSeconds = 300;

const placeholderValues = new Set(["", "replace-with-notion-integration-token"]);

type NotionRichText = {
  plain_text?: string;
  href?: string | null;
  annotations?: {
    bold?: boolean;
    italic?: boolean;
    strikethrough?: boolean;
    underline?: boolean;
    code?: boolean;
  };
};

type NotionFile = {
  type?: "external" | "file";
  external?: { url?: string };
  file?: { url?: string };
};

type NotionProperty =
  | { type: "title"; title: NotionRichText[] }
  | { type: "rich_text"; rich_text: NotionRichText[] }
  | { type: "date"; date: { start?: string | null } | null }
  | { type: "files"; files: NotionFile[] }
  | { type: "url"; url: string | null }
  | { type: "select"; select: { name?: string } | null }
  | { type: "status"; status: { name?: string } | null }
  | { type: "number"; number: number | null }
  | { type: string; [key: string]: unknown };

type NotionCover =
  | { type: "external"; external?: { url?: string } }
  | { type: "file"; file?: { url?: string } }
  | null;

type NotionPage = {
  id: string;
  cover?: NotionCover;
  properties: Record<string, NotionProperty>;
};

type NotionBlock = {
  id: string;
  type: string;
  has_children?: boolean;
  [key: string]: unknown;
};

type NotionQueryResponse = {
  results?: NotionPage[];
  has_more?: boolean;
  next_cursor?: string | null;
};

type NotionBlocksResponse = {
  results?: NotionBlock[];
  has_more?: boolean;
  next_cursor?: string | null;
};

export type OtherRichText = {
  text: string;
  href: string | null;
  bold: boolean;
  italic: boolean;
  strikethrough: boolean;
  underline: boolean;
  code: boolean;
};

export type OtherBlock = {
  id: string;
  type: string;
  richText: OtherRichText[];
  imageUrl?: string;
  language?: string;
  children: OtherBlock[];
};

export type TravelDestination = {
  id: string;
  title: string;
  city: string;
  country: string;
  imageUrl: string | null;
  month: string | null;
  year: string | null;
  content?: OtherBlock[];
};

export type Watch = {
  id: string;
  title: string;
  imageUrl: string | null;
  year: string | null;
  content?: OtherBlock[];
};

export type FitnessEntry = {
  id: string;
  title: string;
  description: string;
  date: string | null;
  category: string;
  imageUrl: string | null;
  content?: OtherBlock[];
};

export async function getTravelDestinations(): Promise<TravelDestination[]> {
  const token = process.env.NOTION_API_KEY?.trim() ?? "";
  const databaseId = process.env.NOTION_TRAVEL_DATABASE_ID?.trim() ?? "";

  if (!isConfigured(token, databaseId)) {
    return [];
  }

  const pages = await queryDatabase(token, databaseId, "Year");

  return pages.map(toTravelDestination);
}

export async function getTravelDestination(id: string): Promise<TravelDestination | null> {
  const token = process.env.NOTION_API_KEY?.trim() ?? "";

  if (!isConfigured(token, process.env.NOTION_TRAVEL_DATABASE_ID?.trim() ?? "")) {
    return null;
  }

  const page = await getPage(token, id);

  return {
    ...toTravelDestination(page),
    content: await getBlockChildren(token, page.id),
  };
}

export async function getWatches(): Promise<Watch[]> {
  const token = process.env.NOTION_API_KEY?.trim() ?? "";
  const databaseId = process.env.NOTION_WATCHES_DATABASE_ID?.trim() ?? "";

  if (!isConfigured(token, databaseId)) {
    return [];
  }

  const pages = await queryDatabase(token, databaseId, "Year");

  return pages.map(toWatch);
}

export async function getFitnessEntries(): Promise<FitnessEntry[]> {
  const token = process.env.NOTION_API_KEY?.trim() ?? "";
  const databaseId = process.env.NOTION_FITNESS_DATABASE_ID?.trim() ?? "";

  if (!isConfigured(token, databaseId)) {
    return [];
  }

  const pages = await queryDatabase(token, databaseId);

  return sortByDateDesc(pages.filter(isVisibleEntry).map(toFitnessEntry));
}

export async function getFitnessEntry(id: string): Promise<FitnessEntry | null> {
  const token = process.env.NOTION_API_KEY?.trim() ?? "";

  if (!isConfigured(token, process.env.NOTION_FITNESS_DATABASE_ID?.trim() ?? "")) {
    return null;
  }

  const page = await getPage(token, id);

  if (!isVisibleEntry(page)) {
    return null;
  }

  return {
    ...toFitnessEntry(page),
    content: await getBlockChildren(token, page.id),
  };
}

export async function getWatch(id: string): Promise<Watch | null> {
  const token = process.env.NOTION_API_KEY?.trim() ?? "";

  if (!isConfigured(token, process.env.NOTION_WATCHES_DATABASE_ID?.trim() ?? "")) {
    return null;
  }

  const page = await getPage(token, id);

  return {
    ...toWatch(page),
    content: await getBlockChildren(token, page.id),
  };
}

function isConfigured(token: string, databaseId: string) {
  return [token, databaseId].every((value) => !placeholderValues.has(value) && !value.startsWith("replace-with-"));
}

async function queryDatabase(token: string, databaseId: string, sortProperty?: string) {
  const pages: NotionPage[] = [];
  let cursor: string | null = null;

  do {
    const response: NotionQueryResponse = await notionFetch<NotionQueryResponse>(token, `/databases/${databaseId}/query`, {
      method: "POST",
      body: JSON.stringify({
        page_size: 50,
        start_cursor: cursor ?? undefined,
        sorts: sortProperty ? [{ property: sortProperty, direction: "descending" }] : undefined,
      }),
    });

    pages.push(...(response.results ?? []));
    cursor = response.has_more ? response.next_cursor ?? null : null;
  } while (cursor);

  return pages;
}

async function getPage(token: string, pageId: string) {
  return notionFetch<NotionPage>(token, `/pages/${pageId}`, { method: "GET" });
}

async function getBlockChildren(token: string, blockId: string): Promise<OtherBlock[]> {
  const blocks: NotionBlock[] = [];
  let cursor: string | null = null;

  do {
    const searchParams = new URLSearchParams({ page_size: "100" });

    if (cursor) {
      searchParams.set("start_cursor", cursor);
    }

    const response: NotionBlocksResponse = await notionFetch<NotionBlocksResponse>(
      token,
      `/blocks/${blockId}/children?${searchParams.toString()}`,
      { method: "GET" },
    );

    blocks.push(...(response.results ?? []));
    cursor = response.has_more ? response.next_cursor ?? null : null;
  } while (cursor);

  return Promise.all(
    blocks.map(async (block) => ({
      ...toOtherBlock(block),
      children: block.has_children ? await getBlockChildren(token, block.id) : [],
    })),
  );
}

async function notionFetch<T>(token: string, path: string, init: RequestInit): Promise<T> {
  const response = await fetch(`https://api.notion.com/v1${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "Notion-Version": notionApiVersion,
      ...init.headers,
    },
    next: { revalidate: revalidateSeconds },
  });

  if (!response.ok) {
    throw new Error(`Notion request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

function toTravelDestination(page: NotionPage): TravelDestination {
  return {
    id: page.id,
    title: getTitle(page.properties),
    city: getPlainText(page.properties, ["City"]) || getTitle(page.properties),
    country: getPlainText(page.properties, ["Country"]),
    imageUrl: getImageUrl(page),
    month: getPlainText(page.properties, ["Month"]),
    year: getPlainText(page.properties, ["Year"]),
  };
}

function toWatch(page: NotionPage): Watch {
  return {
    id: page.id,
    title: getTitle(page.properties),
    imageUrl: getImageUrl(page),
    year: getPlainText(page.properties, ["Year", "Acquired Year", "Purchased Year", "Got Year"]),
  };
}

function toFitnessEntry(page: NotionPage): FitnessEntry {
  return {
    id: page.id,
    title: getTitle(page.properties),
    description: getPlainText(page.properties, ["Description", "Summary", "Excerpt"]),
    date: getDate(page.properties),
    category: getPlainText(page.properties, ["Category", "Type"]),
    imageUrl: getImageUrl(page),
  };
}

function getTitle(properties: Record<string, NotionProperty>) {
  const property = properties.Name ?? findProperty(properties, "title");

  if (!isTitleProperty(property)) {
    return "Untitled";
  }

  return richTextToPlainText(property.title) || "Untitled";
}

function getPlainText(properties: Record<string, NotionProperty>, names: string[]) {
  const property = getNamedProperty(properties, names);

  if (isRichTextProperty(property)) {
    return richTextToPlainText(property.rich_text);
  }

  if (isTitleProperty(property)) {
    return richTextToPlainText(property.title);
  }

  if (isSelectProperty(property)) {
    return property.select?.name ?? "";
  }

  if (isNumberProperty(property)) {
    return property.number === null ? "" : String(property.number);
  }

  if (isDateProperty(property)) {
    return property.date?.start ?? "";
  }

  return "";
}

function getDate(properties: Record<string, NotionProperty>) {
  const property = getNamedProperty(properties, ["Date"]);

  if (!isDateProperty(property)) {
    return null;
  }

  return property.date?.start ?? null;
}

function getStatus(properties: Record<string, NotionProperty>) {
  const property = getNamedProperty(properties, ["Status", "State"]);

  if (isStatusProperty(property)) {
    return property.status?.name ?? "";
  }

  if (isSelectProperty(property)) {
    return property.select?.name ?? "";
  }

  if (isRichTextProperty(property)) {
    return richTextToPlainText(property.rich_text);
  }

  return "";
}

function isVisibleEntry(page: NotionPage) {
  if (!getNamedProperty(page.properties, ["Status", "State"])) {
    return true;
  }

  return getStatus(page.properties).toLowerCase() === "published";
}

function getImageUrl(page: NotionPage) {
  const propertyUrl = getFirstUrl(page.properties, ["Image", "Images", "Photo", "Picture", "Cover", "Watch Picture"]);

  if (propertyUrl) {
    return propertyUrl;
  }

  if (page.cover?.type === "external") {
    return page.cover.external?.url ?? null;
  }

  if (page.cover?.type === "file") {
    return page.cover.file?.url ?? null;
  }

  return null;
}

function getFirstUrl(properties: Record<string, NotionProperty>, names: string[]) {
  const property = getNamedProperty(properties, names);

  if (isUrlProperty(property)) {
    return sanitizeUrls([property.url])[0] ?? null;
  }

  if (isFilesProperty(property)) {
    return sanitizeUrls(property.files.map((file) => file.external?.url ?? file.file?.url ?? null))[0] ?? null;
  }

  if (isRichTextProperty(property)) {
    return sanitizeUrls(splitUrls(richTextToPlainText(property.rich_text)))[0] ?? null;
  }

  return null;
}

function getNamedProperty(properties: Record<string, NotionProperty>, names: string[]) {
  return names.map((name) => properties[name]).find(Boolean);
}

function findProperty(properties: Record<string, NotionProperty>, type: string) {
  return Object.values(properties).find((property) => property.type === type);
}

function isTitleProperty(property: NotionProperty | undefined): property is { type: "title"; title: NotionRichText[] } {
  return property?.type === "title" && Array.isArray(property.title);
}

function isRichTextProperty(property: NotionProperty | undefined): property is { type: "rich_text"; rich_text: NotionRichText[] } {
  return property?.type === "rich_text" && Array.isArray(property.rich_text);
}

function isDateProperty(property: NotionProperty | undefined): property is { type: "date"; date: { start?: string | null } | null } {
  return property?.type === "date";
}

function isFilesProperty(property: NotionProperty | undefined): property is { type: "files"; files: NotionFile[] } {
  return property?.type === "files" && Array.isArray(property.files);
}

function isUrlProperty(property: NotionProperty | undefined): property is { type: "url"; url: string | null } {
  return property?.type === "url";
}

function isSelectProperty(property: NotionProperty | undefined): property is { type: "select"; select: { name?: string } | null } {
  return property?.type === "select";
}

function isStatusProperty(property: NotionProperty | undefined): property is { type: "status"; status: { name?: string } | null } {
  return property?.type === "status";
}

function isNumberProperty(property: NotionProperty | undefined): property is { type: "number"; number: number | null } {
  return property?.type === "number";
}

function sortByDateDesc<T extends { date: string | null }>(items: T[]) {
  return [...items].sort((a, b) => toTimestamp(b.date) - toTimestamp(a.date));
}

function toTimestamp(value: string | null) {
  if (!value) {
    return 0;
  }

  const timestamp = new Date(value).getTime();

  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function toOtherBlock(block: NotionBlock): Omit<OtherBlock, "children"> {
  const value = block[block.type];
  const record = isRecord(value) ? value : {};

  return {
    id: block.id,
    type: block.type,
    richText: toRichText(record.rich_text),
    imageUrl: getBlockImageUrl(record),
    language: typeof record.language === "string" ? record.language : undefined,
  };
}

function getBlockImageUrl(record: Record<string, unknown>) {
  const external = isRecord(record.external) ? record.external.url : null;
  const file = isRecord(record.file) ? record.file.url : null;
  const url = typeof external === "string" ? external : typeof file === "string" ? file : null;

  return url && /^https?:\/\//i.test(url) ? url : undefined;
}

function toRichText(value: unknown): OtherRichText[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item: NotionRichText) => ({
    text: item.plain_text ?? "",
    href: item.href ?? null,
    bold: item.annotations?.bold ?? false,
    italic: item.annotations?.italic ?? false,
    strikethrough: item.annotations?.strikethrough ?? false,
    underline: item.annotations?.underline ?? false,
    code: item.annotations?.code ?? false,
  }));
}

function richTextToPlainText(value: NotionRichText[]) {
  return value.map((item) => item.plain_text ?? "").join("").trim();
}

function splitUrls(value: string) {
  return value.split(/[\n,]+/).map((item) => item.trim());
}

function sanitizeUrls(urls: Array<string | null | undefined>) {
  return urls.filter((url): url is string => Boolean(url && /^https?:\/\//i.test(url))).map((url) => url.trim());
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
