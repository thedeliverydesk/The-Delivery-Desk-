const fs = require("fs");
const path = require("path");

const siteUrl = (process.env.SITE_URL || "https://the-delivery-desk-andy-3048s-projects.vercel.app").replace(/\/$/, "");

const services = [
  {
    slug: "daily-parcel-collections",
    name: "Daily parcel collections",
    phrase: "daily parcel collections",
    audience: "retailers, wholesalers, online sellers and local firms sending parcels most days",
    intro: "This is for businesses that need collections to happen without chasing, missed cut-offs or confusion over who is meant to be picking up.",
    checks: ["daily and weekly parcel volumes", "collection cut-off times", "average parcel size and weight", "current carrier failures", "returns and peak trading pressure"],
    warning: "A low parcel rate is not much use if the collection window is wrong or the claims process eats up staff time.",
    fit: ["regular parcel volumes leaving one or more sites", "missed or late collections are causing staff pressure", "you need carrier options checked before changing supplier"],
    redFlags: ["unclear cut-off times", "regular failed collections", "surcharges that are hard to explain", "too much manual chasing or rebooking"],
    faq: [
      ["Can you help if we already have a parcel carrier?", "Yes. A lot of enquiries start with an existing carrier that mostly works but has collection, cost, claims or service gaps."],
      ["Do we need exact parcel volumes before asking?", "No. A sensible estimate is enough to start. Weekly volume, average weight and collection postcode help narrow the options."]
    ]
  },
  {
    slug: "same-day-delivery",
    name: "Same-day delivery",
    phrase: "same-day delivery",
    audience: "businesses with urgent, time-sensitive or awkward deliveries that cannot wait for a parcel network",
    intro: "Same-day work needs a courier who understands timing, proof of delivery and communication. It is not just a faster version of standard parcel delivery.",
    checks: ["pickup and delivery deadlines", "vehicle type", "waiting time and access", "proof of delivery requirements", "regular routes versus one-off urgent jobs"],
    warning: "The wrong same-day setup can leave you paying premium prices while still missing the promise made to your customer.",
    fit: ["urgent parts, samples, documents or customer orders", "timed collections and timed delivery windows", "direct routes where tracking and proof matter"],
    redFlags: ["unclear pickup readiness", "wrong vehicle size", "waiting time not agreed", "no clear proof of delivery"],
    faq: [
      ["Is same-day only for one-off emergencies?", "No. It can also work for regular routes, store replenishment, service engineers, medical supplies and planned timed drops."],
      ["What detail helps price a same-day job?", "Collection postcode, delivery postcode, ready time, deadline, size, weight, access notes and whether the item needs a van, car or larger vehicle."]
    ]
  },
  {
    slug: "white-glove-2-man-delivery",
    name: "White glove 2-man delivery",
    phrase: "white glove 2-man delivery",
    audience: "furniture retailers, interiors businesses, equipment suppliers and companies sending bulky or high-value goods",
    intro: "White glove 2-man delivery is about the customer handover as much as the transport. Access, care, timing and communication all have to be right.",
    checks: ["room-of-choice delivery", "fragile or high-value items", "stair carries and access restrictions", "customer booking process", "failed delivery and damage risk"],
    warning: "A standard bulky delivery service can quickly become expensive if damages, failed drops or poor customer updates start to build up.",
    fit: ["furniture, interiors, equipment or fragile goods", "room-of-choice delivery or careful customer handover", "jobs where damage risk and customer communication matter"],
    redFlags: ["no access checks before delivery", "poor customer booking process", "unclear damage handling", "bulky items being pushed through a standard parcel-style service"],
    faq: [
      ["What does white glove 2-man usually include?", "It can include customer booking, two-person handling, room-of-choice delivery, careful handover and sometimes unpacking or packaging removal depending on the partner."],
      ["Is 2-man delivery only for furniture?", "No. It can also suit fitness equipment, appliances, trade goods, displays, office items and other bulky or high-value products."]
    ]
  },
  {
    slug: "storage-fulfilment",
    name: "Storage and fulfilment",
    phrase: "storage and fulfilment",
    audience: "growing retailers, seasonal sellers and businesses that have outgrown their own stock space",
    intro: "Storage and fulfilment should make dispatch easier, not create another set of problems to manage. The fit depends on stock profile, order pattern and returns.",
    checks: ["space needed now and at peak", "pick-and-pack requirements", "SKU count and stock control", "returns handling", "dispatch carrier options"],
    warning: "Moving stock into the wrong fulfilment setup can add cost and slow down dispatch instead of fixing the pressure.",
    fit: ["stock is taking over your own space", "orders are growing or seasonal demand is hard to manage", "returns, dispatch and carrier choice need tightening"],
    redFlags: ["unclear storage charging", "weak stock visibility", "slow pick-and-pack process", "returns handled away from the main stock picture"],
    faq: [
      ["Can fulfilment help a small business?", "Yes, if the stock profile and order pattern fit. It is not always right, so the first job is to check whether outsourcing will save pressure or add cost."],
      ["What should we know before moving stock?", "SKU count, average orders, peak volume, packaging needs, returns process, storage space and preferred dispatch services."]
    ]
  },
  {
    slug: "international-delivery",
    name: "EU and international parcel and freight",
    phrase: "EU and international parcel and freight",
    audience: "UK businesses sending parcels, pallets or freight into Europe and worldwide",
    intro: "EU and international delivery needs more than a cheap label. Customs, tracking, service level, paperwork and total landed cost all matter.",
    checks: ["destination countries", "parcel or freight profile", "customs paperwork", "transit time and tracking", "duties, taxes and total landed cost"],
    warning: "The wrong international option can look fine at booking stage and then fail at customs, tracking or final delivery.",
    fit: ["EU parcel delivery, worldwide parcels, pallets or freight", "customs paperwork or tracking is causing problems", "you need service options checked by destination and goods type"],
    redFlags: ["unclear commodity details", "poor customs data", "unexpected duties or taxes", "tracking that stops after export"],
    faq: [
      ["Do you cover both EU and worldwide delivery?", "Yes. This service covers EU and international parcel and freight delivery, including Europe and wider worldwide routes."],
      ["What details matter for international delivery?", "Destination country, goods description, value, weight, dimensions, customs requirements, incoterms and whether the shipment is parcel, pallet or freight."]
    ]
  },
  {
    slug: "pallet-freight",
    name: "Pallet and freight",
    phrase: "pallet and freight",
    audience: "manufacturers, wholesalers, distributors and suppliers moving heavier consignments",
    intro: "Pallet and freight work depends on access, timing, load type and the service promise. It needs a practical look before choosing a partner.",
    checks: ["pallet size and weight", "forklift or tail-lift access", "delivery booking requirements", "part-load versus network freight", "damage and claims exposure"],
    warning: "Freight problems often start with small details: poor access notes, wrong vehicle type or a delivery window the carrier cannot meet.",
    fit: ["pallets, oversized consignments or heavier business freight", "tail-lift, forklift or booking-in details matter", "damage risk, access and timing need checking before booking"],
    redFlags: ["wrong pallet dimensions", "tail-lift not specified", "delivery booking ignored", "poor access notes or no contact details"],
    faq: [
      ["Is pallet freight different from parcel delivery?", "Yes. Pallet and freight services need more detail on access, weight, size, loading, unloading and booking requirements."],
      ["Can you help with one-off freight?", "Yes. One-off and project movements can still be matched if the goods, route, access and timing are clear."]
    ]
  },
  {
    slug: "retail-supply-chain",
    name: "Retail supply chain support",
    phrase: "retail supply chain support",
    audience: "retailers and small businesses trying to control inbound stock, outbound delivery and returns",
    intro: "Retail supply chain costs are often hidden in failed deliveries, stock delays, manual fixes and returns. We look at the whole flow, not just one rate card.",
    checks: ["inbound supplier deliveries", "outbound parcel and bulky delivery", "returns process", "seasonal pressure", "where staff time is being lost"],
    warning: "Changing carrier alone may not fix the issue if the real problem sits in stock flow, fulfilment, returns or customer communication.",
    fit: ["delivery problems are linked to stock, returns or fulfilment", "staff are spending too much time fixing delivery issues", "you need to understand the full cost, not just the carriage price"],
    redFlags: ["returns are disconnected from stock", "inbound delays keep affecting customers", "manual fixes are normal", "carrier changes have not solved the real issue"],
    faq: [
      ["Is this only for large retailers?", "No. Smaller retailers often feel supply chain problems faster because staff time, space and cash are tighter."],
      ["What do you look at first?", "Inbound stock, outbound delivery, returns, storage, carrier fit, customer promises and where the team is losing time."]
    ]
  },
  {
    slug: "sea-freight-container-logistics",
    name: "Sea Freight & Container Logistics",
    phrase: "sea freight and container logistics",
    audience: "importers, exporters, wholesalers, retailers and manufacturers moving containerised stock",
    intro: "Sea freight and container logistics need planning around shipping terms, customs, ports, unloading, storage, onward transport and timing. The cheapest route is not always the one that keeps the job moving.",
    checks: ["FCL, LCL or loose-loaded cargo", "port or rail terminal collection", "20ft, 40ft or high-cube container type", "customs and document requirements", "devanning, storage and onward UK delivery"],
    warning: "Sea freight can become expensive quickly if customs, unloading, demurrage, storage or onward delivery are not planned before the container arrives.",
    fit: ["FCL or LCL sea freight", "container collection, devanning, storage or onward UK transport", "imports or exports where customs and timing need coordinating"],
    redFlags: ["container arrival dates are unclear", "no unloading plan", "demurrage or quay rent risk", "customs and onward delivery being handled separately"],
    faq: [
      ["Should this be called sea logistics?", "Sea freight and container logistics is the clearer term. It covers the container work, but also the port, customs, devanning, storage and onward transport around it."],
      ["Can you help after the container reaches the UK?", "Yes. The enquiry can cover port collection, container haulage, devanning, storage and onward UK delivery."]
    ]
  }
];

