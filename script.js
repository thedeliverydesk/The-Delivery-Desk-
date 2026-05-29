const services = [
  {
    slug: "daily-parcel-collections",
    name: "Daily parcel collections",
    icon: "P",
    summary: "For shops, wholesalers and SMEs that send parcels every day and need collections that turn up when promised."
  },
  {
    slug: "same-day-delivery",
    aliases: ["same-day-courier"],
    name: "Same-day delivery",
    icon: "S",
    summary: "Urgent point-to-point work, timed drops, local routes and jobs that cannot sit in a standard network."
  },
  {
    slug: "white-glove-2-man-delivery",
    aliases: ["two-man-delivery"],
    name: "White glove 2-man delivery",
    icon: "2",
    summary: "Room-of-choice, fragile, heavy or high-value deliveries where the handover matters as much as the journey."
  },
  {
    slug: "storage-fulfilment",
    name: "Storage and fulfilment",
    icon: "F",
    summary: "Extra space, pick-and-pack, returns and dispatch help when your own setup is stretched."
  },
  {
    slug: "international-delivery",
    name: "EU and international parcel and freight",
    phrase: "EU and international parcel and freight",
    icon: "I",
    summary: "Parcel and freight into Europe and worldwide, with customs, tracking, transit time and total cost checked."
  },
  {
    slug: "pallet-freight",
    name: "Pallet and freight",
    icon: "L",
    summary: "Pallets, part-loads and heavier consignments where access, timing and reliability need to be right."
  },
  {
    slug: "retail-supply-chain",
    name: "Retail supply chain",
    icon: "R",
    summary: "Help with inbound stock, outbound delivery, returns and the small supply chain costs that quietly add up."
  },
  {
    slug: "sea-freight-container-logistics",
    aliases: ["container-deliveries"],
    name: "Sea Freight & Container Logistics",
    phrase: "sea freight and container logistics",
    icon: "C",
    summary: "Import/export sea freight, FCL/LCL containers, port collections, customs, devanning and onward UK delivery."
  }
];

const cities = [
  "London", "Croydon", "Enfield", "Harrow", "Romford",
  "Birmingham", "Coventry", "Wolverhampton", "Walsall", "Dudley", "Solihull", "West Bromwich", "Stoke-on-Trent", "Telford", "Shrewsbury", "Worcester", "Hereford",
  "Nottingham", "Leicester", "Derby", "Northampton", "Lincoln", "Mansfield", "Loughborough", "Chesterfield", "Kettering", "Corby", "Lichfield",
  "Manchester", "Liverpool", "Preston", "Blackpool", "Bolton", "Wigan", "Warrington", "Stockport", "Oldham", "Rochdale", "Salford", "Burnley", "Blackburn", "Chester", "Carlisle", "Lancaster",
  "Leeds", "Sheffield", "Bradford", "Hull", "Kingston-upon-Hull", "York", "Huddersfield", "Wakefield", "Doncaster", "Rotherham", "Barnsley", "Harrogate", "Halifax", "Scarborough", "Middlesbrough", "Ripon",
  "Newcastle", "Newcastle-upon-Tyne", "Sunderland", "Durham", "Gateshead", "Darlington", "Hartlepool", "Stockton-on-Tees", "South Shields",
  "Bristol", "Plymouth", "Exeter", "Gloucester", "Cheltenham", "Swindon", "Bath", "Taunton", "Torquay", "Bournemouth", "Poole", "Truro", "Salisbury", "Wells",
  "Reading", "Oxford", "Milton Keynes", "Southampton", "Portsmouth", "Brighton", "Brighton & Hove", "Westminster", "Winchester", "Chichester", "Slough", "Luton", "Maidstone", "Canterbury", "Guildford", "Crawley", "Worthing", "Eastbourne", "Basingstoke", "High Wycombe", "Aylesbury", "Chatham", "Dover", "Hastings", "Woking", "Bracknell",
  "Norwich", "Cambridge", "Peterborough", "Ipswich", "Colchester", "Chelmsford", "Southend-on-Sea", "Basildon", "Stevenage", "Watford", "St Albans", "Bedford", "Harlow", "Great Yarmouth", "King's Lynn", "Ely",
  "Cardiff", "Swansea", "Newport", "Wrexham", "Bangor", "St Asaph", "St Davids", "Aberystwyth", "Bridgend", "Merthyr Tydfil", "Carmarthen", "Llanelli",
  "Glasgow", "Edinburgh", "Aberdeen", "Dundee", "Dunfermline", "Inverness", "Perth", "Stirling", "Paisley", "Kilmarnock", "Dumfries", "Ayr", "Falkirk",
  "Belfast", "Derry", "Londonderry", "Lisburn", "Newry", "Armagh", "Craigavon", "Bangor (Northern Ireland)", "Antrim", "Coleraine"
];

