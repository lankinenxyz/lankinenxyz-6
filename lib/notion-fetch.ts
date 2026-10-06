import "server-only";

const notionApiVersion = "2022-06-28";
const revalidateSeconds = 300;

// Notion rate limits to ~3 requests/s per integration. A deploy prerenders every page at once and a
// cold image cache resolves dozens of images in parallel, so bursts get 429s. Pages catch fetch
// errors and render an "unavailable" state, which ISR then caches, so retrying here is what keeps a
// transient rate limit from becoming a broken page for the whole revalidation window.
const maxRetries = 4;
const baseDelayMs = 500;
const maxDelayMs = 8000;

export class NotionRequestError extends Error {
  constructor(readonly status: number) {
    super(`Notion request failed: ${status}`);
  }
}

export async function notionFetch<T>(token: string, path: string, init: RequestInit): Promise<T> {
  for (let attempt = 0; ; attempt++) {
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

    if (response.ok) {
      return (await response.json()) as T;
    }

    if (attempt >= maxRetries || !isRetryable(response.status)) {
      throw new NotionRequestError(response.status);
    }

    await sleep(getRetryDelayMs(response, attempt));
  }
}

function isRetryable(status: number) {
  return status === 429 || status >= 500;
}

function getRetryDelayMs(response: Response, attempt: number) {
  const retryAfterSeconds = Number(response.headers.get("retry-after"));

  if (Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0) {
    return Math.min(retryAfterSeconds * 1000, maxDelayMs);
  }

  // Jitter spreads out requests that were rate limited together so they don't retry in lockstep.
  return Math.min(baseDelayMs * 2 ** attempt, maxDelayMs) * (0.5 + Math.random());
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