const regionCopy = {
  london: {
    region: "London",
    local: "delivery work can be high-pressure because access, timing, congestion, customer expectations and service failures all matter.",
    routes: "The right partner needs to fit the borough, vehicle type, delivery promise and whether the work is local, national, EU or international."
  },
  southEast: {
    region: "the South East",
    local: "businesses often need a mix of local deliveries, London-linked routes, national parcel networks and freight moving through southern ports and corridors.",
    routes: "Service fit depends on collection times, access, route density and whether goods are moving locally, into London, across the UK or overseas."
  },
  southWest: {
    region: "the South West",
    local: "businesses often need delivery partners who can handle regional routes, longer-distance UK movements and seasonal pressure around retail, trade and tourism.",
    routes: "The right setup needs to account for M4/M5 links, rural access, coastal routes and onward movement into Wales, the Midlands or London."
  },
  westMidlands: {
    region: "the West Midlands",
    local: "delivery needs often mix wholesale, manufacturing, trade supply, ecommerce, pallets, parcels and urgent local movements.",
    routes: "Good partner choice matters when work is moving across the Midlands, into London, up to the North West or out through national networks."
  },
  eastMidlands: {
    region: "the East Midlands",
    local: "businesses are well placed for UK distribution, but the right delivery partner still depends on collection times, route profile and goods type.",
    routes: "Many enquiries need a balance between local timed delivery, national parcel networks, freight and warehouse-linked distribution."
  },
  northWest: {
    region: "the North West",
    local: "businesses often need a practical mix of city deliveries, regional routes, national parcel networks, freight and port-linked movements.",
    routes: "The right setup depends on whether work is moving locally, across the M62 corridor, into Scotland, down to the Midlands or through international routes."
  },
  yorkshire: {
    region: "Yorkshire",
    local: "businesses often need a balance between city deliveries, regional Yorkshire routes and national parcel or freight movement.",
    routes: "The right setup depends on whether the work is daily parcel flow, timed courier work, bulky delivery, freight or storage-linked distribution."
  },
  northEast: {
    region: "the North East",
    local: "businesses can need delivery partners who understand both local work and longer routes into Scotland, Yorkshire and the rest of the UK.",
    routes: "The best option depends on volume, timing and whether the goods are parcels, pallets, bulky items, sea freight, containers or urgent courier jobs."
  },
  east: {
    region: "the East of England",
    local: "businesses often need a mix of local delivery, rural access, port-linked freight, London routes and national parcel networks.",
    routes: "Partner choice should account for collection windows, route distance, coastal or port movements and whether goods need standard, specialist or international handling."
  },
  wales: {
    region: "Wales",
    local: "businesses often need delivery support across local towns, Welsh regional routes, the South West, the Midlands and wider UK networks.",
    routes: "The right partner needs to fit the mix of local drops, regional routes, national delivery and any EU or international requirements."
  },
  scotland: {
    region: "Scotland",
    local: "delivery work can involve city collections, regional Scottish routes and longer-distance movement into England, Europe or worldwide.",
    routes: "Carrier and courier choice needs to account for distance, timing, tracking and how well the partner covers Scottish and national lanes."
  },
  northernIreland: {
    region: "Northern Ireland",
    local: "businesses often need delivery partners who understand local routes, UK mainland movement, Irish Sea crossings and cross-border requirements.",
    routes: "The right option depends on documentation, transit time, service level, customs considerations and whether goods are parcels, pallets, freight or bulky items."
  }
};

