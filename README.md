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

## Analytics

The root layout renders `<GoogleAnalytics />` from `@next/third-parties/google`. Measurement IDs ship in the page HTML, so the ID lives in `app/layout.tsx` rather than in an env var. Traffic is read in the Google Analytics UI; the site itself does not query the GA4 Data API.

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

The database should have a `Name` title property, a `Visibility` select property, plus project fields for `Intro`, `Description`, `Year`, `Logo URL`, `Image URLs`, `Link`, and optional `Status` and `Profit`. Optional URL fields can be Notion URL properties, rich text with comma/newline-separated URLs, or files properties for images. Project cards are sorted by newest `Year` first, show their `Status` as a tag, show `Profit` as a euro amount when that number is set, and open their own page only when the Notion page has body content.

`Visibility` controls how much of each project is exposed:

| Value | Behaviour |
| --- | --- |
| `Everything` | The full card is shown, and it opens a detail page when the Notion page has body content. |
| `Title` | The name, year, status, intro, and profit are shown. Description, images, and link are withheld, and the card does not open a detail page. |
| `Hidden` | The name is replaced with asterisks and the logo is dropped, and the intro and profit are withheld too, so only the year and status remain. |

Any other value, including a blank cell or a renamed column, is treated as `Hidden`. Only `Everything` projects are reachable at `/projects/<id>`; the rest return a 404 even when the URL is known.

## Investing

The `/other/investing` page reads from two Notion databases. Share both databases with your Notion integration, then add these values to `.env.local`:

```env
NOTION_INVESTING_MARKET_ANALYSIS_DATABASE_ID=replace-with-market-analysis-database-id
NOTION_INVESTING_STOCKS_DATABASE_ID=replace-with-stocks-database-id
```

The market analysis database should have `Name` and `Description` properties. Optional `Date` and `Link` properties are also supported. Clicking a market analysis item opens its own page, with full content rendered from the Notion page body blocks.

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

## Fitness

The `/other/fitness` page reads fitness content from a Notion database. Share the database with your Notion integration, then add this value to `.env.local`:

```env
NOTION_FITNESS_DATABASE_ID=replace-with-fitness-database-id
```

A practical fitness database structure is:

| Property | Type | Required | Notes |
| --- | --- | --- | --- |
| `Name` | Title | Yes | Workout, routine, program, or log title. |
| `Status` | Status or select | Recommended | If present, only entries with `Published` are shown. If omitted, all entries are shown. |
| `Date` | Date | Optional | Useful for workout logs, progress updates, or routine changes. |
| `Category` | Select | Optional | Example values: `Routine`, `Workout`, `Recovery`, `Progress`, `Nutrition`. |
| `Description` | Rich text | Optional | Preview text for a future list/grid page. Also consider `Summary` or `Excerpt`. |
| `Image` | Files, URL, rich text URL, or page cover | Optional | Main visual if the Fitness page becomes image-based. |

The full entry content is rendered from each Notion page body blocks, matching Notes, Travel, and Watches.

## Books

The `/hobbies/books` page reads books from a Notion database. Share the database with your Notion integration, then add this value to `.env.local`:

```env
NOTION_BOOKS_DATABASE_ID=replace-with-books-database-id
```

The books database should have this structure:

| Property | Type | Required | Notes |
| --- | --- | --- | --- |
| `Name` | Title | Yes | Book title. |
| `Read` | Checkbox | Yes | Only books where `Read` is checked are shown. |
| `Author` | Rich text, title, or select | Recommended | Displayed below the title on hover. Also supports `Authors`. |
| `Rating` | Rich text, select, or number | Optional | Displayed as a small chip on hover. Also supports `Score`. |
| `Tags` | Multi-select, select, or rich text | Optional | Displayed as small chips on hover. Also supports `Tag`, `Genres`, `Genre`, or `Category`. |
| `Description` | Rich text | Optional | Short hover description. Also supports `Summary` or `Notes`. |
| `Image` | Files, URL, rich text URL, or page cover | Recommended | Book cover image for the grid. Also supports `Images`, `Photo`, `Picture`, or `Cover`. |
| `Year` | Rich text, select, number, or date | Optional | The year you read the book. This page uses `Year`, not `Date`, for grouping and sorting. |

Read books are grouped by read year, sorted newest first, and books without a year are shown under `Year unknown` at the bottom.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
