This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Visitor Globe

The home page includes a lightweight marker-based globe for countries that have visited the site in the last 30 days. Exact visitor counts are never sent to the browser; the API only returns country markers and coarse intensity buckets.

Create `.env.local` from `.env.local.example` and fill in the GA4 Data API values:

```env
GA4_PROPERTY_ID=replace-with-numeric-property-id
GOOGLE_CLIENT_EMAIL=replace-with-service-account-email
GOOGLE_PRIVATE_KEY="replace-with-service-account-private-key"
```

`G-D2MFN50BT9` is the Google Analytics Measurement ID. The server-side Data API also needs the numeric GA4 Property ID and a service account with access to that property.

## Notes

The `/notes` page reads notes from a Notion database. Share the database with your Notion integration, then add these values to `.env.local`:

```env
NOTION_API_KEY=replace-with-notion-integration-token
NOTION_NOTES_DATABASE_ID=replace-with-notes-database-id
```

The database should have a `Name` title property, a `Date` date property, and a `Status` status/select property. Only notes with `Status` set to `Published` are shown. Optional `Description`, `Summary`, or `Excerpt` properties are shown as the preview text on the notes index. The full note content is rendered from each Notion page's blocks on its own detail page.

## Projects

The `/projects` page reads projects from a Notion database. Share the database with your Notion integration, then add this value to `.env.local`:

```env
NOTION_PROJECTS_DATABASE_ID=replace-with-projects-database-id
```

The database should have a `Name` title property plus project fields for `Description`, `Logo URL`, `Image URLs`, `Link`, and `Status`. Optional URL fields can be Notion URL properties, rich text with comma/newline-separated URLs, or files properties for images.

## Investing

The `/other/investing` page reads from two Notion databases. Share both databases with your Notion integration, then add these values to `.env.local`:

```env
NOTION_INVESTING_MARKET_ANALYSIS_DATABASE_ID=replace-with-market-analysis-database-id
NOTION_INVESTING_STOCKS_DATABASE_ID=replace-with-stocks-database-id
```

The market analysis database should have `Name` and `Description` properties. Optional `Date` and `Link` properties are also supported.

The stocks database should have `Name`, `Ticker`, `Date`, `Price`, `Currency`, and `Description` properties. `Currency` can be a select, status, or rich text property.

## Travel

The `/other/travel` page reads travel destinations from a Notion database. Share the database with your Notion integration, then add this value to `.env.local`:

```env
NOTION_TRAVEL_DATABASE_ID=replace-with-travel-database-id
```

The travel database should have this structure:

| Property | Type | Required | Notes |
| --- | --- | --- | --- |
| `Name` | Title | Yes | Destination title. Can be the city name, e.g. `Tokyo`. |
| `City` | Rich text or title | Yes | Displayed on hover and detail pages. Falls back to `Name` if empty. |
| `Country` | Rich text or select | Recommended | Displayed below the city. |
| `Image` | Files, URL, or rich text URL | Recommended | Main grid image. Also supports `Images`, `Photo`, `Picture`, `Cover`, or the Notion page cover. |
| `Month` | Rich text, select, number, or date | Optional | Use values like `Jan`, `January`, or `01`. Can be empty if unknown. |
| `Year` | Rich text, select, number, or date | Optional | Use values like `2024`. Can be empty if unknown. |

The page content shown after opening a destination comes from the Notion page body blocks.

## Watches

The `/other/watches` page reads watches from a Notion database. Share the database with your Notion integration, then add this value to `.env.local`:

```env
NOTION_WATCHES_DATABASE_ID=replace-with-watches-database-id
```

The watches database should have this structure:

| Property | Type | Required | Notes |
| --- | --- | --- | --- |
| `Name` | Title | Yes | Watch name or reference, e.g. `Omega Speedmaster Professional`. |
| `Image` | Files, URL, or rich text URL | Recommended | Main grid image. Also supports `Images`, `Photo`, `Picture`, `Cover`, `Watch Picture`, or the Notion page cover. |
| `Year` | Rich text, select, number, or date | Optional | Year you got the watch, e.g. `2024`. Also supports `Acquired Year`, `Purchased Year`, or `Got Year`. |

The page content shown after opening a watch comes from the Notion page body blocks. Use that body to explain how you got it, why it matters, or any collecting notes.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