const locationRows = [
  ["London", "london"], ["Croydon", "london"], ["Enfield", "london"], ["Harrow", "london"], ["Romford", "london"],
  ["Birmingham", "westMidlands"], ["Coventry", "westMidlands"], ["Wolverhampton", "westMidlands"], ["Walsall", "westMidlands"], ["Dudley", "westMidlands"], ["Solihull", "westMidlands"], ["West Bromwich", "westMidlands"], ["Stoke-on-Trent", "westMidlands"], ["Telford", "westMidlands"], ["Shrewsbury", "westMidlands"], ["Worcester", "westMidlands"], ["Hereford", "westMidlands"],
  ["Nottingham", "eastMidlands"], ["Leicester", "eastMidlands"], ["Derby", "eastMidlands"], ["Northampton", "eastMidlands"], ["Lincoln", "eastMidlands"], ["Mansfield", "eastMidlands"], ["Loughborough", "eastMidlands"], ["Chesterfield", "eastMidlands"], ["Kettering", "eastMidlands"], ["Corby", "eastMidlands"],
  ["Manchester", "northWest"], ["Liverpool", "northWest"], ["Preston", "northWest"], ["Blackpool", "northWest"], ["Bolton", "northWest"], ["Wigan", "northWest"], ["Warrington", "northWest"], ["Stockport", "northWest"], ["Oldham", "northWest"], ["Rochdale", "northWest"], ["Salford", "northWest"], ["Burnley", "northWest"], ["Blackburn", "northWest"], ["Chester", "northWest"], ["Carlisle", "northWest"],
  ["Leeds", "yorkshire"], ["Sheffield", "yorkshire"], ["Bradford", "yorkshire"], ["Hull", "yorkshire"], ["York", "yorkshire"], ["Huddersfield", "yorkshire"], ["Wakefield", "yorkshire"], ["Doncaster", "yorkshire"], ["Rotherham", "yorkshire"], ["Barnsley", "yorkshire"], ["Harrogate", "yorkshire"], ["Halifax", "yorkshire"], ["Scarborough", "yorkshire"], ["Middlesbrough", "yorkshire"],
  ["Newcastle", "northEast"], ["Sunderland", "northEast"], ["Durham", "northEast"], ["Gateshead", "northEast"], ["Darlington", "northEast"], ["Hartlepool", "northEast"], ["Stockton-on-Tees", "northEast"], ["South Shields", "northEast"],
  ["Bristol", "southWest"], ["Plymouth", "southWest"], ["Exeter", "southWest"], ["Gloucester", "southWest"], ["Cheltenham", "southWest"], ["Swindon", "southWest"], ["Bath", "southWest"], ["Taunton", "southWest"], ["Torquay", "southWest"], ["Bournemouth", "southWest"], ["Poole", "southWest"], ["Truro", "southWest"],
  ["Reading", "southEast"], ["Oxford", "southEast"], ["Milton Keynes", "southEast"], ["Southampton", "southEast"], ["Portsmouth", "southEast"], ["Brighton", "southEast"], ["Slough", "southEast"], ["Luton", "southEast"], ["Maidstone", "southEast"], ["Canterbury", "southEast"], ["Guildford", "southEast"], ["Crawley", "southEast"], ["Worthing", "southEast"], ["Eastbourne", "southEast"], ["Basingstoke", "southEast"], ["High Wycombe", "southEast"], ["Aylesbury", "southEast"], ["Chatham", "southEast"], ["Dover", "southEast"], ["Hastings", "southEast"], ["Woking", "southEast"], ["Bracknell", "southEast"],
  ["Norwich", "east"], ["Cambridge", "east"], ["Peterborough", "east"], ["Ipswich", "east"], ["Colchester", "east"], ["Chelmsford", "east"], ["Southend-on-Sea", "east"], ["Basildon", "east"], ["Stevenage", "east"], ["Watford", "east"], ["St Albans", "east"], ["Bedford", "east"], ["Harlow", "east"], ["Great Yarmouth", "east"], ["King's Lynn", "east"],
  ["Cardiff", "wales"], ["Swansea", "wales"], ["Newport", "wales"], ["Wrexham", "wales"], ["Bangor", "wales"], ["Aberystwyth", "wales"], ["Bridgend", "wales"], ["Merthyr Tydfil", "wales"], ["Carmarthen", "wales"], ["Llanelli", "wales"],
  ["Glasgow", "scotland"], ["Edinburgh", "scotland"], ["Aberdeen", "scotland"], ["Dundee", "scotland"], ["Inverness", "scotland"], ["Perth", "scotland"], ["Stirling", "scotland"], ["Paisley", "scotland"], ["Kilmarnock", "scotland"], ["Dumfries", "scotland"], ["Ayr", "scotland"], ["Falkirk", "scotland"],
  ["Belfast", "northernIreland"], ["Derry", "northernIreland"], ["Lisburn", "northernIreland"], ["Newry", "northernIreland"], ["Armagh", "northernIreland"], ["Craigavon", "northernIreland"], ["Bangor (Northern Ireland)", "northernIreland"], ["Antrim", "northernIreland"], ["Coleraine", "northernIreland"]
];

