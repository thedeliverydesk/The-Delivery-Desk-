# Vercel Hobby deployment

Production domain: `https://thedeliverydesk.co.uk`

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
- Send new enquiry alerts to `andy@svmk.co.uk`.
- Keep working setup files in the shared Drive folder: `https://drive.google.com/drive/folders/1kJmxRjpcgwWjP00Nht1NxiMsL7Gl0Wfd?usp=sharing`

## URL structure

- Service overview: `/same-day-delivery`
- Local page: `/same-day-delivery/manchester`
- Service guide: `/same-day-delivery/issues-solutions`
- Location hub: `/locations/manchester`
- Guide hub: `/insights`
- Partner application: `/partners`
- Customer account preview: `/customer-account`
- Sea freight overview: `/sea-freight-container-logistics`
- Sea freight local page: `/sea-freight-container-logistics/london`

## Public indexing note

Vercel Deployment Protection / Vercel Authentication must be switched off before Google can crawl the site. If it is left on, public checks will return `401 Unauthorized` and Vercel will send `X-Robots-Tag: noindex`.

## Next setup step

Replace browser-local enquiry storage with Google Sheets routing before the site is used for real enquiries.

For sitemap generation on the live domain, add a Vercel environment variable:

`SITE_URL=https://thedeliverydesk.co.uk`

The generator defaults to this production URL, but the Vercel environment variable should still be set so preview/local overrides are explicit. The `www` host should redirect permanently to the apex domain.

For Google Sheets lead routing, add the Apps Script web app URL to Vercel as `LEAD_WEBHOOK_URL`. The Apps Script should append rows to the lead sheet and send an email notification to `andy@svmk.co.uk`.

## Lead routing variables

The live forms now post to `/api/leads`. Add the routing variables in Vercel before using the site for real enquiries:

- `LEAD_WEBHOOK_URL` for the Google Apps Script web app URL.
- `LEAD_WEBHOOK_SECRET` if the Apps Script checks a shared secret.
- `GENIE_WEBHOOK_URL` if leads should also go into Genie / HighLevel.
- `GENIE_API_KEY` if Genie requires a bearer token.
- `RESEND_API_KEY`, `LEAD_EMAIL_FROM` and `LEAD_EMAIL_TO` if using direct Resend email alerts.

See `LEAD_ROUTING.md` for the full setup.

## SEO launch checklist

1. Confirm the production deployment is public: Vercel Deployment Protection / Vercel Authentication off, no `X-Robots-Tag: noindex` on public pages.
2. Confirm DNS: `thedeliverydesk.co.uk` points at Vercel, `www.thedeliverydesk.co.uk` is added in Vercel and redirects to `https://thedeliverydesk.co.uk`.
3. Confirm Vercel environment variables: `SITE_URL=https://thedeliverydesk.co.uk`, plus the lead routing variables above.
4. Run `npm run build` and `npm run check` before deployment. The audit fails if canonicals, `robots.txt` or `sitemap.xml` still reference the temporary Vercel host.
5. After deployment, spot-check:
   - `https://thedeliverydesk.co.uk/robots.txt`
   - `https://thedeliverydesk.co.uk/sitemap.xml`
   - `https://thedeliverydesk.co.uk/`
   - one service page, one location page and one service-location page.
6. In Google Search Console, add the Domain property for `thedeliverydesk.co.uk`. Verify it with the DNS TXT record.
7. Submit `https://thedeliverydesk.co.uk/sitemap.xml` in Search Console.
8. Use URL Inspection on the homepage, `/same-day-delivery`, `/locations/manchester`, and one deep page such as `/same-day-delivery/manchester`; confirm each is indexable and Google-selected canonical matches the submitted canonical.
9. Request indexing for the homepage and the priority service pages after inspection passes.
10. Recheck Coverage/Pages and Sitemaps in Search Console after the first crawl cycle. Fix any discovered `404`, duplicate canonical, blocked by robots, or alternate page issues before adding more content.
