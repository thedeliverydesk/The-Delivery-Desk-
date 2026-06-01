# The Delivery Desk prototype

Static first version of the SVMK lead-generation site.

Production domain: `https://thedeliverydesk.co.uk`

The current build generates 1,280 local service landing pages across 8 logistics services and 160 UK city/town markets. It also generates 160 location hub pages, 8 issues-and-solutions guide pages, 7 sector pages, a guide index, a location index, a sector index and an authority page explaining how The Delivery Desk qualifies enquiries.

## Files

- `index.html` - homepage with service blocks, local page selector and lead form.
- `landing.html` - reusable local-service landing page template.
- `styles.css` - responsive layout and brand styling.
- `script.js` - service/city data, local landing page rendering, enquiry storage and account preview behaviour.
- `assets/logistics-hero.png` - generated hero image for the homepage.
- `thank-you.html` - confirmation page after form submission.
- `privacy.html` - plain-English enquiry privacy notice.
- `admin.html` - browser-local enquiry viewer and CSV export.
- `partners/index.html` - partner network application page.
- `partner-login/index.html` - partner account preview.
- `customer-account/index.html` - customer account preview.
- `terms.html`, `cookies.html` - legal support pages.
- `generate-pages.js` - static page generator for service and city pages.
- `audit-site.js` - static QA script for titles, descriptions, internal links, anchors, sitemap checks and JSON-LD.
- `api/leads.mjs` - Vercel lead routing endpoint for enquiries, partner applications, Google Apps Script, Genie and email alerts.
- `LEAD_ROUTING.md` - setup notes for Google Sheets, Genie and email routing.
- `COMPETITOR_SEO_NOTES.md` - market positioning notes from competitor research.
- `SEO_CONVERSION_NOTES.md` - working SEO and conversion brief.
- `vercel.json` - Vercel clean URL, redirect and header configuration.
- `DEPLOYMENT.md` - Vercel Hobby deployment checklist.
- `sitemap.xml`, `robots.txt`, `404.html` - generated deployment support files.

## Current behaviour

The lead form stores browser-local enquiries under `deliveryDeskLeads` while the site is being tested. It can also post to a Google Apps Script or lead handoff endpoint if `DELIVERY_DESK_LEAD_ENDPOINT` is injected before `script.js` loads.

Inbound enquiry email: `andy@svmk.co.uk`

Shared Drive folder for working lead assets and setup documents:

`https://drive.google.com/drive/folders/1kJmxRjpcgwWjP00Nht1NxiMsL7Gl0Wfd?usp=sharing`

Local pages are generated as folder-based SEO paths, for example:

`same-day-delivery/manchester/`

Service overview pages are generated too, for example:

`same-day-delivery/index.html`

Issues-and-solutions guide pages are generated for each service:

`same-day-delivery/issues-solutions/index.html`

Location hub pages are generated too:

`locations/manchester/index.html`

Sector pages are generated too:

`sectors/ecommerce/index.html`

For local file preview, links point directly to:

`same-day-delivery/manchester/index.html`

When moved to Next.js, these should become proper SEO URLs such as:

`/same-day-delivery/manchester`

Also prioritise:

`/white-glove-2-man-delivery/manchester`

## Next build steps

1. Add real lead routing to Google Sheets and email alerts to `andy@svmk.co.uk`.
2. Add analytics, call tracking and conversion events.
3. Disable Vercel Deployment Protection before public indexing.
4. Hand-polish the highest-value city/service pages first.
5. Hand-expand priority sector pages with proof, examples and stronger commercial CTAs.
