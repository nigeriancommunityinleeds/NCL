// Builds the site: wraps each page in src/pages with src/layout.html, fills in the
// SEO tags, and writes the finished pages plus sitemap.xml and robots.txt next to this script.
// Usage: node build.js
const fs = require('fs');
const path = require('path');

// The address the site is published at. Canonical URLs, the sitemap and social tags depend on it.
const SITE_URL = 'https://nigerialeeds.org.uk';
// Google Analytics 4 measurement ID (looks like G-XXXXXXXXXX). Leave empty to ship no tracking.
const GA_MEASUREMENT_ID = '';
const DEFAULT_SHARE_IMAGE = 'https://nigerialeeds.org.uk/wp-content/uploads/2020/03/img_1047-1024x683.jpg';

const root = __dirname;
const pagesDir = path.join(root, 'src', 'pages');
const layout = fs.readFileSync(path.join(root, 'src', 'layout.html'), 'utf8');

// Each page starts with a one-line JSON comment: <!--meta {"title": ..., "description": ..., ...} -->
const META = /^<!--meta\s+(\{.*\})\s*-->\s*/;

const ORGANISATION = {
  '@context': 'https://schema.org',
  '@type': 'NGO',
  name: 'Nigerian Community Leeds',
  alternateName: 'NCL',
  url: `${SITE_URL}/`,
  logo: 'https://nigerialeeds.org.uk/wp-content/uploads/2013/03/logo-e1364282303320.png',
  description:
    'A registered charity supporting people who are Nigerian by birth, ancestry and descent, marriage, naturalisation or adoption in and around Leeds.',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '25 Compton Road',
    addressLocality: 'Leeds',
    addressRegion: 'West Yorkshire',
    postalCode: 'LS9 7BJ',
    addressCountry: 'GB',
  },
  telephone: '+44 7786 967385',
  email: 'admin@nigerialeeds.org.uk',
  identifier: { '@type': 'PropertyValue', name: 'Charity Commission number', value: '1129681' },
};

const escapeAttribute = (text) => text.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
const urlOf = (file) => (file === 'index.html' ? `${SITE_URL}/` : `${SITE_URL}/${file}`);
const jsonLd = (data) => `<script type="application/ld+json">${JSON.stringify(data)}</script>`;

function structuredData(file, meta) {
  const blocks = [jsonLd(ORGANISATION)];
  if (file !== 'index.html') {
    blocks.push(
      jsonLd({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: urlOf('index.html') },
          { '@type': 'ListItem', position: 2, name: meta.name, item: urlOf(file) },
        ],
      }),
    );
  }
  return blocks.join('\n  ');
}

function analytics() {
  if (!GA_MEASUREMENT_ID) return '';
  return `<script async src="https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${GA_MEASUREMENT_ID}');
  </script>`;
}

function checkLengths(file, meta) {
  if (meta.title.length > 60) console.warn(`  ! ${file}: title is ${meta.title.length} characters (aim for 50 to 60)`);
  if (meta.description.length < 120 || meta.description.length > 160) {
    console.warn(`  ! ${file}: description is ${meta.description.length} characters (aim for 150 to 160)`);
  }
}

const built = [];

for (const file of fs.readdirSync(pagesDir).filter((name) => name.endsWith('.html'))) {
  const sourcePath = path.join(pagesDir, file);
  const source = fs.readFileSync(sourcePath, 'utf8');
  const match = source.match(META);
  if (!match) throw new Error(`${file}: missing the <!--meta {...} --> comment on line 1`);

  const meta = JSON.parse(match[1]);
  checkLengths(file, meta);

  const fields = {
    title: escapeAttribute(meta.title),
    description: escapeAttribute(meta.description),
    keywords: escapeAttribute(meta.keywords),
    canonical: urlOf(file),
    shareImage: meta.image || DEFAULT_SHARE_IMAGE,
  };

  const html = layout
    .replace(/\{\{(title|description|keywords|canonical|shareImage)\}\}/g, (_, key) => fields[key])
    .replace('{{structuredData}}', () => structuredData(file, meta))
    .replace('{{analytics}}', analytics)
    .replace('{{content}}', () => source.slice(match[0].length).trim())
    .replace(` data-nav="${meta.nav}"`, ' aria-current="page"')
    .replace(/ data-nav="[^"]*"/g, '');

  fs.writeFileSync(path.join(root, file), html);
  built.push({ file, modified: fs.statSync(sourcePath).mtime.toISOString().slice(0, 10) });
  console.log(`built ${file}`);
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${built
  .map(
    ({ file, modified }) => `  <url>
    <loc>${urlOf(file)}</loc>
    <lastmod>${modified}</lastmod>
    <priority>${file === 'index.html' ? '1.0' : '0.8'}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>
`;
fs.writeFileSync(path.join(root, 'sitemap.xml'), sitemap);

const robots = `User-agent: *
Allow: /
Disallow: /src/
Disallow: /build.js

Sitemap: ${SITE_URL}/sitemap.xml
`;
fs.writeFileSync(path.join(root, 'robots.txt'), robots);
console.log('built sitemap.xml and robots.txt');
