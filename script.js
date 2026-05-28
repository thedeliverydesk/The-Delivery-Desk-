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
  document.querySelector("[data-local-form-heading]").textContent = `Ask us about ${city}`;

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
          console.warn("Lead endpoint failed; enquiry kept in local prototype storage.", error);
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
      if (status) status.textContent = `Saved. You can also email the details to ${inboundEmail}.`;
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
      if (status) status.textContent = "Partner area opened. Secure authentication still needs to be added before launch.";
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
      if (status) status.textContent = "Saved in this browser. Secure customer accounts can replace this browser profile later.";
      if (summary && summaryText) {
        summary.hidden = false;
        summaryText.textContent = `${payload.business || "Your business"} profile saved for ${formatValue(payload.service) || "delivery services"} around ${payload.location || "your collection area"}.`;
      }
    });
  });
}

function detectService(message) {
  const text = message.toLowerCase();
  const rules = [
    {
      slug: "white-glove-2-man-delivery",
      terms: ["2 man", "two man", "white glove", "furniture", "sofa", "room of choice", "bulky", "fragile", "heavy", "installation"]
    },
    {
      slug: "same-day-delivery",
      terms: ["same day", "sameday", "urgent", "today", "asap", "timed", "direct courier", "point to point"]
    },
    {
      slug: "international-delivery",
      terms: ["international", "europe", "eu", "customs", "export", "import", "worldwide", "overseas", "duties"]
    },
    {
      slug: "storage-fulfilment",
      terms: ["storage", "fulfilment", "fulfillment", "warehouse", "pick and pack", "returns", "stock", "space"]
    },
    {
      slug: "pallet-freight",
      terms: ["pallet", "freight", "haulage", "part load", "tail lift", "forklift", "heavy goods"]
    },
    {
      slug: "retail-supply-chain",
      terms: ["retail", "supply chain", "inbound", "outbound", "supplier", "stock flow", "returns process"]
    },
    {
      slug: "sea-freight-container-logistics",
      terms: ["sea freight", "ocean freight", "container", "containers", "shipping container", "fcl", "lcl", "devanning", "de-vanning", "port", "ports", "import container", "export container", "container haulage", "dock", "freight forwarder", "customs clearance"]
    },
    {
      slug: "daily-parcel-collections",
      terms: ["parcel", "parcels", "daily", "collections", "carrier", "shipments", "ecommerce", "online orders"]
    }
  ];

  const scored = rules.map((rule) => ({
    slug: rule.slug,
    score: rule.terms.reduce((total, term) => total + (text.includes(term) ? 1 : 0), 0)
  })).sort((a, b) => b.score - a.score);

  return scored[0].score > 0 ? findService(scored[0].slug) : null;
}

function detectCity(message) {
  const text = message.toLowerCase();
  return cities.find((city) => text.includes(city.toLowerCase())) || "";
}

function detectIssue(message) {
  const text = message.toLowerCase();
  const rules = [
    { issue: "Price has increased", terms: ["price", "cost", "expensive", "surcharge", "rates", "margin"] },
    { issue: "Collections are unreliable", terms: ["collection", "pickup", "pick up", "missed", "late", "cut off", "cut-off"] },
    { issue: "Service does not fit the goods", terms: ["fragile", "bulky", "heavy", "awkward", "high value", "room of choice"] },
    { issue: "Need storage or fulfilment", terms: ["storage", "fulfilment", "fulfillment", "warehouse", "pick and pack", "stock"] },
    { issue: "Customs or international paperwork", terms: ["customs", "duties", "taxes", "paperwork", "commercial invoice", "eori"] },
    { issue: "Sea freight or container planning", terms: ["sea freight", "container", "fcl", "lcl", "devanning", "port", "demurrage"] },
    { issue: "Damage or failed deliveries", terms: ["damage", "damaged", "failed delivery", "failed deliveries", "claims", "broken"] },
    { issue: "Need a new delivery partner", terms: ["new partner", "new supplier", "replace", "switch", "change carrier"] }
  ];

  const match = rules.find((rule) => rule.terms.some((term) => text.includes(term)));
  return match ? match.issue : "";
}

function addAssistantMessage(log, text, type) {
  const message = document.createElement("div");
  message.className = `assistant-message ${type}`;
  message.textContent = text;
  log.appendChild(message);
  log.scrollTop = log.scrollHeight;
}

function prefillLeadForm(service, city, message, issue) {
  const leadForm = document.querySelector("[data-lead-form]");
  if (!leadForm) return;

  const serviceSelect = leadForm.querySelector("[name='service']");
  const locationInput = leadForm.querySelector("[name='location']");
  const detailsInput = leadForm.querySelector("[name='details']");
  const issueSelect = leadForm.querySelector("[name='issue']");

  if (serviceSelect && service) setFieldValue(serviceSelect, service.slug);
  if (locationInput && city) locationInput.value = city;
  if (detailsInput && !detailsInput.value) detailsInput.value = message;
  if (issueSelect && issue) issueSelect.value = issue;
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
    const service = detectService(message);
    const city = detectCity(message);
    const issue = detectIssue(message);

    if (service) {
      prefillLeadForm(service, city, message, issue);
      const locationText = city ? ` in ${city}` : "";
      addAssistantMessage(log, `This sounds like ${service.name}${locationText}. I have selected that service in the enquiry form. The useful details are volume, collection area, delivery area, timing and what is going wrong now.`, "bot");
    } else {
      prefillLeadForm(null, city, message, issue);
      addAssistantMessage(log, "I would need a bit more detail to choose the right service. Is it parcels, same-day, 2-man, storage, pallet freight, sea freight/container logistics, EU/international or retail supply chain?", "bot");
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
