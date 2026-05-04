# the-ngt-homepage

> The official homepage & landing page of **The Next Geeg Think (NGT)**.

NGT is a cognitive infrastructure company building systems that make ambitious learners, creators, and researchers more capable. This repository houses the public-facing landing page for the NGT brand.

---

## ⚠️ Read First

**All contributors and AI agents must read [`NGT_CORE.md`](./NGT_CORE.md) before making any changes.** It contains the synthesized brand identity, design rules, and product philosophy that governs all decisions in this repo.

---

## Branch Structure

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready landing page |
| `ts-test` | Technical spike — paper rip/torn scroll effect prototype |

---

## Tech Stack

- **Core:** HTML5, Vanilla JavaScript
- **Styling:** Vanilla CSS3 (CSS Variables, custom properties)
- **Effects:** SVG masking, CSS clip-path, Scroll-driven animations
- **Performance:** IntersectionObserver API, requestAnimationFrame
- **Fonts:** Google Fonts (Inter / Outfit)

---

## Development

```bash
# No build step required for prototype branches
# Open index.html directly or use any static server
npx serve .
```

---

*"The next big thing isn't a product. It's you."*
