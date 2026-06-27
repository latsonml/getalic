# getalic

Marketing landing page for **Alic** — static HTML, CSS, and GSAP. No build step.

## Local preview

```bash
python3 -m http.server 8080
```

Open `http://localhost:8080`.

Service pages live under `/services/<name>/`, e.g. `http://localhost:8080/services/reconciliation/`.

## Deploy on DigitalOcean App Platform

1. Push this repo to GitHub (`main` branch).
2. In [DigitalOcean Apps](https://cloud.digitalocean.com/apps), click **Create App** → **GitHub** → select **getalic**.
3. App Platform should detect a **Static Site** with `index.html` at the repo root.
4. Leave the build command empty. Set **Output directory** to `/` (repo root).
5. Optional: set **Catchall document** to `index.html` for hash-based in-page links.
6. Deploy.

You can also import `.do/app.yaml` when creating the app (update the `repo` field with your GitHub owner first).

## Structure

```
index.html                        Home landing page
services/reconciliation/index.html  MCA reconciliation service page
css/styles.css                    Shared styles
css/services.css                  Service page layouts
js/main.js                        Home animations + calculator
js/service.js                     Service page animations
assets/                           Images, favicon, SVGs
```

External dependencies (CDN): Google Fonts, GSAP 3.12.7, PostHog.