const params = new URLSearchParams(window.location.search);
const leadEndpoint = window.DELIVERY_DESK_LEAD_ENDPOINT || "";
const inboundEmail = "andy@svmk.co.uk";

function titleCaseSlug(value) {
  return (value || "")
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function citySlug(value) {
  return (value || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function findService(slug) {
  return services.find((service) => service.slug === slug || (service.aliases || []).includes(slug)) || services[0];
}

function serviceLabel(value) {
  if (Array.isArray(value)) return value.map(serviceLabel).join(", ");
  const match = services.find((service) => service.slug === value);
  return match ? match.name : value;
}

function formatValue(value) {
  if (Array.isArray(value)) return value.map((item) => serviceLabel(item)).join(", ");
  return serviceLabel(value || "");
}

function formDataToObject(form) {
  const data = {};
  for (const [key, value] of new FormData(form).entries()) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      data[key] = Array.isArray(data[key]) ? [...data[key], value] : [data[key], value];
    } else {
      data[key] = value;
    }
  }
  return data;
}

function setFieldValue(field, value) {
  if (!field) return;
  if (field instanceof RadioNodeList) {
    Array.from(field).forEach((item) => {
      item.checked = Array.isArray(value) ? value.includes(item.value) : item.value === value;
    });
    return;
  }
  if (field.tagName === "SELECT" && field.multiple) {
    const values = Array.isArray(value) ? value : [value];
    Array.from(field.options).forEach((option) => {
      option.selected = values.includes(option.value);
    });
    return;
  }
  field.value = Array.isArray(value) ? value.join(", ") : value;
}

function localUrl(service, city) {
  return `${service.slug}/${citySlug(city)}/index.html`;
}

function serviceUrl(service) {
  return `${service.slug}/index.html`;
}

function renderServices() {
  const grid = document.querySelector("[data-service-grid]");
  if (!grid) return;

  grid.innerHTML = services.map((service) => `
    <article class="service-card">
      <span class="service-icon" aria-hidden="true">${service.icon}</span>
      <h3>${service.name}</h3>
      <p>${service.summary}</p>
      <a href="${serviceUrl(service)}">View service</a>
    </article>
  `).join("");
}

function fillServiceOptions() {
  document.querySelectorAll("[data-service-options], #serviceSelect").forEach((select) => {
    select.innerHTML = services.map((service) => `<option value="${service.slug}">${service.name}</option>`).join("");
  });
}

function fillCityOptions() {
  const select = document.querySelector("#citySelect");
  if (!select) return;
  select.innerHTML = cities.map((city) => `<option value="${city.toLowerCase()}">${city}</option>`).join("");
}

function renderLocationLinks() {
  const wrap = document.querySelector("[data-location-links]");
  if (!wrap) return;

  const featured = [
    ["same-day-delivery", "Birmingham"],
    ["daily-parcel-collections", "Manchester"],
    ["white-glove-2-man-delivery", "Leeds"],
    ["storage-fulfilment", "Bristol"],
    ["international-delivery", "Glasgow"],
    ["pallet-freight", "Liverpool"],
    ["retail-supply-chain", "London"],
    ["sea-freight-container-logistics", "London"]
  ];

  wrap.innerHTML = featured.map(([serviceSlug, city]) => {
    const service = findService(serviceSlug);
    return `<a href="${localUrl(service, city)}">${service.name} in ${city}</a>`;
  }).join("");
}

function wireLocationTool() {
  const serviceSelect = document.querySelector("#serviceSelect");
  const citySelect = document.querySelector("#citySelect");
  const link = document.querySelector("#localPageLink");
  if (!serviceSelect || !citySelect || !link) return;

  const update = () => {
    const service = findService(serviceSelect.value);
    const city = titleCaseSlug(citySelect.value);
    link.href = localUrl(service, city);
  };

  serviceSelect.addEventListener("change", update);
  citySelect.addEventListener("change", update);
  update();
}

function renderLocalPage() {
  const heading = document.querySelector("[data-local-heading]");
  if (!heading) return;

  const service = findService(params.get("service"));
  const city = titleCaseSlug(params.get("city")) || "your area";
  const serviceLower = service.phrase || service.name.toLowerCase();

  document.title = `${service.name} in ${city} | The Delivery Desk`;
  heading.textContent = `${service.name} in ${city}`;
  document.querySelector("[data-local-copy]").textContent = `Need ${serviceLower} in ${city}? Tell us what has to move and we will help you work out who should be handling it.`;
  document.querySelector("[data-local-subheading]").textContent = `A practical look at ${serviceLower}`;
  document.querySelector("[data-local-body]").textContent = `We look at what you send, where it goes, how often it moves and what can go wrong before introducing a partner for ${city}.`;
  document.querySelector("[data-local-form-heading]").textContent = `Find the right delivery solution in ${city}`;

  const locationField = document.querySelector("[data-local-location]");
  if (locationField) locationField.value = city;

  document.querySelectorAll("[data-service-options]").forEach((select) => {
    setFieldValue(select, service.slug);
  });
}

function wireLeadForms() {
  document.querySelectorAll("[data-lead-form]").forEach((form) => {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const submitButton = form.querySelector("button[type='submit']");
      if (submitButton) submitButton.disabled = true;
      const data = formDataToObject(form);
      const leads = JSON.parse(localStorage.getItem("deliveryDeskLeads") || "[]");
      const reference = `TDD-${String(leads.length + 1).padStart(4, "0")}`;
      const payload = {
        reference,
        createdAt: new Date().toISOString(),
        page: window.location.pathname,
        ...data
      };
      leads.push(payload);
      localStorage.setItem("deliveryDeskLeads", JSON.stringify(leads));
      sessionStorage.setItem("deliveryDeskLastLead", reference);

      if (leadEndpoint) {
        try {
          await fetch(leadEndpoint, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });
        } catch (error) {
          console.warn("Lead endpoint failed; enquiry kept in local fallback storage.", error);
        }
      }

      window.location.href = form.dataset.thankYou || "thank-you.html";
    });
  });
}

