# Evidence for Living / 實證補給

Evidence-graded health education: 保健食品, GLP-1 and weight management, exercise, and nutrition,
plus the **21-Day Heart & Metabolism Reset** self-tracking program.

## Live site

https://supplescience.github.io/ (GitHub organization `supplescience`, repo `supplescience.github.io`).
Public and indexable (`robots.txt`, `sitemap.xml`). Privacy policy: `privacy.html`.

## Pages
- `index.html` — home; `guides.html` — all guides (topic filters); `tools.html` — tools hub
- Guides: `guide-glp1.html`, `guide-glp1-safety.html`, `guide-glp1-lifestyle.html` (GLP-1 parts 1–3),
  `guide-fish-oil.html`, `guide-red-yeast-rice.html`, `guide-exercise.html`, `guide-nutrition.html`
- Tools: `lookup.html` (supplement evidence lookup), `weight.html` (weight companion), `visit-prep.html`
  (visit prep sheet), `reset.html` (21-day reset), nutrition calculator inside GLP-1 part 3
- All reader data stays in the visitor's browser (localStorage). Google Analytics counts anonymous page views only.

## Run locally
```bash
python3 -m http.server 8000
```
Open http://localhost:8000

## Before going public
2. Consider a custom domain (add it to this repo's Pages settings) and a separate Google Analytics property.