const cities = locationRows.map(([name, regionKey]) => {
  const copy = regionCopy[regionKey];
  return {
    name,
    region: copy.region,
    local: `${name} ${copy.local}`,
    routes: copy.routes
  };
});

function citySlug(value) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function listItems(items) {
  return items.map((item) => `<li>${escapeHtml(item)}</li>`).join("\n");
}

function cardItems(items) {
  return items.map((item) => `<li>${escapeHtml(item)}</li>`).join("\n");
}

function faqItems(items) {
  return items.map(([question, answer]) => `
            <details>
              <summary>${escapeHtml(question)}</summary>
              <p>${escapeHtml(answer)}</p>
            </details>`).join("\n");
}

function faqSchema(items) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": items.map(([question, answer]) => ({
      "@type": "Question",
      "name": question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": answer
      }
    }))
  };
}

function pageHtml(service, city) {
  const title = `${service.name} in ${city.name} | The Delivery Desk`;
  const description = `Need ${service.phrase} in ${city.name}? Independent delivery and logistics help for businesses in ${city.region}. Powered by SVMK.`;
  const canonical = `${siteUrl}/${service.slug}/${citySlug(city.name)}`;
  const localFaq = [
    ...service.faq,
    [
      `Can you help with ${service.phrase} in ${city.name}?`,
      `Yes. Tell us what needs to move, the collection area, delivery area, timing and current issue. We will use that to work out the right kind of delivery or logistics partner.`
    ]
  ];
  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": `${service.name} in ${city.name}`,
      "description": description,
      "areaServed": city.name,
      "provider": {
        "@type": "ProfessionalService",
        "name": "The Delivery Desk"
      }
    },
    faqSchema(localFaq)
  ];

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}">
    <link rel="canonical" href="${escapeHtml(canonical)}">
    <link rel="stylesheet" href="../../styles.css">
    <script type="application/ld+json">${JSON.stringify(schema)}</script>
  </head>
  <body>
    <header class="site-header">
      <a class="brand" href="../../index.html" aria-label="The Delivery Desk home">
        <span class="brand-mark">TDD</span>
        <span>
          <strong>The Delivery Desk</strong>
          <small>Powered by SVMK</small>
        </span>
      </a>
      <nav class="main-nav" aria-label="Primary navigation">
        <a href="../../index.html#services">Services</a>
        <a href="../../index.html#locations">Local pages</a>
        <a class="nav-action" href="#lead-form">Get matched</a>
      </nav>
    </header>

    <main>
      <section class="local-hero">
        <div class="section-inner">
          <p class="eyebrow dark">Delivery help in ${escapeHtml(city.region)}</p>
          <h1>${escapeHtml(service.name)} in ${escapeHtml(city.name)}</h1>
          <p>${escapeHtml(service.intro)} If you are based in or around ${escapeHtml(city.name)}, tell us what needs to move and what is causing the issue.</p>
          <a class="button primary" href="#lead-form">Ask us to take a look</a>
        </div>
      </section>

      <section class="section-inner two-col local-detail">
        <div>
          <p class="eyebrow dark">Why it matters locally</p>
          <h2>Not every delivery partner is right for ${escapeHtml(city.name)} work.</h2>
          <p>${escapeHtml(city.local)}</p>
          <p>${escapeHtml(city.routes)}</p>
          <p>${escapeHtml(service.warning)}</p>
        </div>
        <aside class="expert-panel">
          <h3>What we check</h3>
          <ul class="check-list compact">
