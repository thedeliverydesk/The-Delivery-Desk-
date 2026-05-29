const DEFAULT_EMAIL_TO = "andy@svmk.co.uk";

function doPost(event) {
  const body = JSON.parse(event.postData.contents || "{}");
  const expectedSecret = PropertiesService.getScriptProperties().getProperty("LEAD_WEBHOOK_SECRET") || "";

  if (expectedSecret && body.secret !== expectedSecret) {
    return jsonResponse({ ok: false, error: "Unauthorized" }, 401);
  }

  const lead = body.lead || body;
  const sheetId = PropertiesService.getScriptProperties().getProperty("LEAD_SHEET_ID");
  if (!sheetId) {
    return jsonResponse({ ok: false, error: "Missing LEAD_SHEET_ID script property" }, 500);
  }

  const spreadsheet = SpreadsheetApp.openById(sheetId);
  const sheetName = lead.type === "partner" ? "Partner Applications" : "Customer Enquiries";
  const sheet = spreadsheet.getSheetByName(sheetName) || spreadsheet.insertSheet(sheetName);
  ensureHeaders(sheet, lead);
  appendLead(sheet, lead);
  sendLeadEmail(lead);

  return jsonResponse({ ok: true, reference: lead.reference, sheet: sheetName });
}

function ensureHeaders(sheet, lead) {
  const headers = Object.keys(flattenLead(lead));
  const existing = sheet.getLastColumn() ? sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].filter(Boolean) : [];
  const merged = Array.from(new Set([...existing, ...headers]));

  if (merged.length && merged.join("|") !== existing.join("|")) {
    sheet.getRange(1, 1, 1, merged.length).setValues([merged]);
    sheet.setFrozenRows(1);
  }
}

function appendLead(sheet, lead) {
  const flattened = flattenLead(lead);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].filter(Boolean);
  sheet.appendRow(headers.map((header) => flattened[header] || ""));
}

function flattenLead(lead) {
  return Object.keys(lead).reduce((flat, key) => {
    const value = lead[key];
    flat[key] = Array.isArray(value) ? value.join(", ") : value;
    return flat;
  }, {});
}

function sendLeadEmail(lead) {
  const to = PropertiesService.getScriptProperties().getProperty("LEAD_EMAIL_TO") || DEFAULT_EMAIL_TO;
  const subject = `${lead.type === "partner" ? "Partner application" : "Delivery enquiry"} ${lead.reference || ""}`;
  const lines = Object.entries(flattenLead(lead)).map(([key, value]) => `${key}: ${value}`);
  MailApp.sendEmail(to, subject, lines.join("\n"));
}

function jsonResponse(body, status) {
  return ContentService
    .createTextOutput(JSON.stringify(body))
    .setMimeType(ContentService.MimeType.JSON);
}