function renderThankYouPage() {
  const ref = document.querySelector("[data-lead-reference]");
  if (!ref) return;

  const queryRef = new URLSearchParams(window.location.search).get("ref");
  ref.textContent = queryRef || sessionStorage.getItem("deliveryDeskLastLead") || "TDD enquiry";
}

function escapeCsv(value) {
  return `"${String(value || "").replace(/"/g, '""')}"`;
}

function renderAdminPage() {
  const tableBody = document.querySelector("[data-leads-table]");
  if (!tableBody) return;

  const leads = JSON.parse(localStorage.getItem("deliveryDeskLeads") || "[]");
  const count = document.querySelector("[data-leads-count]");
  const empty = document.querySelector("[data-empty-leads]");
  if (count) count.textContent = String(leads.length);
  if (empty) empty.hidden = leads.length > 0;

  tableBody.innerHTML = leads.map((lead) => `
    <tr>
      <td>${lead.reference}</td>
      <td>${lead.business || ""}</td>
      <td>${lead.name || ""}</td>
      <td>${lead.email || ""}</td>
      <td>${formatValue(lead.service)}</td>
      <td>${lead.location || ""}</td>
      <td>${lead.volume || ""}</td>
      <td>${lead.issue || ""}</td>
    </tr>
  `).join("");

  const exportButton = document.querySelector("[data-export-leads]");
  if (exportButton) {
    exportButton.addEventListener("click", () => {
      const headers = ["reference", "createdAt", "business", "name", "email", "phone", "service", "location", "volume", "issue", "consent", "details"];
      const rows = [headers.join(","), ...leads.map((lead) => headers.map((header) => escapeCsv(formatValue(lead[header]))).join(","))];
      const blob = new Blob([rows.join("\n")], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "delivery-desk-leads.csv";
      link.click();
      URL.revokeObjectURL(url);
    });
  }
}

function wirePartnerForms() {
  document.querySelectorAll("[data-partner-form]").forEach((form) => {
    const status = form.querySelector("[data-partner-status]");
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const applications = JSON.parse(localStorage.getItem("deliveryDeskPartnerApplications") || "[]");
      const payload = {
        reference: `TDD-P-${String(applications.length + 1).padStart(4, "0")}`,
        createdAt: new Date().toISOString(),
        ...formDataToObject(form)
      };
      applications.push(payload);
      localStorage.setItem("deliveryDeskPartnerApplications", JSON.stringify(applications));
      if (status) status.textContent = `Partner profile saved on this device. You can also email the details to ${inboundEmail}.`;
      form.reset();
      fillServiceOptions();
    });
  });
}

