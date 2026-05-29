const DEFAULT_EMAIL_TO = "andy@svmk.co.uk";

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store"
    }
  });
}

function cleanValue(value) {
  if (Array.isArray(value)) return value.map(cleanValue).filter(Boolean);
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function normalizeLead(input) {
  const type = input.type === "partner" ? "partner" : "customer";
  const prefix = type === "partner" ? "TDD-P" : "TDD";

  return {
    ...Object.fromEntries(Object.entries(input).map(([key, value]) => [key, cleanValue(value)])),
    type,
    reference: cleanValue(input.reference) || `${prefix}-${Date.now()}`,
    createdAt: cleanValue(input.createdAt) || new Date().toISOString()
  };
}

function leadSummary(lead) {
  const label = lead.type === "partner" ? "Partner application" : "Customer enquiry";
  const name = lead.business || lead.company || "Unknown business";
  const service = Array.isArray(lead.service) ? lead.service.join(", ") : lead.service || "Not specified";
  const area = lead.location || lead.coverage || "Not specified";

  return `${label}: ${lead.reference}

Business: ${name}
Contact: ${lead.name || "Not provided"}
Email: ${lead.email || "Not provided"}
Phone: ${lead.phone || "Not provided"}
Service: ${service}
Area / coverage: ${area}

Details:
${lead.details || lead.bestFit || "Not provided"}

Raw payload:
${JSON.stringify(lead, null, 2)}
`;
}

function splitName(lead) {
  const fullName = cleanValue(lead.name || lead.contactName || lead.leadName);
  if (lead.firstName || lead.lastName) {
    return {
      firstName: cleanValue(lead.firstName),
      lastName: cleanValue(lead.lastName)
    };
  }

  const parts = fullName.split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || "",
    lastName: parts.slice(1).join(" ")
  };
}

function highLevelPayload(lead) {
  const company = cleanValue(lead.company || lead.business);
  const { firstName, lastName } = splitName(lead);

  return {
    source: "The Delivery Desk Website",
    type: lead.type,
    formType: lead.type === "partner" ? "partner_application" : "customer_enquiry",
    leadName: cleanValue(lead.name || `${firstName} ${lastName}`),
    firstName,
    lastName,
    email: cleanValue(lead.email),
    phone: cleanValue(lead.phone),
    company,
    business: company,
    postcode: cleanValue(lead.postcode || lead.location || lead.coverage),
    serviceArea: cleanValue(lead.coverage || lead.location),
    service: cleanValue(lead.service),
    message: cleanValue(lead.details || lead.bestFit || lead.issue),
    reference: lead.reference,
    pipeline: "D Desk Pipeline",
    stage: "New Lead",
    assignedTo: "Andy Smith",
    notes: leadSummary(lead),
    submittedAt: lead.createdAt,
    lead
  };
}

function isHighLevelWebhook(url) {
  return /leadconnectorhq\.com\/hooks\//i.test(url);
}

async function forwardToWebhook(lead) {
  const webhookUrl = process.env.LEAD_WEBHOOK_URL || process.env.GOOGLE_APPS_SCRIPT_WEBHOOK_URL || "";
  if (!webhookUrl) return { configured: false };

  const body = isHighLevelWebhook(webhookUrl)
    ? highLevelPayload(lead)
    : {
        secret: process.env.LEAD_WEBHOOK_SECRET || "",
        lead
      };

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Webhook failed ${response.status}: ${text.slice(0, 240)}`);
  }

  return { configured: true, status: response.status };
}

async function sendEmail(lead) {
  const apiKey = process.env.RESEND_API_KEY || "";
  const from = process.env.LEAD_EMAIL_FROM || "";
  if (!apiKey || !from) return { configured: false };

  const to = process.env.LEAD_EMAIL_TO || DEFAULT_EMAIL_TO;
  const subject = `${lead.type === "partner" ? "Partner application" : "Delivery enquiry"} ${lead.reference}`;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from,
      to,
      subject,
      text: leadSummary(lead)
    })
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Email failed ${response.status}: ${text.slice(0, 240)}`);
  }

  return { configured: true, status: response.status };
}

async function forwardToGenie(lead) {
  const genieUrl = process.env.GENIE_WEBHOOK_URL || "";
  if (!genieUrl) return { configured: false };

  const headers = { "Content-Type": "application/json" };
  if (process.env.GENIE_API_KEY) {
    headers.Authorization = `Bearer ${process.env.GENIE_API_KEY}`;
  }

  const response = await fetch(genieUrl, {
    method: "POST",
    headers,
    body: JSON.stringify({
      ...highLevelPayload(lead),
      source: "The Delivery Desk",
      contact: {
        name: lead.name || "",
        email: lead.email || "",
        phone: lead.phone || "",
        company: lead.business || lead.company || ""
      },
      opportunity: {
        name: `${lead.type === "partner" ? "Partner" : "Delivery"} - ${lead.business || lead.company || lead.name || lead.reference}`,
        reference: lead.reference,
        type: lead.type,
        service: lead.service || "",
        area: lead.location || lead.coverage || "",
        value: lead.volume || lead.leadSize || "",
        notes: leadSummary(lead)
      },
      customFields: lead
    })
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Genie failed ${response.status}: ${text.slice(0, 240)}`);
  }

  return { configured: true, status: response.status };
}

export function GET() {
  return jsonResponse({ ok: true, service: "The Delivery Desk lead endpoint" });
}

export async function POST(request) {
  let input;

  try {
    input = await request.json();
  } catch (error) {
    return jsonResponse({ ok: false, error: "Invalid JSON payload" }, 400);
  }

  const lead = normalizeLead(input || {});
  const errors = [];
  const results = {};

  try {
    results.webhook = await forwardToWebhook(lead);
  } catch (error) {
    errors.push(error.message);
    results.webhook = { configured: true, ok: false };
  }

  try {
    results.email = await sendEmail(lead);
  } catch (error) {
    errors.push(error.message);
    results.email = { configured: true, ok: false };
  }

  try {
    results.genie = await forwardToGenie(lead);
  } catch (error) {
    errors.push(error.message);
    results.genie = { configured: true, ok: false };
  }

  const hasIntegration = results.webhook?.configured || results.email?.configured || results.genie?.configured;
  if (!hasIntegration) {
    return jsonResponse({
      ok: false,
      stored: false,
      error: "Lead endpoint is deployed but no routing environment variables are configured."
    }, 503);
  }

  if (errors.length) {
    return jsonResponse({ ok: false, stored: false, errors }, 502);
  }

  return jsonResponse({ ok: true, stored: true, reference: lead.reference, results });
}
