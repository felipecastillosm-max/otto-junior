# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Otto Junior** — PWA for a Chilean interurban bus assistant ("auxiliar de bus"). It tracks who is riding, in which seat, warns before each passenger's stop, and generates the WhatsApp report sent to the company. Must work reliably with little or no connectivity (routes run overnight through northern Chile with poor signal), so it is offline-first by design.

The person building this (product owner, not a programmer — a digital marketer) directs every change in plain language; Claude Code is the sole implementer. Confirm before inventing data for anything that feeds the legal "relación de pasajeros" document handed to Carabineros — get the real numbers/layout from them rather than guessing.

## Current stack (official, confirmed)

| Layer | Tech |
|---|---|
| Frontend | Plain HTML + CSS + JavaScript (no framework, no build step) — PWA |
| Hosting / public API | Cloudflare Workers |
| Database | **Supabase** (decided; not yet wired in — see "Backend status" below) |
| Offline | IndexedDB on-device + manual sync logic (Supabase has no built-in offline sync, unlike Firebase) |
| GPS | Browser Geolocation API, phase one |
| Native app (final phase) | Capacitor — wraps this same PWA to get true background GPS; installed as a sideloaded `.apk`, not distributed through Google Play |
| Repo / deploy | GitHub + GitHub Actions |

### Backend status — read before touching `backend/` or `workers/`

`backend/Code.gs` (Google Apps Script + Sheets) and `workers/src/index.js` (a Cloudflare Worker proxying to that Apps Script) were the **first-draft backend**, built and deployed before the team settled on Supabase. They still work (ping/list/add passenger against a Sheet), but they are not the target architecture. When implementing real backend features, build against Supabase and expect to replace this Apps Script layer rather than extend it, unless told otherwise.

## Commands

No package manager / build step for the frontend — it's static files served as-is.

**Frontend (local, free, no deploy):**
```
# from public/, right-click index.html → "Open with Live Server" in VS Code
# or:
npx serve public
```

**Cloudflare Worker (local, free — does not publish anything):**
```
cd workers
npm install        # first time only
npx wrangler dev    # runs on http://localhost:8787
```
`public/app.js` points `API_BASE` at `http://localhost:8787` for local testing.

**Apps Script backend (legacy layer, manual push if ever needed):**
```
clasp push --force
clasp deploy --description "..."   # only when publishing a new version
```
Pushing to `backend/**` on the tracked branch auto-deploys via `.github/workflows/deploy-appscript.yml`. Pushing to `workers/**` auto-deploys via `.github/workflows/deploy-worker.yml` (needs `CLOUDFLARE_API_TOKEN`/`CLOUDFLARE_ACCOUNT_ID` repo secrets, already configured).

There is no test suite and no linter configured yet.

## Architecture

```
public/          4-screen PWA: index (home), pasajeros, paradero, reporte
  styles.css     shared design system (see below) — every screen imports it
  app.js         fetch helpers (apiGet/apiPost) hitting the Worker; online/offline badge state
  assets/        brand art (logo, wordmark, icons) — cropped/cleaned from AI-generated sticker sheets
backend/         legacy Apps Script + Sheets backend (see status note above)
workers/         Cloudflare Worker: CORS-wrapped proxy in front of the backend URL (env.APPS_SCRIPT_URL)
```

### Frontend state, today

Screens currently run on **mock/in-memory data**, not the real backend — the team is deliberately doing a full frontend design pass before wiring anything up. Don't assume `PASAJEROS`, `CONTRATOS`, `BUS_TEMPLATES`, etc. (defined inline in `pasajeros.html`) are persisted anywhere; they reset on reload. When backend work starts, this in-memory data needs to move to Supabase without changing the UI contract.

### Design system (`public/styles.css`)

CSS custom properties on `:root` — always reuse these, don't hardcode colors:
- `--accent` (teal `#00b9a6`) = primary brand color, normal navigation/actions
- `--secondary` (orange `#ff9800`) = reserved for alerts/attention (paradero warnings, not decoration)
- `--danger` (red) = only for "this needs immediate attention" (offline badge, seat-detail delete)
- Font: **Roboto** (loaded per-page via Google Fonts `<link>`, not bundled)
- Warning/alert cards use a "road sign" language established through iteration: yellow background (`#ffce00`), thick black border, black bold "ADVERTENCIA" — not gradients. A stop/city name inside an alert goes in a small red badge with white text (`.city-badge`), reusable via that class.
- Icons: no emoji in UI chrome (explicitly removed per product owner's preference) — the mascot/brand artwork (from `public/assets/`) or nothing, not hand-drawn SVGs.
- Bottom-sheet pattern (`.seat-sheet` / `.seat-sheet-panel`) is the standard way to show a secondary panel (search, passenger detail, forms) without navigating away — reuse it rather than inventing a new modal pattern.

### Business domain — bus seat maps (`pasajeros.html`)

The company runs exactly **two** bus models — don't add a third without being told. The UI shows only the seat-type name, never the manufacturer/model (product owner's explicit call — "Salón Cama" / "Semi Cama", not "Volvo B450R" or "Irizar"). Model names below are for our own reference only:
- **"Salón Cama"** (Volvo B450R, 43 seats, 2 floors, 2+1 per row) — **layout under revision**: real seat-map screenshots show piso 2 actually has only 31 seats (not the earlier-assumed 32 — a stairwell eats the right-side seat on 2 of the front rows) and piso 1 has seats 32–43 in a clean 4×3 grid. There's an unresolved contradiction on orientation: an earlier confirmation placed seat 1/2/3 as window-left/aisle-left/window-right (highest number of each triplet = right seat), but a later confirmation said seat 43 sits on the left — waiting on the product owner to resolve which is correct before finalizing `filas`.
- **"Semi Cama"** (Irizar, 42 seats, 1 floor, 2+2, correlative 1–42) — **confirmed**. Seat 2 is reserved for the bus assistant (rendered non-clickable via the `reservados` map on a bus template, styled like a normal occupied seat labeled "Asistente" rather than a disabled one), not sold to passengers.

When adding or correcting a bus template, keep the existing shape: `{ nombre, pisos: [{ id, nombre, filas }], reservados? }`, where `filas` is an array of 4-slot rows (`[left-window, left-aisle, right, null]`) generated by the `filas2mas1`/`filasCorrelativas` helpers already in the file — extend those helpers rather than writing one-off layouts inline.

"Relación de pasajeros" (the in-app report) must stay sorted strictly by seat number — that's what the assistant copies by hand onto the physical Carabineros sheet at highway checkpoints; don't change that ordering without being asked.

## Git workflow notes specific to this project

- The product owner works from a local clone in VS Code (Windows/PowerShell) and is not a programmer — commit messages and PR-adjacent explanations should stay in plain language when replying to them, but code/commits themselves follow normal conventions.
- Work happens directly on the tracked branch (no PR review step observed so far); commit and push after each meaningful change rather than batching unrelated changes together.
