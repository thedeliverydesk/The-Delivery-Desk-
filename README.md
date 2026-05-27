# The Delivery Desk prototype

Static first version of the SVMK lead-generation site.

## Files

- `index.html` - homepage with service blocks, local page selector and lead form.
- `landing.html` - reusable local-service landing page template.
- `styles.css` - responsive layout and brand styling.
- `script.js` - service/city data, local landing page rendering and prototype lead storage.
- `assets/logistics-hero.png` - generated hero image for the homepage.
- `thank-you.html` - prototype confirmation page after form submission.
- `admin.html` - browser-local prototype lead viewer and CSV export.
- `generate-pages.js` - static page generator for service and city pages.
- `vercel.json` - Vercel clean URL, redirect and header configuration.
- `DEPLOYMENT.md` - Vercel Hobby deployment checklist.

## Current behaviour

The lead form stores prototype enquiries in browser `localStorage` under `deliveryDeskLeads`.

Local pages are generated as folder-based SEO paths, for example:

`same-day-delivery/manchester/`

Service overview pages are generated too, for example:

`same-day-delivery/index.html`

For local file preview, links point directly to:

`same-day-delivery/manchester/index.html`

When moved to Next.js, these should become proper SEO URLs such as:

`/same-day-delivery/manchester`

Also prioritise:

`/white-glove-2-man-delivery/manchester`

## Next build steps

1. Move the static content model into Next.js.
2. Add real lead routing to Google Sheets, Genie, email or a database.
3. Generate service and town/city routes from structured data.
4. Add sitemap, metadata, analytics and conversion tracking.
5. Expand copy for priority commercial locations first.
