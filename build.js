// Builds the site: wraps each page in src/pages with src/layout.html
// and writes the finished .html files next to this script.
// Usage: node build.js
const fs = require('fs');
const path = require('path');

const root = __dirname;
const pagesDir = path.join(root, 'src', 'pages');
const layout = fs.readFileSync(path.join(root, 'src', 'layout.html'), 'utf8');

// Each page starts with: <!-- title: ... | description: ... | nav: ... -->
const META = /^<!--\s*title:\s*(.*?)\s*\|\s*description:\s*(.*?)\s*\|\s*nav:\s*(.*?)\s*-->\s*/;

for (const file of fs.readdirSync(pagesDir).filter((name) => name.endsWith('.html'))) {
  const source = fs.readFileSync(path.join(pagesDir, file), 'utf8');
  const meta = source.match(META);
  if (!meta) throw new Error(`${file}: missing the title | description | nav comment on line 1`);

  const [, title, description, nav] = meta;
  const html = layout
    .replace('{{title}}', title)
    .replace('{{description}}', description)
    .replace('{{content}}', () => source.slice(meta[0].length).trim())
    .replace(` data-nav="${nav}"`, ' aria-current="page"')
    .replace(/ data-nav="[^"]*"/g, '');

  fs.writeFileSync(path.join(root, file), html);
  console.log(`built ${file}`);
}
