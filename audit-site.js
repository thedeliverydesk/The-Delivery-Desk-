const fs = require("fs");
const path = require("path");

const root = __dirname;
const expectedSiteUrl = (process.env.SITE_URL || "https://thedeliverydesk.co.uk").replace(/\/$/, "");
const blockedLaunchHosts = [
  "the-delivery-desk-andy-3048s-projects.vercel.app"
];
const htmlFiles = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === ".git" || entry.name === "node_modules") continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
    } else if (entry.isFile() && entry.name.endsWith(".html")) {
      htmlFiles.push(fullPath);
    }
  }
}

function rel(file) {
  return path.relative(root, file).replace(/\\/g, "/");
}

function fileForHref(fromFile, href) {
  const clean = href.split("#")[0].split("?")[0];
  if (!clean || clean.startsWith("http") || clean.startsWith("mailto:") || clean.startsWith("tel:")) return null;
  if (clean.startsWith("/")) {
    if (clean === "/") return path.join(root, "index.html");
    const absoluteTarget = path.join(root, clean.replace(/^\/+/, ""));
    if (path.extname(absoluteTarget)) return absoluteTarget;
    return path.join(absoluteTarget, "index.html");
  }
  const resolved = path.resolve(path.dirname(fromFile), clean);
  if (path.extname(resolved)) return resolved;
  return path.join(resolved, "index.html");
}

function idsFor(html) {
  const ids = new Set();
  for (const match of html.matchAll(/\sid=["']([^"']+)["']/g)) ids.add(match[1]);
  return ids;
}

function jsonLdBlocks(html) {
  return [...html.matchAll(/<script type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/g)].map((match) => match[1]);
}

walk(root);

const failures = [];
let titles = 0;
let descriptions = 0;
let canonicals = 0;
let schemaBlocks = 0;
let openGraph = 0;
let twitterCards = 0;

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, "utf8");
  const fileRel = rel(file);
  const ids = idsFor(html);

  for (const host of blockedLaunchHosts) {
    if (html.includes(host)) failures.push(`${fileRel}: contains temporary launch host ${host}`);
  }

  if (!/<title>[^<]{8,}<\/title>/.test(html)) failures.push(`${fileRel}: missing or weak title`);
  else titles += 1;

  if (!/<meta name=["']description["'] content=(["']).{40,}?\1/.test(html) && !/<meta name=["']robots["'] content=["']noindex["']/.test(html)) {
    failures.push(`${fileRel}: missing useful meta description`);
  } else {
    descriptions += 1;
  }

  const canonicalMatch = html.match(/<link rel=["']canonical["'] href=["']([^"']+)["']/);
  if (canonicalMatch) {
    canonicals += 1;
    if (!canonicalMatch[1].startsWith(expectedSiteUrl)) {
      failures.push(`${fileRel}: canonical is not on ${expectedSiteUrl}`);
    }
  }

  if (/<meta property=["']og:title["']/.test(html) && /<meta property=["']og:description["']/.test(html)) openGraph += 1;
  if (/<meta name=["']twitter:card["']/.test(html)) twitterCards += 1;

  for (const block of jsonLdBlocks(html)) {
    try {
      JSON.parse(block);
      schemaBlocks += 1;
    } catch (error) {
      failures.push(`${fileRel}: invalid JSON-LD`);
    }
  }

  for (const match of html.matchAll(/\shref=["']([^"']+)["']/g)) {
    const href = match[1];
    if (href.startsWith("#")) {
      const anchor = href.slice(1);
      if (anchor && !ids.has(anchor)) failures.push(`${fileRel}: missing same-page anchor ${href}`);
      continue;
    }

    const target = fileForHref(file, href);
    if (target && !fs.existsSync(target)) failures.push(`${fileRel}: broken link ${href}`);

    const hash = href.split("#")[1];
    if (target && hash && fs.existsSync(target)) {
      const targetHtml = fs.readFileSync(target, "utf8");
      if (!idsFor(targetHtml).has(hash)) failures.push(`${fileRel}: target anchor not found ${href}`);
    }
  }
}

const sitemap = fs.readFileSync(path.join(root, "sitemap.xml"), "utf8");
const sitemapUrls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
const robots = fs.readFileSync(path.join(root, "robots.txt"), "utf8");

for (const host of blockedLaunchHosts) {
  if (sitemap.includes(host)) failures.push(`sitemap: contains temporary launch host ${host}`);
  if (robots.includes(host)) failures.push(`robots: contains temporary launch host ${host}`);
}

for (const url of sitemapUrls) {
  if (!url.startsWith(`${expectedSiteUrl}/`)) failures.push(`sitemap: URL is not on ${expectedSiteUrl}: ${url}`);
}

if (!robots.includes(`Sitemap: ${expectedSiteUrl}/sitemap.xml`)) {
  failures.push(`robots: missing sitemap for ${expectedSiteUrl}`);
}

if (!sitemap.includes("/locations/manchester")) failures.push("sitemap: missing Manchester location hub");
if (!sitemap.includes("/same-day-delivery/issues-solutions")) failures.push("sitemap: missing same-day guide");
if (!sitemap.includes("/how-we-work")) failures.push("sitemap: missing how-we-work page");
if (!sitemap.includes("/about")) failures.push("sitemap: missing about page");
if (!sitemap.includes("/service-finder")) failures.push("sitemap: missing service finder page");
if (!sitemap.includes("/delivery-review")) failures.push("sitemap: missing delivery review page");
if (!sitemap.includes("/delivery-costs")) failures.push("sitemap: missing delivery costs page");
if (!sitemap.includes("/ai-search")) failures.push("sitemap: missing AI search page");
if (!sitemap.includes("/sectors/ecommerce")) failures.push("sitemap: missing ecommerce sector page");
if (sitemap.includes("/admin") || sitemap.includes("/thank-you")) failures.push("sitemap: contains noindex support pages");
if (!/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/.test(sitemap)) failures.push("sitemap: missing lastmod dates");
if (!/<priority>/.test(sitemap)) failures.push("sitemap: missing priority hints");

for (const requiredFile of ["llms.txt", "llms-full.txt", "ai-search.json"]) {
  if (!fs.existsSync(path.join(root, requiredFile))) failures.push(`${requiredFile}: missing AI search asset`);
}

console.log(JSON.stringify({
  htmlFiles: htmlFiles.length,
  titles,
  descriptions,
  canonicals,
  openGraph,
  twitterCards,
  schemaBlocks,
  sitemapUrls: sitemapUrls.length,
  failures
}, null, 2));

if (failures.length) process.exit(1);
