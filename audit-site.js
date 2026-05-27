const fs = require("fs");
const path = require("path");

const root = __dirname;
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

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, "utf8");
  const fileRel = rel(file);
  const ids = idsFor(html);

  if (!/<title>[^<]{8,}<\/title>/.test(html)) failures.push(`${fileRel}: missing or weak title`);
  else titles += 1;

  if (!/<meta name=["']description["'] content=(["']).{40,}?\1/.test(html) && !/<meta name=["']robots["'] content=["']noindex["']/.test(html)) {
    failures.push(`${fileRel}: missing useful meta description`);
  } else {
    descriptions += 1;
  }

  if (/<link rel=["']canonical["']/.test(html)) canonicals += 1;

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

if (!sitemap.includes("/locations/manchester")) failures.push("sitemap: missing Manchester location hub");
if (!sitemap.includes("/same-day-delivery/issues-solutions")) failures.push("sitemap: missing same-day guide");
if (!sitemap.includes("/how-we-work")) failures.push("sitemap: missing how-we-work page");
if (!sitemap.includes("/sectors/ecommerce")) failures.push("sitemap: missing ecommerce sector page");
if (sitemap.includes("/admin") || sitemap.includes("/thank-you")) failures.push("sitemap: contains noindex support pages");

console.log(JSON.stringify({
  htmlFiles: htmlFiles.length,
  titles,
  descriptions,
  canonicals,
  schemaBlocks,
  sitemapUrls: sitemapUrls.length,
  failures
}, null, 2));

if (failures.length) process.exit(1);