${listItems(service.checks)}
          </ul>
        </aside>
      </section>

      <section class="section-inner two-col local-detail local-detail-tight">
        <div>
          <p class="eyebrow dark">Who this helps</p>
          <h2>Built for real operating problems, not just quote collecting.</h2>
          <p>This page is for ${escapeHtml(service.audience)} in ${escapeHtml(city.name)} and the surrounding area. We use the enquiry to understand what kind of courier, carrier, warehouse, freight or delivery partner is most likely to fit.</p>
        </div>
        <div>
          <p class="eyebrow dark">What happens next</p>
          <h2>A short qualification before referral.</h2>
          <p>We look at the service type, route, volume, timing, handling and commercial fit. If the enquiry is ready, it can then be placed with a relevant partner instead of being sent everywhere at once.</p>
        </div>
      </section>

      <section class="section-inner local-conversion">
        <div class="section-heading">
          <p class="eyebrow dark">How to know if it fits</p>
          <h2>Use the enquiry to get the job pointed in the right direction.</h2>
        </div>
        <div class="insight-grid">
          <article class="insight-card">
            <h3>Good fit when</h3>
            <ul>
${cardItems(service.fit)}
            </ul>
          </article>
          <article class="insight-card">
            <h3>Watch for</h3>
            <ul>
