import "server-only";

const notionApiVersion = "2022-06-28";
const revalidateSeconds = 300;

const placeholderValues = new Set([
  "",
  "replace-with-notion-integration-token",
  "replace-with-market-analysis-database-id",
  "replace-with-stocks-database-id",
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
  | { type: "number"; number: number | null }
  | { type: "url"; url: string | null }
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

export type InvestingRichText = {
  text: string;
  href: string | null;
  bold: boolean;
  italic: boolean;
  strikethrough: boolean;
  underline: boolean;
  code: boolean;
};

export type InvestingBlock = {
  id: string;
  type: string;
  richText: InvestingRichText[];
  imageUrl?: string;
  language?: string;
  children: InvestingBlock[];
};

export type MarketAnalysis = {
  id: string;
  name: string;
  description: string;
  date: string | null;
  link: string | null;
  content?: InvestingBlock[];
};

export type Stock = {
  id: string;
  name: string;
  ticker: string;
  date: string | null;
  price: number | null;
  currency: string;
  description: string;
};

export type InvestingData = {
  marketAnalysis: MarketAnalysis[];
  stocks: Stock[];
};

export async function getInvestingData(): Promise<InvestingData> {
  const token = process.env.NOTION_API_KEY?.trim() ?? "";
  const marketAnalysisDatabaseId = process.env.NOTION_INVESTING_MARKET_ANALYSIS_DATABASE_ID?.trim() ?? "";
  const stocksDatabaseId = process.env.NOTION_INVESTING_STOCKS_DATABASE_ID?.trim() ?? "";

  const [marketAnalysis, stocks] = await Promise.all([
    isConfigured(token, marketAnalysisDatabaseId) ? getMarketAnalysis(token, marketAnalysisDatabaseId) : [],
    isConfigured(token, stocksDatabaseId) ? getStocks(token, stocksDatabaseId) : [],
  ]);

  return { marketAnalysis, stocks };
}

export async function getMarketAnalysisEntry(id: string): Promise<MarketAnalysis | null> {
  const token = process.env.NOTION_API_KEY?.trim() ?? "";
  const databaseId = process.env.NOTION_INVESTING_MARKET_ANALYSIS_DATABASE_ID?.trim() ?? "";

  if (!isConfigured(token, databaseId)) {
    return null;
  }

  const page = await getPage(token, id);

  return {
    ...toMarketAnalysis(page),
    content: await getBlockChildren(token, page.id),
  };
}

async function getMarketAnalysis(token: string, databaseId: string): Promise<MarketAnalysis[]> {
  const pages = await queryDatabase(token, databaseId);

  return sortByDateAsc(pages.map(toMarketAnalysis));
}

async function getStocks(token: string, databaseId: string): Promise<Stock[]> {
  const pages = await queryDatabase(token, databaseId);

  return sortByDateAsc(
    pages.map((page) => ({
      id: page.id,
      name: getTitle(page.properties),
      ticker: getPlainText(page.properties, ["Ticker", "Symbol"]),
      date: getDate(page.properties),
      price: getNumber(page.properties, ["Price", "Cost", "Entry Price"]),
      currency: getChoice(page.properties, ["Currency", "Ccy"]),
      description: getPlainText(page.properties, ["Description", "Thesis", "Notes"]),
    })),
  );
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

async function getBlockChildren(token: string, blockId: string): Promise<InvestingBlock[]> {
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
      ...toInvestingBlock(block),
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
    throw new Error(`Notion request failed: ${response.status} ${await response.text()}`);
  }

  return (await response.json()) as T;
}

function sortByDateAsc<T extends { date: string | null }>(items: T[]) {
  return [...items].sort((a, b) => toTimestamp(a.date) - toTimestamp(b.date));
}

function toTimestamp(value: string | null) {
  if (!value) {
    return 0;
  }

  const timestamp = new Date(value).getTime();

  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function getTitle(properties: Record<string, NotionProperty>) {
  const property = properties.Name ?? findProperty(properties, "title");

  if (!isTitleProperty(property)) {
    return "Untitled";
  }

  return richTextToPlainText(property.title) || "Untitled";
}

function toMarketAnalysis(page: NotionPage): MarketAnalysis {
  return {
    id: page.id,
    name: getTitle(page.properties),
    description: getPlainText(page.properties, ["Description", "Summary"]),
    date: getDate(page.properties),
    link: getUrl(page.properties, ["Link", "URL", "Url"]),
  };
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
  const property = getNamedProperty(properties, ["Date", "Invested Date", "Published"]);

  if (!isDateProperty(property)) {
    return null;
  }

  return property.date?.start ?? null;
}

function getNumber(properties: Record<string, NotionProperty>, names: string[]) {
  const property = getNamedProperty(properties, names);

  if (!isNumberProperty(property)) {
    return null;
  }

  return property.number;
}

function getChoice(properties: Record<string, NotionProperty>, names: string[]) {
  const property = getNamedProperty(properties, names);

  if (isSelectProperty(property)) {
    return property.select?.name ?? "";
  }

  if (isStatusProperty(property)) {
    return property.status?.name ?? "";
  }

  if (isRichTextProperty(property)) {
    return richTextToPlainText(property.rich_text);
  }

  return "";
}

function getUrl(properties: Record<string, NotionProperty>, names: string[]) {
  const property = getNamedProperty(properties, names);

  if (isUrlProperty(property)) {
    return property.url && /^https?:\/\//i.test(property.url) ? property.url : null;
  }

  if (isRichTextProperty(property)) {
    const value = richTextToPlainText(property.rich_text);

    return /^https?:\/\//i.test(value) ? value : null;
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

function isNumberProperty(property: NotionProperty | undefined): property is { type: "number"; number: number | null } {
  return property?.type === "number";
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

function toInvestingBlock(block: NotionBlock): Omit<InvestingBlock, "children"> {
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

function toRichText(value: unknown): InvestingRichText[] {
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
