# Lead routing setup

The site now posts customer enquiries and partner applications to `/api/leads`.

That Vercel endpoint can forward each lead to:

- Google Apps Script for Google Sheets and email alerts.
- Genie through an inbound webhook.
- Resend for direct email alerts.

## Vercel environment variables

Add these in Vercel project settings, then redeploy.

Required for Google Sheets/email through Apps Script:

- `LEAD_WEBHOOK_URL` - the Google Apps Script web app URL.
- `LEAD_WEBHOOK_SECRET` - optional shared secret. Use the same value in Apps Script properties.

Optional for Genie:

- `GENIE_WEBHOOK_URL` - Genie or HighLevel inbound webhook URL.
- `GENIE_API_KEY` - optional bearer token if Genie requires one.

Optional direct email through Resend:

- `RESEND_API_KEY`
- `LEAD_EMAIL_FROM`
- `LEAD_EMAIL_TO` - defaults to `andy@svmk.co.uk`.

## Google Apps Script

1. Create a Google Sheet for The Delivery Desk leads.
2. In Google Drive, create a new Apps Script project.
3. Paste `google-apps-script/lead-router.gs` into `Code.gs`.
4. In Apps Script, add script properties:
   - `LEAD_SHEET_ID` - the spreadsheet ID from the Google Sheet URL.
   - `LEAD_EMAIL_TO` - usually `andy@svmk.co.uk`.
   - `LEAD_WEBHOOK_SECRET` - optional, but recommended.
5. Deploy as a web app:
   - Execute as: Me.
   - Who has access: Anyone.
6. Copy the web app URL into Vercel as `LEAD_WEBHOOK_URL`.

The script creates separate tabs:

- `Customer Enquiries`
- `Partner Applications`

## Genie / HighLevel

Create an inbound webhook workflow in Genie. Put the webhook URL in Vercel as `GENIE_WEBHOOK_URL`.

The endpoint sends:

- `contact` - name, email, phone, company.
- `opportunity` - reference, lead type, service, area, volume/value and notes.
- `customFields` - the full raw lead payload.