function wirePrototypeLogins() {
  document.querySelectorAll("[data-preview-login]").forEach((form) => {
    const status = form.querySelector("[data-login-status]");
    const dashboard = document.querySelector("[data-partner-dashboard]");
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = formDataToObject(form);
      localStorage.setItem("deliveryDeskPrototypeLogin", JSON.stringify({
        type: form.dataset.loginType || "prototype",
        createdAt: new Date().toISOString(),
        ...data
      }));
      if (status) status.textContent = "Partner area opened. We will verify partner details before live lead routing is enabled.";
      if (dashboard) dashboard.hidden = false;
    });
  });
}

function wireCustomerProfile() {
  document.querySelectorAll("[data-customer-profile]").forEach((form) => {
    const status = form.querySelector("[data-customer-status]");
    const summary = document.querySelector("[data-customer-summary]");
    const summaryText = document.querySelector("[data-customer-summary-text]");
    const saved = JSON.parse(localStorage.getItem("deliveryDeskCustomerProfile") || "null");

    if (saved) {
      Object.entries(saved).forEach(([key, value]) => {
        const field = form.elements[key];
        setFieldValue(field, value);
      });
      if (summary && summaryText) {
        summary.hidden = false;
        summaryText.textContent = `${saved.business || "Your business"} profile saved for ${formatValue(saved.service) || "delivery services"} around ${saved.location || "your collection area"}.`;
      }
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const payload = {
        updatedAt: new Date().toISOString(),
        ...formDataToObject(form)
      };
      localStorage.setItem("deliveryDeskCustomerProfile", JSON.stringify(payload));
      if (status) status.textContent = "Profile saved on this device. Use the enquiry form when you are ready for us to review it.";
      if (summary && summaryText) {
        summary.hidden = false;
        summaryText.textContent = `${payload.business || "Your business"} profile saved for ${formatValue(payload.service) || "delivery services"} around ${payload.location || "your collection area"}.`;
      }
    });
  });
}

