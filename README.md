# Learn Quran — Juz by Juz

A deploy-anywhere web app for learning and memorizing the Quran through
structured, section-by-section guides. Each surah has verified Arabic +
translation, a thematic breakdown, key vocabulary, memory hooks, and a
recitation guide — modelled on a single hand-crafted reference guide.

**Currently shipped:** all 37 surahs of **Juz 30 (Juz Amma)**, built so the
other 29 juz can be added with no code changes.

- **Framework:** Next.js 15 (App Router) + TypeScript, statically exported (`output: "export"`)
- **Hosting:** any static host — Vercel, Netlify, Cloudflare Pages, GitHub Pages, S3
- **No backend / no login.** Progress tracking is stored in the browser (`localStorage`).

---

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # static site → ./out
```

Other scripts:

```bash
npm run fetch:verses # re-fetch verified Arabic + translation (see below)
node --experimental-strip-types scripts/validate-guides.mjs  # content integrity check
```

---

## How the content is structured

The single most important design decision: **the sacred text is kept separate
from the human-authored commentary.**

```
content/
  types.ts                 # the SurahGuide schema (read this first)
  surah-index.json         # generated: list of all surahs for the home page
  quran/
    78.json … 114.json     # VERIFIED Arabic (Uthmani) + Sahih Intl translation
  guides/
    index.ts               # registry: surah number → guide module
    83-al-mutaffifin.ts     # the flagship "gold standard" guide
    78-an-naba.ts … etc.    # one authored guide per surah
```

1. **Verified verse data** (`content/quran/*.json`) is fetched from the
   [AlQuran Cloud API](https://alquran.cloud/api) — Uthmani script and the Sahih
   International translation. It is **never hand-typed or model-generated.** The
   bismillah is stripped from verse 1 so each surah begins on its true first verse.

2. **The guide layer** (`content/guides/*.ts`) is authored commentary that
   **references verses by range only** (`{ from, to }`). At render time the app
   pulls the Arabic + translation from the verified JSON. A guide can never
   corrupt the Quranic text because it does not contain it.

3. The app **composes** the two: a section says "verses 7–9", and the component
   renders the verified ayahs for that range alongside the authored notes.

## Editing or reviewing a guide

Open `content/guides/<num>-<slug>.ts`. It is a typed object — your editor will
flag any mistakes against `content/types.ts`. The teaching commentary is an
educational aid; the Arabic and translation are verified, but the commentary
should be checked by a qualified scholar.

After any edit, run the integrity check (it verifies sections cover every verse
with no gaps/overlaps, and that vocab Arabic appears in the real surah text):

```bash
node --experimental-strip-types scripts/validate-guides.mjs
```

---

## Adding a new surah (or a whole new juz)

1. **Fetch the verses.** Edit the `FIRST`/`LAST` range (and the
   `REVELATION_ORDER` table) in `scripts/fetch-verses.mjs`, then:
   ```bash
   npm run fetch:verses
   ```
   This writes `content/quran/<num>.json` and regenerates `surah-index.json`.

2. **Author the guide.** Copy `83-al-mutaffifin.ts` as a template, fill it in for
   the new surah, and save it as `content/guides/<num>-<slug>.ts`.

3. **Register it** in `content/guides/index.ts` (add the import + map entry).

4. **Validate & build:**
   ```bash
   node --experimental-strip-types scripts/validate-guides.mjs && npm run build
   ```

A surah that has verse data but no authored guide yet still gets a usable page —
it shows a "guide in progress" notice plus the full verified Arabic + translation.

---

## Deploying

It's a fully static site (`npm run build` → `./out`).

- **Vercel:** import the repo; framework preset = Next.js. Done.
- **Netlify / Cloudflare Pages:** build command `npm run build`, publish dir `out`.
- **GitHub Pages / S3 / any CDN:** upload the contents of `out/`.

---

## Sources & disclaimer

- Arabic (Uthmani) text and the Sahih International translation:
  [AlQuran Cloud API](https://alquran.cloud/api).
- Commentary (overviews, memory hooks, vocabulary notes, recitation guidance) is
  an educational aid. Guides marked **draft** have not been reviewed by a
  qualified scholar. Please verify any point of religious ruling with a trusted
  teacher.
```
