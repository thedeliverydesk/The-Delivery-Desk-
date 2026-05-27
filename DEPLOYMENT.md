# Vercel Hobby deployment

Use Vercel Hobby while the site is being tested. Upgrade before running the site as a live commercial lead-generation site.

## Deploy from Vercel

1. Create a GitHub repository for this folder.
2. Push the project to GitHub.
3. In Vercel, choose **Add New Project**.
4. Import the repository.
5. Framework preset: **Other**.
6. Build command: `npm run build`.
7. Output directory: leave blank.
8. Deploy.

## Cost-control setup

- Start on Vercel Hobby for prototype/testing.
- Upgrade to Pro or move to Cloudflare Pages before paid ads or live lead collection.
- Keep lead capture low-cost by sending forms into Google Sheets first.
- Use Genie for follow-up/qualification if it can read or receive the sheet/form leads.

## URL structure

- Service overview: `/same-day-delivery`
- Local page: `/same-day-delivery/manchester`
- Service guide: `/same-day-delivery/issues-solutions`
- Location hub: `/locations/manchester`
- Guide hub: `/insights`
- Sea freight overview: `/sea-freight-container-logistics`
- Sea freight local page: `/sea-freight-container-logistics/london`

## Public indexing note

Vercel Deployment Protection / Vercel Authentication must be switched off before Google can crawl the site. If it is left on, public checks will return `401 Unauthorized` and Vercel will send `X-Robots-Tag: noindex`.

## Next setup step

Replace prototype browser-local lead storage with Google Sheets routing before the site is used for real enquiries.

For sitemap generation on the live domain, add a Vercel environment variable:

`SITE_URL=https://your-domain.co.uk`

For Google Sheets lead routing, add the Apps Script web app URL to `script.js` as `DELIVERY_DESK_LEAD_ENDPOINT`, or inject it before `script.js` loads.
