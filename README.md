# Sphinx AI Academy Hub: Meta version

This is the version of the Sphinx AI Academy Educational Hub that was built with Meta AI. It is kept as a separate candidate alongside [`sphinx-ai-academy-hub`](https://github.com/Basnight59/sphinx-ai-academy-hub), the ChatGPT version, until the two are reconciled.

It is a single-page React app with seven sections: Home, The Method, TTL + GIGO, Curriculum, Scarlet Letter F + Re-entry, Certification (proposed TTL Standard v0.2), and Research / Evidence.

## Provenance

- `src/App.tsx` and `src/index.css` are Meta's original files, copied **unchanged** from the exported archive (`SphinxAcademyHub.tar.gz`).
- Everything else was added only so the app builds and runs as a standalone project: `package.json`, `index.html`, `src/main.tsx`, the Vite, Tailwind, PostCSS and TypeScript configs, and this README.

## Run

```bash
npm install
npm run dev      # local development
npm run build    # static build in dist/
```

## Known issues (not yet fixed)

These come from Meta's original code and are recorded here, not patched, so this repo stays a faithful copy of Meta's version.

1. **Saving needs a backend that isn't included.** The progress tracker and the certification checklist call a relative `actions` endpoint (`records.list`, `records.create`, `records.delete`). Without it, the page shows "Saving is unavailable in this preview", and ticking an item fails and is undone.
2. **Even with a backend, progress would be shared.** Records have no per-user key, so every visitor would see and change the same checklist.
3. **Unticking and re-ticking an item may fail.** Re-checking reuses the same duplicate-prevention key, so depending on the backend it may return the deleted record.
4. **Sections have no URLs.** They can't be bookmarked or linked, and the browser's Back button leaves the site.
5. **Dark mode is unreadable in places.** Green labels and links nearly disappear, and the yellow notice boxes get light text.
6. **Some content needs review before publishing.** It includes an internal outreach note, an unverified "Delaware holding company, est. 2025", and a 1609 start date for "Slavery 1.0". The terms SGE, HOB, KAT Score and "Council of Five" are never explained.
7. **Minor:** unused imports and state; fonts load from Google Fonts at runtime.

## Status

The educational draft is for pilot discussion only. SGE / TTL Certification is a **proposed** standard (v0.2), not an accredited one.