const assistantServiceRules = [
  {
    slug: "sea-freight-container-logistics",
    terms: [
      ["sea freight", 8], ["ocean freight", 8], ["shipping container", 8], ["import container", 8], ["export container", 8],
      ["container haulage", 7], ["customs clearance", 6], ["devanning", 6], ["de-vanning", 6], ["fcl", 6], ["lcl", 6],
      ["port", 4], ["ports", 4], ["dock", 3], ["container", 5], ["containers", 5], ["freight forwarder", 5], ["demurrage", 5]
    ]
  },
  {
    slug: "white-glove-2-man-delivery",
    terms: [
      ["white glove", 8], ["2 man", 8], ["two man", 8], ["room of choice", 7], ["furniture", 6], ["sofa", 5], ["sofas", 5],
      ["bulky", 4], ["fragile", 4], ["heavy", 3], ["installation", 4], ["assembled", 3], ["high value", 3]
    ]
  },
  {
    slug: "same-day-delivery",
    terms: [
      ["same day", 8], ["sameday", 8], ["urgent", 6], ["today", 6], ["asap", 5],
      ["timed", 4], ["direct courier", 7], ["point to point", 7], ["medical", 4], ["parts", 3], ["emergency", 5]
    ]
  },
  {
    slug: "storage-fulfilment",
    terms: [
      ["storage", 7], ["fulfilment", 7], ["fulfillment", 7], ["warehouse", 6], ["pick and pack", 7],
      ["returns", 5], ["stock", 4], ["space", 3], ["inventory", 4], ["dispatch", 3]
    ]
  },
  {
    slug: "international-delivery",
    terms: [
      ["international", 7], ["europe", 6], ["eu", 5], ["worldwide", 6], ["overseas", 6], ["export", 5],
      ["import", 4], ["customs", 3], ["duties", 4], ["commercial invoice", 5], ["eori", 5]
    ]
  },
  {
    slug: "pallet-freight",
    terms: [
      ["pallet", 8], ["pallets", 8], ["freight", 3], ["haulage", 5], ["part load", 6],
      ["tail lift", 5], ["forklift", 4], ["heavy goods", 5], ["ltl", 5], ["groupage", 5]
    ]
  },
  {
    slug: "retail-supply-chain",
    terms: [
      ["retail", 6], ["supply chain", 8], ["inbound", 5], ["outbound", 4], ["supplier", 4],
      ["stock flow", 6], ["returns process", 6], ["multi site", 5], ["store", 3], ["stores", 3]
    ]
  },
  {
    slug: "daily-parcel-collections",
    terms: [
      ["daily parcel", 8], ["parcel collections", 8], ["parcels", 5], ["parcel", 5], ["daily", 3],
      ["collections", 5], ["carrier", 4], ["shipments", 3], ["ecommerce", 5], ["online orders", 5], ["missed pickup", 4]
    ]
  }
];

function normalizeMessage(message) {
  return ` ${(message || "").toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, " ")} `;
}

function hasTerm(text, term) {
  const normalizedTerm = term.toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, " ").trim();
  return text.includes(` ${normalizedTerm} `);
}

function scoreServiceMatches(message) {
  const text = normalizeMessage(message);
  return assistantServiceRules
    .map((rule) => {
      const matched = rule.terms.filter(([term]) => hasTerm(text, term));
      return {
        service: findService(rule.slug),
        score: matched.reduce((total, [, weight]) => total + weight, 0),
        matchedTerms: matched.map(([term]) => term)
      };
    })
    .filter((match) => match.score > 0)
    .sort((a, b) => b.score - a.score);
}

function analyseAssistantMessage(message) {
  const ranked = scoreServiceMatches(message);
  const top = ranked[0] || null;
  const second = ranked[1] || null;
  const ambiguous = Boolean(top && second && second.score >= Math.max(6, top.score * 0.72));

  return {
    service: top && !ambiguous ? top.service : null,
    ranked,
    ambiguous,
    confidence: top ? Math.min(95, Math.round(45 + top.score * 5 - (second ? second.score * 2 : 0))) : 0
  };
}

