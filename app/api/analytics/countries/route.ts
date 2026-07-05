import { countryCoordinates } from "@/lib/country-coordinates";

type VisitorIntensity = "low" | "medium" | "high";

type AnalyticsCountry = {
  code: string;
  name: string;
  lat: number;
  lng: number;
  intensity: VisitorIntensity;
};

type GoogleAnalyticsRow = {
  dimensionValues?: Array<{ value?: string }>;
  metricValues?: Array<{ value?: string }>;
};

const placeholderValues = new Set([
  "",
  "replace-with-numeric-property-id",
  "replace-with-service-account-email",
  "replace-with-service-account-private-key",
]);

export const revalidate = 21600;

export async function GET() {
  const propertyId = process.env.GA4_PROPERTY_ID?.trim() ?? "";
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL?.trim() ?? "";
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.trim() ?? "";

  if (!isConfigured(propertyId, clientEmail, privateKey)) {
    return Response.json(
      {
        countries: [],
        configured: false,
        updatedAt: null,
      },
      {
        headers: {
          "Cache-Control": "public, max-age=300, s-maxage=300",
        },
      },
    );
  }

  try {
    const accessToken = await getAccessToken(clientEmail, privateKey);
    const rows = await fetchCountryRows(propertyId, accessToken);
    const countries = rows
      .map((row) => toAnalyticsCountry(row))
      .filter((country): country is AnalyticsCountry => country !== null)
      .sort((first, second) => first.name.localeCompare(second.name));

    return Response.json(
      {
        countries,
        configured: true,
        updatedAt: new Date().toISOString(),
      },
      {
        headers: {
          "Cache-Control": "public, max-age=0, s-maxage=21600, stale-while-revalidate=86400",
        },
      },
    );
  } catch (error) {
    console.error("Failed to load Google Analytics countries", error);

    return Response.json(
      {
        countries: [],
        configured: true,
        updatedAt: null,
        error: "analytics_unavailable",
      },
      {
        status: 502,
        headers: {
          "Cache-Control": "public, max-age=300, s-maxage=300",
        },
      },
    );
  }
}

function isConfigured(propertyId: string, clientEmail: string, privateKey: string) {
  return [propertyId, clientEmail, privateKey].every(
    (value) => !placeholderValues.has(value) && !value.startsWith("replace-with-"),
  );
}

function toAnalyticsCountry(row: GoogleAnalyticsRow): AnalyticsCountry | null {
  const code = row.dimensionValues?.[0]?.value?.toUpperCase() ?? "";
  const fallbackName = row.dimensionValues?.[1]?.value;
  const visitors = Number.parseInt(row.metricValues?.[0]?.value ?? "0", 10);
  const country = countryCoordinates[code as keyof typeof countryCoordinates];

  if (!country || Number.isNaN(visitors) || visitors < 1) {
    return null;
  }

  return {
    code: country.code,
    name: fallbackName && fallbackName !== "(not set)" ? fallbackName : country.name,
    lat: country.lat,
    lng: country.lng,
    intensity: getIntensity(visitors),
  };
}

function getIntensity(visitors: number): VisitorIntensity {
  if (visitors <= 2) {
    return "low";
  }

  if (visitors <= 10) {
    return "medium";
  }

  return "high";
}

async function fetchCountryRows(propertyId: string, accessToken: string) {
  const response = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
        dimensions: [{ name: "countryId" }, { name: "country" }],
        metrics: [{ name: "activeUsers" }],
        limit: 250,
      }),
      next: { revalidate: 21600 },
    },
  );

  if (!response.ok) {
    throw new Error(`GA4 Data API responded with ${response.status}`);
  }

  const data = (await response.json()) as { rows?: GoogleAnalyticsRow[] };

  return data.rows ?? [];
}

async function getAccessToken(clientEmail: string, privateKey: string) {
  const now = Math.floor(Date.now() / 1000);
  const assertion = await signJwt(
    {
      alg: "RS256",
      typ: "JWT",
    },
    {
      iss: clientEmail,
      scope: "https://www.googleapis.com/auth/analytics.readonly",
      aud: "https://oauth2.googleapis.com/token",
      exp: now + 60 * 60,
      iat: now,
    },
    privateKey,
  );

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
    next: { revalidate: 50 * 60 },
  });

  if (!response.ok) {
    throw new Error(`Google OAuth token request responded with ${response.status}`);
  }

  const data = (await response.json()) as { access_token?: string };

  if (!data.access_token) {
    throw new Error("Google OAuth token response did not include an access token");
  }

  return data.access_token;
}

async function signJwt(
  header: Record<string, string>,
  payload: Record<string, string | number>,
  privateKey: string,
) {
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const input = `${encodedHeader}.${encodedPayload}`;
  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToArrayBuffer(privateKey),
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256",
    },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(input),
  );

  return `${input}.${base64UrlEncode(signature)}`;
}

function pemToArrayBuffer(privateKey: string) {
  const pem = privateKey
    .replace(/\\n/g, "\n")
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\s/g, "");

  return Buffer.from(pem, "base64");
}

function base64UrlEncode(value: string | ArrayBuffer) {
  const buffer = typeof value === "string" ? Buffer.from(value) : Buffer.from(value);

  return buffer
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}