${cardItems(service.redFlags)}
            </ul>
          </article>
          <article class="insight-card">
            <h3>Useful details</h3>
            <ul>
              <li>Collection and delivery postcodes</li>
              <li>Volume, size, weight and timing</li>
              <li>What is failing or costing too much now</li>
              <li>Any access, customs, storage or handling notes</li>
            </ul>
          </article>
        </div>
      </section>

      <section class="section-inner faq-section">
        <div class="section-heading">
          <p class="eyebrow dark">Questions businesses ask</p>
          <h2>${escapeHtml(service.name)} questions.</h2>
        </div>
        <div class="faq-list">
${faqItems(localFaq)}
        </div>
      </section>

      <section class="section-inner lead-section" id="lead-form">
        <div class="lead-copy">
          <p class="eyebrow dark">Start here</p>
          <h2>Ask us about ${escapeHtml(service.phrase)} in ${escapeHtml(city.name)}.</h2>
          <p>Give us the basics and we will point the enquiry towards a relevant delivery, courier or supply chain partner.</p>
        </div>
        <form class="lead-form" data-lead-form data-thank-you="../../thank-you.html">
          <div class="form-row">
            <label>Business name<input name="business" autocomplete="organization" required></label>
            <label>Contact name<input name="name" autocomplete="name" required></label>
          </div>
          <div class="form-row">
            <label>Email<input name="email" type="email" autocomplete="email" required></label>
            <label>Phone<input name="phone" type="tel" autocomplete="tel"></label>
          </div>
          <div class="form-row">
            <label>Service needed<select name="service" data-service-options required></select></label>
            <label>Collection area<input name="location" value="${escapeHtml(city.name)}" required></label>
          </div>
          <div class="form-row">
            <label>Approx volume<select name="volume">
              <option value="">Not sure yet</option>
              <option>1-20 shipments a week</option>
              <option>20-100 shipments a week</option>
              <option>100+ shipments a week</option>
              <option>Project or one-off movement</option>
            </select></label>
            <label>Main issue<select name="issue">
              <option value="">Choose if relevant</option>
              <option>Price has increased</option>
              <option>Collections are unreliable</option>
              <option>Service does not fit the goods</option>
              <option>Need a new delivery partner</option>
              <option>Need storage or fulfilment</option>
              <option>Customs or international paperwork</option>
              <option>Sea freight or container planning</option>
              <option>Damage or failed deliveries</option>
            </select></label>
          </div>
          <label>What do you need help with?<textarea name="details" rows="5" placeholder="Tell us what moves, how often, where it goes and what is not working." required></textarea></label>
          <label class="consent-line"><input name="consent" type="checkbox" required> I am happy for The Delivery Desk and SVMK to use these details to contact me and, where relevant, introduce a suitable delivery or logistics partner.</label>
          <button class="button primary full" type="submit">Send enquiry</button>
          <p class="form-note">No obligation. We use the details to understand the job before making any introduction. Read the <a href="../../privacy.html">privacy notice</a>.</p>
          <p class="form-status" role="status" data-form-status></p>
        </form>
      </section>
    </main>

    <footer class="site-footer">
      <div>
        <strong>The Delivery Desk</strong>
        <p>Independent logistics matching, powered by SVMK.</p>
      </div>
      <div class="footer-links">
        <a href="../../index.html">Back to home</a>
        <a href="../../privacy.html">Privacy</a>
      </div>
    </footer>

    <script src="../../script.js"></script>
    <script>document.querySelectorAll("[data-service-options]").forEach((select) => { select.value = "${service.slug}"; });</script>
  </body>