function detectService(message) {
  return analyseAssistantMessage(message).service;
}

function detectCity(message) {
  const text = message.toLowerCase();
  return cities.find((city) => text.includes(city.toLowerCase())) || "";
}

function detectVolume(message) {
  const text = normalizeMessage(message);
  const weeklyMatch = text.match(/\b(\d+)\s*(parcels|orders|shipments|drops|deliveries|pallets)\s*(a|per)?\s*(week|weekly)\b/);
  const dailyMatch = text.match(/\b(\d+)\s*(parcels|orders|shipments|drops|deliveries|pallets)\s*(a|per)?\s*(day|daily)\b/);
  const numberMatch = weeklyMatch || dailyMatch;

  if (numberMatch) {
    const count = Number(numberMatch[1]);
    const period = numberMatch[4];
    const weeklyCount = period.startsWith("day") || period === "daily" ? count * 5 : count;

    if (weeklyCount > 100) return "100+ shipments a week";
    if (weeklyCount >= 20) return "20-100 shipments a week";
    return "1-20 shipments a week";
  }

  if (hasTerm(text, "one off") || hasTerm(text, "one-off") || hasTerm(text, "project") || hasTerm(text, "container")) {
    return "Project or one-off movement";
  }

  return "";
}

function detectIssue(message) {
  const text = normalizeMessage(message);
  const rules = [
    { issue: "Price has increased", terms: ["price", "cost", "expensive", "surcharge", "rates", "margin"] },
    { issue: "Collections are unreliable", terms: ["pickup", "pickups", "pick up", "missed pickup", "missed collection", "missed collections", "late collection", "late collections", "late pickup", "cut off", "cut-off"] },
    { issue: "Service does not fit the goods", terms: ["fragile", "bulky", "heavy", "awkward", "high value", "room of choice"] },
    { issue: "Need storage or fulfilment", terms: ["storage", "fulfilment", "fulfillment", "warehouse", "pick and pack", "stock"] },
    { issue: "Customs or international paperwork", terms: ["customs", "duties", "taxes", "paperwork", "commercial invoice", "eori"] },
    { issue: "Sea freight or container planning", terms: ["sea freight", "container", "fcl", "lcl", "devanning", "port", "demurrage"] },
    { issue: "Damage or failed deliveries", terms: ["damage", "damaged", "failed delivery", "failed deliveries", "claims", "broken"] },
    { issue: "Need a new delivery partner", terms: ["new partner", "new supplier", "replace", "switch", "change carrier"] }
  ];

  const match = rules.find((rule) => rule.terms.some((term) => hasTerm(text, term)));
  return match ? match.issue : "";
}

function serviceReason(match) {
  if (!match || match.matchedTerms.length === 0) return "";

  const terms = match.matchedTerms.slice(0, 3).map((term) => term.replace(/-/g, " "));
  if (terms.length === 1) return `I picked up "${terms[0]}".`;
  if (terms.length === 2) return `I picked up "${terms[0]}" and "${terms[1]}".`;
  return `I picked up "${terms[0]}", "${terms[1]}" and "${terms[2]}".`;
}

function rankedServiceNames(matches) {
  return matches.slice(0, 3).map((match) => match.service.name).join(", ");
}

function buildClarifyingQuestion(analysis) {
  if (analysis.ranked.length > 1) {
    return `This could go a couple of ways: ${rankedServiceNames(analysis.ranked)}. Which matters most right now: speed, handling, storage, freight size, or paperwork?`;
  }

  return "I can help narrow it down. Is this mainly parcels, urgent same-day work, 2-man delivery, storage/fulfilment, pallets/freight, sea freight/containers, EU/international, or a wider retail supply chain issue?";
}

