import "server-only";

const notionApiVersion = "2022-06-28";
const revalidateSeconds = 300;

const placeholderValues = new Set([
  "",
  "replace-with-notion-integration-token",
  "replace-with-notes-database-id",
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

type NotionProperty =
  | { type: "title"; title: NotionRichText[] }
  | { type: "rich_text"; rich_text: NotionRichText[] }
  | { type: "date"; date: { start?: string | null } | null }
  | { type: "select"; select: { name?: string } | null }
  | { type: "status"; status: { name?: string } | null }
  | { type: string; [key: string]: unknown };

type NotionPage = {
  id: string;
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

export type NoteRichText = {
  text: string;
  href: string | null;
  bold: boolean;
  italic: boolean;
  strikethrough: boolean;
  underline: boolean;
  code: boolean;
};

export type NoteBlock = {
  id: string;
  type: string;
  richText: NoteRichText[];
  language?: string;
  children: NoteBlock[];
};

export type Note = {
  id: string;
  name: string;
  description: string;
  date: string | null;
  content: NoteBlock[];
};

export type NoteSummary = Omit<Note, "content">;

export async function getNotes(): Promise<NoteSummary[]> {
  const token = process.env.NOTION_API_KEY?.trim() ?? "";
  const databaseId = process.env.NOTION_NOTES_DATABASE_ID?.trim() ?? "";

  if (!isConfigured(token, databaseId)) {
    return [];
  }

  const pages = await queryDatabase(token, databaseId);

  return pages.filter(isPublished).map(toNoteSummary);
}

export async function getNote(id: string): Promise<Note | null> {
  const token = process.env.NOTION_API_KEY?.trim() ?? "";
  const databaseId = process.env.NOTION_NOTES_DATABASE_ID?.trim() ?? "";

  if (!isConfigured(token, databaseId)) {
    return null;
  }

  const page = await getPage(token, id);

  if (!isPublished(page)) {
    return null;
  }

  return {
    ...toNoteSummary(page),
    content: await getPageContent(token, page.id),
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
        sorts: [
          {
            property: "Date",
            direction: "descending",
          },
        ],
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

async function getPageContent(token: string, pageId: string) {
  return getBlockChildren(token, pageId);
}

async function getBlockChildren(token: string, blockId: string): Promise<NoteBlock[]> {
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
      ...toNoteBlock(block),
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

function toNoteSummary(page: NotionPage): NoteSummary {
  return {
    id: page.id,
    name: getTitle(page.properties),
    description: getPlainText(page.properties, ["Description", "Summary", "Excerpt"]),
    date: getDate(page.properties),
  };
}

function isPublished(page: NotionPage) {
  return getStatus(page.properties).toLowerCase() === "published";
}

function getStatus(properties: Record<string, NotionProperty>) {
  const property = getNamedProperty(properties, ["Status", "State", "Published"]);

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

  return "";
}

function getDate(properties: Record<string, NotionProperty>) {
  const property = properties.Date ?? findProperty(properties, "date");

  if (!isDateProperty(property)) {
    return null;
  }

  return property.date?.start ?? null;
}

function findProperty(properties: Record<string, NotionProperty>, type: string) {
  return Object.values(properties).find((property) => property.type === type);
}

function getNamedProperty(properties: Record<string, NotionProperty>, names: string[]) {
  return names.map((name) => properties[name]).find(Boolean);
}

function isTitleProperty(property: NotionProperty | undefined): property is { type: "title"; title: NotionRichText[] } {
  return property?.type === "title" && Array.isArray(property.title);
}

function isDateProperty(
  property: NotionProperty | undefined,
): property is { type: "date"; date: { start?: string | null } | null } {
  return property?.type === "date";
}

function isRichTextProperty(property: NotionProperty | undefined): property is { type: "rich_text"; rich_text: NotionRichText[] } {
  return property?.type === "rich_text" && Array.isArray(property.rich_text);
}

function isSelectProperty(property: NotionProperty | undefined): property is { type: "select"; select: { name?: string } | null } {
  return property?.type === "select";
}

function isStatusProperty(property: NotionProperty | undefined): property is { type: "status"; status: { name?: string } | null } {
  return property?.type === "status";
}

function toNoteBlock(block: NotionBlock): Omit<NoteBlock, "children"> {
  const value = block[block.type];
  const record = isRecord(value) ? value : {};

  return {
    id: block.id,
    type: block.type,
    richText: toRichText(record.rich_text),
    language: typeof record.language === "string" ? record.language : undefined,
  };
}

function toRichText(value: unknown): NoteRichText[] {
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