</html>
`;
}

function serviceIndexHtml(service) {
  const title = `${service.name} | The Delivery Desk`;
  const description = `Practical help with ${service.phrase}, including partner selection, service fit and delivery route planning. Powered by SVMK.`;
  const cityLinks = cities.map((city) => `<a href="${citySlug(city.name)}/index.html">${escapeHtml(service.name)} in ${escapeHtml(city.name)}</a>`).join("\n");
  const canonical = `${siteUrl}/${service.slug}`;
  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": service.name,
      "description": description,
      "areaServed": "United Kingdom",
      "provider": {
        "@type": "ProfessionalService",
        "name": "The Delivery Desk"
      }
    },
    faqSchema(service.faq)
  ];

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}">
    <link rel="canonical" href="${escapeHtml(canonical)}">
    <link rel="stylesheet" href="../styles.css">
    <script type="application/ld+json">${JSON.stringify(schema)}</script>
  </head>
  <body>
    <header class="site-header">
      <a class="brand" href="../index.html" aria-label="The Delivery Desk home">
        <span class="brand-mark">TDD</span>
        <span>
          <strong>The Delivery Desk</strong>
          <small>Powered by SVMK</small>
        </span>
      </a>
      <nav class="main-nav" aria-label="Primary navigation">
        <a href="../index.html#services">Services</a>
        <a href="../index.html#assistant">Assistant</a>
        <a class="nav-action" href="#lead-form">Get matched</a>
      </nav>
    </header>

    <main>
      <section class="local-hero">
        <div class="section-inner">
          <p class="eyebrow dark">Service overview</p>
          <h1>${escapeHtml(service.name)}</h1>
          <p>${escapeHtml(service.intro)} We look at the job first, then help you find the right kind of delivery partner.</p>
          <a class="button primary" href="#lead-form">Ask us to take a look</a>
        </div>
      </section>

      <section class="section-inner two-col local-detail">
        <div>
          <p class="eyebrow dark">What matters</p>
          <h2>Make sure the service fits before you chase quotes.</h2>
          <p>This service is usually relevant for ${escapeHtml(service.audience)}. ${escapeHtml(service.warning)}</p>
        </div>
        <aside class="expert-panel">
          <h3>What we check</h3>
          <ul class="check-list compact">
${listItems(service.checks)}
          </ul>
        </aside>
      </section>

      <section class="section-inner local-conversion">
        <div class="section-heading">
          <p class="eyebrow dark">Service fit</p>
          <h2>Use this when the problem is more than just getting another quote.</h2>
        </div>
        <div class="insight-grid">
          <article class="insight-card">
            <h3>Good fit when</h3>
            <ul>
${cardItems(service.fit)}
            </ul>
          </article>
          <article class="insight-card">
            <h3>Watch for</h3>
            <ul>
${cardItems(service.redFlags)}
            </ul>
          </article>
          <article class="insight-card">
            <h3>Useful details</h3>
            <ul>
              <li>Collection and delivery areas</li>
              <li>Volume, timing, weight and size</li>
              <li>Current supplier or process issues</li>
              <li>Any access, customs, storage or handling notes</li>
            </ul>
          </article>
        </div>
      </section>

      <section class="section-inner faq-section">
        <div class="section-heading">
          <p class="eyebrow dark">Questions businesses ask</p>
          <h2>${escapeHtml(service.name)} questions.</h2>
        </div>
        <div class="faq-list">
${faqItems(service.faq)}
        </div>
      </section>

      <section class="locations-band">
        <div class="section-inner">
          <div class="section-heading">
            <p class="eyebrow">Local pages</p>
            <h2>Choose a town or city.</h2>
          </div>
          <div class="location-links">
${cityLinks}
          </div>
        </div>
      </section>

      <section class="section-inner lead-section" id="lead-form">
        <div class="lead-copy">
          <p class="eyebrow dark">Start here</p>
          <h2>Ask us about ${escapeHtml(service.phrase)}.</h2>
          <p>Tell us what moves, where it goes and what is not working. We will use that to identify the right service type and next conversation.</p>
        </div>
        <form class="lead-form" data-lead-form data-thank-you="../thank-you.html">
          <div class="form-row">
            <label>Business name<input name="business" autocomplete="organization" required></label>
            <label>Contact name<input name="name" autocomplete="name" required></label>
          </div>
          <div class="form-row">
            <label>Email<input name="email" type="email" autocomplete="email" required></label>
            <label>Phone<input name="phone" type="tel" autocomplete="tel"></label>
          </div>
          <div class="form-row">
            <label>Service needed<select name="service" data-service-options required></select></label>
            <label>Collection area<input name="location" placeholder="Town or city" required></label>
          </div>
          <div class="form-row">
            <label>Approx volume<select name="volume">
              <option value="">Not sure yet</option>
              <option>1-20 shipments a week</option>
              <option>20-100 shipments a week</option>
              <option>100+ shipments a week</option>
              <option>Project or one-off movement</option>
            </select></label>
            <label>Main issue<select name="issue">
              <option value="">Choose if relevant</option>
              <option>Price has increased</option>
              <option>Collections are unreliable</option>
              <option>Service does not fit the goods</option>
              <option>Need a new delivery partner</option>
              <option>Need storage or fulfilment</option>
              <option>Customs or international paperwork</option>
              <option>Sea freight or container planning</option>
              <option>Damage or failed deliveries</option>
            </select></label>
          </div>
          <label>What do you need help with?<textarea name="details" rows="5" placeholder="Tell us what moves, how often, where it goes and what is not working." required></textarea></label>
          <label class="consent-line"><input name="consent" type="checkbox" required> I am happy for The Delivery Desk and SVMK to use these details to contact me and, where relevant, introduce a suitable delivery or logistics partner.</label>
          <button class="button primary full" type="submit">Send enquiry</button>
          <p class="form-note">No obligation. We use the details to understand the job before making any introduction. Read the <a href="../privacy.html">privacy notice</a>.</p>
          <p class="form-status" role="status" data-form-status></p>
        </form>
      </section>
    </main>

    <footer class="site-footer">
      <div>
        <strong>The Delivery Desk</strong>
        <p>Independent logistics matching, powered by SVMK.</p>
      </div>
      <div class="footer-links">
        <a href="../index.html">Back to home</a>
        <a href="../privacy.html">Privacy</a>
      </div>
    </footer>

    <script src="../script.js"></script>
    <script>document.querySelectorAll("[data-service-options]").forEach((select) => { select.value = "${service.slug}"; });</script>
  </body>
</html>
`;
}