function addAssistantMessage(log, text, type) {
  const message = document.createElement("div");
  message.className = `assistant-message ${type}`;
  message.textContent = text;
  log.appendChild(message);
  log.scrollTop = log.scrollHeight;
}

function focusLeadForm() {
  const leadForm = document.querySelector("[data-lead-form]");
  if (!leadForm) return;

  leadForm.scrollIntoView({ behavior: "smooth", block: "start" });

  const firstEmptyField = Array.from(leadForm.querySelectorAll("input, select, textarea"))
    .find((field) => field.required && !field.value);
  const fallbackField = leadForm.querySelector("[name='business']") || leadForm.querySelector("input, select, textarea");

  window.setTimeout(() => {
    (firstEmptyField || fallbackField)?.focus({ preventScroll: true });
  }, 450);
}

function addAssistantAction(log, text) {
  const message = document.createElement("div");
  const button = document.createElement("button");

  message.className = "assistant-message bot assistant-action-message";
  message.textContent = text;

  button.type = "button";
  button.className = "assistant-action-button";
  button.textContent = "Continue enquiry";
  button.addEventListener("click", focusLeadForm);

  message.appendChild(button);
  log.appendChild(message);
  log.scrollTop = log.scrollHeight;
}

function prefillLeadForm(service, city, message, issue, volume) {
  const leadForm = document.querySelector("[data-lead-form]");
  if (!leadForm) return;

  const serviceSelect = leadForm.querySelector("[name='service']");
  const locationInput = leadForm.querySelector("[name='location']");
  const detailsInput = leadForm.querySelector("[name='details']");
  const issueSelect = leadForm.querySelector("[name='issue']");
  const volumeSelect = leadForm.querySelector("[name='volume']");

  if (serviceSelect && service) setFieldValue(serviceSelect, service.slug);
  if (locationInput && city) locationInput.value = city;
  if (detailsInput && (!detailsInput.value || detailsInput.dataset.assistantPrefilled === "true")) {
    detailsInput.value = message;
    detailsInput.dataset.assistantPrefilled = "true";
  }
  if (issueSelect && issue) issueSelect.value = issue;
  if (volumeSelect && volume) volumeSelect.value = volume;
}

function wireAssistant() {
  const form = document.querySelector("[data-assistant-form]");
  const log = document.querySelector("[data-assistant-log]");
  const input = document.querySelector("#assistantInput");
  if (!form || !log || !input) return;

  const respond = (rawMessage) => {
    const message = rawMessage.trim();
    if (!message) return;

    addAssistantMessage(log, message, "user");
    const analysis = analyseAssistantMessage(message);
    const service = analysis.service;
    const city = detectCity(message);
    const issue = detectIssue(message);
    const volume = detectVolume(message);

    if (service) {
      prefillLeadForm(service, city, message, issue, volume);
      const locationText = city ? ` in ${city}` : "";
      const reason = serviceReason(analysis.ranked[0]);
      const confidenceText = analysis.confidence >= 75 ? "That feels like a strong fit." : "That looks like the best starting point.";
      addAssistantAction(log, `${confidenceText} ${reason} I would start with ${service.name}${locationText}. I have filled what I can in the enquiry form; add the contact details and we can pass it on properly.`);
    } else {
      prefillLeadForm(null, city, message, issue, volume);
      addAssistantMessage(log, buildClarifyingQuestion(analysis), "bot");
    }
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    respond(input.value);
    input.value = "";
  });

  document.querySelectorAll("[data-assistant-prompt]").forEach((button) => {
    button.addEventListener("click", () => {
      input.value = button.dataset.assistantPrompt || "";
      respond(input.value);
      input.value = "";
    });
  });
}

renderServices();
fillServiceOptions();
fillCityOptions();
renderLocationLinks();
wireLocationTool();
renderLocalPage();
wireLeadForms();
renderThankYouPage();
renderAdminPage();
wireAssistant();
wirePartnerForms();
wirePrototypeLogins();
wireCustomerProfile();
