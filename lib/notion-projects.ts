import "server-only";

const notionApiVersion = "2022-06-28";
const revalidateSeconds = 300;

const placeholderValues = new Set([
  "",
  "replace-with-notion-integration-token",
  "replace-with-projects-database-id",
]);

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
  name?: string;
  external?: { url?: string };
  file?: { url?: string };
};

type NotionProperty =
  | { type: "title"; title: NotionRichText[] }
  | { type: "rich_text"; rich_text: NotionRichText[] }
  | { type: "url"; url: string | null }
  | { type: "files"; files: NotionFile[] }
  | { type: "select"; select: { name?: string } | null }
  | { type: "status"; status: { name?: string } | null }
  | { type: "number"; number: number | null }
  | { type: "date"; date: { start?: string | null } | null }
  | { type: string; [key: string]: unknown };

type NotionPage = {
  id: string;
  properties: Record<string, NotionProperty>;
};

type NotionQueryResponse = {
  results?: NotionPage[];
  has_more?: boolean;
  next_cursor?: string | null;
};

type NotionBlock = {
  id: string;
  type: string;
  has_children?: boolean;
  [key: string]: unknown;
};

type NotionBlocksResponse = {
  results?: NotionBlock[];
  has_more?: boolean;
  next_cursor?: string | null;
};

export type ProjectRichText = {
  text: string;
  href: string | null;
  bold: boolean;
  italic: boolean;
  strikethrough: boolean;
  underline: boolean;
  code: boolean;
};

export type ProjectBlock = {
  id: string;
  type: string;
  richText: ProjectRichText[];
  imageUrl?: string;
  language?: string;
  children: ProjectBlock[];
};

export type Project = {
  id: string;
  title: string;
  description: string;
  intro: string;
  year: string;
  logoUrl: string | null;
  imageUrls: string[];
  link: string | null;
  status: string;
  hasContent: boolean;
  content?: ProjectBlock[];
};

export async function getProjects(): Promise<Project[]> {
  const token = process.env.NOTION_API_KEY?.trim() ?? "";
  const databaseId = process.env.NOTION_PROJECTS_DATABASE_ID?.trim() ?? "";

  if (!isConfigured(token, databaseId)) {
    return [];
  }

  const pages = await queryDatabase(token, databaseId);

  const projects = await Promise.all(
    pages.map(async (page) => ({
      ...toProject(page),
      hasContent: await hasBlockChildren(token, page.id),
    })),
  );

  return sortProjectsByYearDesc(projects);
}

export async function getProject(id: string): Promise<Project | null> {
  const token = process.env.NOTION_API_KEY?.trim() ?? "";
  const databaseId = process.env.NOTION_PROJECTS_DATABASE_ID?.trim() ?? "";

  if (!isConfigured(token, databaseId)) {
    return null;
  }

  const page = await getPage(token, id);
  const content = await getBlockChildren(token, page.id);
  const project = toProject(page);

  if (isStealthProject(project) || content.length === 0) {
    return null;
  }

  return {
    ...project,
    hasContent: true,
    content,
  };
}

function isConfigured(token: string, databaseId: string) {
  return [token, databaseId].every((value) => !placeholderValues.has(value) && !value.startsWith("replace-with-"));
}

async function queryDatabase(token: string, databaseId: string) {
  const pages: NotionPage[] = [];
  let cursor: string | null = null;

  do {
    const response: NotionQueryResponse = await notionFetch<NotionQueryResponse>(token, `/databases/${databaseId}/query`, {
      method: "POST",
      body: JSON.stringify({
        page_size: 50,
        start_cursor: cursor ?? undefined,
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

async function hasBlockChildren(token: string, blockId: string) {
  const response = await notionFetch<NotionBlocksResponse>(token, `/blocks/${blockId}/children?page_size=1`, {
    method: "GET",
  });

  return Boolean(response.results?.length);
}

async function getBlockChildren(token: string, blockId: string): Promise<ProjectBlock[]> {
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
      ...toProjectBlock(block),
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

function getTitle(properties: Record<string, NotionProperty>) {
  const property = properties.Name ?? findProperty(properties, "title");

  if (!isTitleProperty(property)) {
    return "Untitled";
  }

  return richTextToPlainText(property.title) || "Untitled";
}

function toProject(page: NotionPage): Project {
  return {
    id: page.id,
    title: getTitle(page.properties),
    description: getPlainText(page.properties, ["Description", "Summary", "Short Description", "Excerpt"]),
    intro: getPlainText(page.properties, ["Intro", "Introduction"]),
    year: getPlainText(page.properties, ["Year", "Launch Year", "Date"]),
    logoUrl: getFirstUrl(page.properties, ["Logo URL", "Logo Url", "Logo", "Icon"]),
    imageUrls: getUrls(page.properties, ["Image URLs", "Image Urls", "Images", "Image URL", "Image Url", "Image"]),
    link: getFirstUrl(page.properties, ["Link", "URL", "Url", "Website", "Site"]),
    status: getPlainText(page.properties, ["Status", "State"]),
    hasContent: false,
  };
}

export function isStealthProject(project: Project) {
  return project.status.toLowerCase() === "stealth";
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

  if (isStatusProperty(property)) {
    return property.status?.name ?? "";
  }

  if (isNumberProperty(property)) {
    return property.number === null ? "" : String(property.number);
  }

  if (isDateProperty(property)) {
    return property.date?.start ?? "";
  }

  return "";
}

function getFirstUrl(properties: Record<string, NotionProperty>, names: string[]) {
  return getUrls(properties, names)[0] ?? null;
}

function getUrls(properties: Record<string, NotionProperty>, names: string[]) {
  const property = getNamedProperty(properties, names);

  if (isUrlProperty(property)) {
    return sanitizeUrls([property.url]);
  }

  if (isFilesProperty(property)) {
    return sanitizeUrls(property.files.map((file) => file.external?.url ?? file.file?.url ?? null));
  }

  if (isRichTextProperty(property)) {
    return sanitizeUrls(splitUrls(richTextToPlainText(property.rich_text)));
  }

  return [];
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

function isUrlProperty(property: NotionProperty | undefined): property is { type: "url"; url: string | null } {
  return property?.type === "url";
}

function isFilesProperty(property: NotionProperty | undefined): property is { type: "files"; files: NotionFile[] } {
  return property?.type === "files" && Array.isArray(property.files);
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

function isDateProperty(property: NotionProperty | undefined): property is { type: "date"; date: { start?: string | null } | null } {
  return property?.type === "date";
}

function sortProjectsByYearDesc(projects: Project[]) {
  return [...projects].sort((a, b) => toYearNumber(b.year) - toYearNumber(a.year));
}

function toYearNumber(value: string) {
  const match = value.match(/\d{4}/);

  return match ? Number(match[0]) : 0;
}

function toProjectBlock(block: NotionBlock): Omit<ProjectBlock, "children"> {
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

function toRichText(value: unknown): ProjectRichText[] {
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
