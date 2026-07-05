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

The database should have a `Name` title property and a `Date` date property. The note content is rendered from each Notion page's blocks.

## Projects

The `/projects` page reads projects from a Notion database. Share the database with your Notion integration, then add this value to `.env.local`:

```env
NOTION_PROJECTS_DATABASE_ID=replace-with-projects-database-id
```

The database should have a `Name` title property plus project fields for `Description`, `Logo URL`, `Image URLs`, `Link`, and `Status`. Optional URL fields can be Notion URL properties, rich text with comma/newline-separated URLs, or files properties for images.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