const generated = [];
const sitemapPaths = [
  "/",
  "/privacy"
];

for (const service of services) {
  const serviceDir = path.join(__dirname, service.slug);
  fs.mkdirSync(serviceDir, { recursive: true });
  fs.writeFileSync(path.join(serviceDir, "index.html"), serviceIndexHtml(service), "utf8");
  sitemapPaths.push(`/${service.slug}`);

  for (const city of cities) {
    const dir = path.join(__dirname, service.slug, citySlug(city.name));
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "index.html"), pageHtml(service, city), "utf8");
    generated.push(`${service.slug}/${citySlug(city.name)}/`);
    sitemapPaths.push(`/${service.slug}/${citySlug(city.name)}`);
  }
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapPaths.map((urlPath) => `  <url><loc>${siteUrl}${urlPath}</loc></url>`).join("\n")}
</urlset>
`;

const robots = `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`;

const notFound = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Page Not Found | The Delivery Desk</title>
    <meta name="robots" content="noindex">
    <link rel="stylesheet" href="/styles.css">
  </head>
  <body>
    <main>
      <section class="local-hero">
        <div class="section-inner">
          <p class="eyebrow dark">Page not found</p>
          <h1>That delivery page is not available.</h1>
          <p>Start from the homepage and choose the service or location that fits what you need moving.</p>
          <a class="button primary" href="/">Back to home</a>
        </div>
      </section>
    </main>
  </body>
</html>
`;

fs.writeFileSync(path.join(__dirname, "generated-pages.txt"), generated.join("\n") + "\n", "utf8");
fs.writeFileSync(path.join(__dirname, "sitemap.xml"), sitemap, "utf8");
fs.writeFileSync(path.join(__dirname, "robots.txt"), robots, "utf8");
fs.writeFileSync(path.join(__dirname, "404.html"), notFound, "utf8");
console.log(`Generated ${generated.length} local service pages.`);
