# Nigerian Community Leeds website

Static site for Nigerian Community Leeds (NCL): plain HTML, CSS and JavaScript, no framework.

## Structure

- `src/layout.html` – shared head, header, menu and footer
- `src/pages/*.html` – the content of each page
- `assets/css/main.css`, `assets/js/main.js` – styles and behaviour
- `*.html` in the root – the built pages (generated, do not edit by hand)

## Build

After changing anything in `src`, regenerate the pages (requires Node.js):

```bash
node build.js
```

## Preview

Serve the folder with any static server, for example:

```bash
php -S localhost:4173
```
