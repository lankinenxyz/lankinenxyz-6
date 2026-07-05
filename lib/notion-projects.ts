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

export type Project = {
  id: string;
  title: string;
  description: string;
  logoUrl: string | null;
  imageUrls: string[];
  link: string | null;
  status: string;
};

export async function getProjects(): Promise<Project[]> {
  const token = process.env.NOTION_API_KEY?.trim() ?? "";
  const databaseId = process.env.NOTION_PROJECTS_DATABASE_ID?.trim() ?? "";

  if (!isConfigured(token, databaseId)) {
    return [];
  }

  const pages = await queryDatabase(token, databaseId);

  return pages.map((page) => ({
    id: page.id,
    title: getTitle(page.properties),
    description: getPlainText(page.properties, ["Description", "Summary"]),
    logoUrl: getFirstUrl(page.properties, ["Logo URL", "Logo Url", "Logo", "Icon"]),
    imageUrls: getUrls(page.properties, ["Image URLs", "Image Urls", "Images", "Image URL", "Image Url", "Image"]),
    link: getFirstUrl(page.properties, ["Link", "URL", "Url", "Website", "Site"]),
    status: getStatus(page.properties),
  }));
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

function getPlainText(properties: Record<string, NotionProperty>, names: string[]) {
  const property = getNamedProperty(properties, names);

  if (isRichTextProperty(property)) {
    return richTextToPlainText(property.rich_text);
  }

  if (isTitleProperty(property)) {
    return richTextToPlainText(property.title);
  }

  return "";
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

function richTextToPlainText(value: NotionRichText[]) {
  return value.map((item) => item.plain_text ?? "").join("").trim();
}

function splitUrls(value: string) {
  return value.split(/[\n,]+/).map((item) => item.trim());
}

function sanitizeUrls(urls: Array<string | null | undefined>) {
  return urls.filter((url): url is string => Boolean(url && /^https?:\/\//i.test(url))).map((url) => url.trim());
}
