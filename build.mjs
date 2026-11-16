// Builds the static site into dist/: compiled JS and CSS, one ready-rendered page per language, and the SEO files.
import { build } from "esbuild";
import { execFileSync } from "node:child_process";
import { cpSync, mkdirSync, rmSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";

const SITE_URL = "https://ide21.github.io";
rmSync("dist", { recursive: true, force: true });
mkdirSync("dist/en", { recursive: true });

// Browser bundle.
await build({
  entryPoints: ["src/client.jsx"], bundle: true, minify: true, outfile: "dist/app.js",
  jsx: "transform", define: { "process.env.NODE_ENV": '"production"' }, target: ["es2019"], logLevel: "info",
});
execFileSync("npx", ["@tailwindcss/cli", "-i", "src/input.css", "-o", "dist/styles.css", "--minify"], { stdio: "inherit" });
cpSync("public", "dist", { recursive: true });

// Build-time renderer: load content.js the way the browser does, then render each language.
const sandbox = { window: {} };
vm.runInNewContext(readFileSync("public/content.js", "utf8"), sandbox);
const S = sandbox.window.SITE;
globalThis.window = { SITE: S };
await build({
  entryPoints: ["src/prerender.jsx"], bundle: true, outfile: ".prerender.cjs", platform: "node", format: "cjs",
  jsx: "transform", define: { "process.env.NODE_ENV": '"production"' }, logLevel: "warning",
});
const { render } = createRequire(import.meta.url)("./.prerender.cjs");
rmSync(".prerender.cjs");

// Email as HTML character codes in the static page, so simple harvesters don't read it.
const hide = html => html.split(S.links.email).join([...S.links.email].map(c => "&#" + c.charCodeAt(0) + ";").join(""));
const esc = s => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

const L = S.links;
const person = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person", "@id": SITE_URL + "/#person",
      name: "Enad Alrougi", alternateName: "عناد الروقي",
      url: SITE_URL + "/", image: SITE_URL + "/avatar.jpg",
      jobTitle: "AI Researcher & Data Scientist",
      description: S.t.en.metaDescription,
      alumniOf: [
        { "@type": "CollegeOrUniversity", name: "Taif University" },
        { "@type": "CollegeOrUniversity", name: "University of Jeddah" },
      ],
      knowsAbout: ["Artificial intelligence", "Explainable AI", "Computer vision", "Deep learning", "Data science", "Data engineering", "Alzheimer's disease detection", "Finance", "Economics"],
      sameAs: [L.orcid, L.github, L.linkedin, L.x, L.medium, L.telegram],
    },
    ...S.publications.map(p => ({
      "@type": "ScholarlyArticle", headline: p.title, url: p.url,
      publisher: { "@type": "Organization", name: "IEEE" },
      author: { "@id": SITE_URL + "/#person" },
    })),
  ],
};

const template = lang => {
  const t = S.t[lang];
  const url = SITE_URL + (lang === "en" ? "/en/" : "/");
  return `<!doctype html>
<html lang="${lang}" dir="${t.dir}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(t.pageTitle)}</title>
<meta name="description" content="${esc(t.metaDescription)}">
<link rel="canonical" href="${url}">
<link rel="alternate" hreflang="ar" href="${SITE_URL}/">
<link rel="alternate" hreflang="en" href="${SITE_URL}/en/">
<link rel="alternate" hreflang="x-default" href="${SITE_URL}/">
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="icon" href="/icon-192.png" type="image/png" sizes="192x192">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<meta name="theme-color" content="#0A2F5C">
<meta name="google-site-verification" content="rmDjnLMRA2TQO0dN42GVfMxS3eyuuiP-ER7Mzuzy24k">
<meta property="og:type" content="profile">
<meta property="og:title" content="${esc(t.pageTitle)}">
<meta property="og:description" content="${esc(t.metaDescription)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE_URL}/og-card.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(t.pageTitle)}">
<meta property="og:locale" content="${lang === "en" ? "en_US" : "ar_SA"}">
<meta property="og:locale:alternate" content="${lang === "en" ? "ar_SA" : "en_US"}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@ID_E21">
<meta name="twitter:image" content="${SITE_URL}/og-card.jpg">
<script type="application/ld+json">${JSON.stringify(person)}</script>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/styles.css">
<script src="/content.js"></script>
<script>
  // Theme: the visitor's saved choice, else the device setting.
  (function () {
    var saved = null; try { saved = localStorage.getItem("theme"); } catch (e) {}
    var dark = saved ? saved === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.toggle("dark", dark);
  })();
</script>
</head>
<body>
<div id="root">${hide(render(lang))}</div>
<script src="/app.js"></script>
</body>
</html>
`;
};
writeFileSync("dist/index.html", template("ar"));
writeFileSync("dist/en/index.html", template("en"));

const today = new Date().toISOString().slice(0, 10);
writeFileSync("dist/sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${["/", "/en/"].map(p => `  <url>
    <loc>${SITE_URL}${p}</loc>
    <lastmod>${today}</lastmod>
    <xhtml:link rel="alternate" hreflang="ar" href="${SITE_URL}/"/>
    <xhtml:link rel="alternate" hreflang="en" href="${SITE_URL}/en/"/>
  </url>`).join("\n")}
</urlset>
`);
writeFileSync("dist/robots.txt", `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);
console.log("Built dist/ (ar + en pages, sitemap, robots)");
