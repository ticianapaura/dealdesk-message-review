# DealDesk Message Review

A design-challenge project: a marketing homepage, an interactive Communication Review prototype, and a process case study for **DealDesk**, a fictional B2B workspace for boutique transaction-advisory firms.

Everything runs in the browser on simulated data. There is no backend, no real review service, no email delivery and no real approval. All company names, people, projects and messages are invented.

## Challenge context

Built for the Futureproofing.dev Product Design Challenge. The brief asks for three deliverables, all served by this one application:

| Route | Deliverable |
|---|---|
| `/` | Marketing homepage: DealDesk as a workspace, with Communication Review as its featured workflow |
| `/prototype` | Functional Communication Review prototype: a scenario picker and three scenarios |
| `/process` | Process Journey: the design case study in twelve sections |

The design problem: a Deal Coordinator must send a sensitive message for Project Harbor. One recipient, Sam Lee, is not on the project team, and one sentence makes an unconfirmed commitment ("Completion is guaranteed by 30 June."). The message may be sent only when both issues are resolved and the current version of the draft has passed a review.

## Technology

- React 19 and TypeScript, built with Vite
- Plain CSS with design tokens; no UI library
- A small History API router (`src/router.tsx`); no routing dependency
- State in a typed reducer; no persistence
- Runtime dependencies: `react`, `react-dom`

## Getting started

Requires Node 20 or newer.

```bash
npm install
npm run dev
```

| Command | What it does |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run verify` | Run the rule checks on the state model and mock review engine |
| `npm run typecheck` | Type-check the app (`tsconfig.json`) and the Node verification script (`tsconfig.scripts.json`) |
| `npm run build` | Type-check the app, then build into `dist/` |
| `npm run preview` | Serve the production build locally |

## Prototype scenarios

Open `/prototype` and choose a scenario. Each one starts from a fixed state defined in `src/scenarios/index.ts`; **Reset scenario** in the bar at the top returns to it.

| Scenario | Route | Starting state | Journey |
|---|---|---|---|
| Main flow | `/prototype/main-flow` | Version 1, review completed, two blocking issues | Remove Sam Lee, revise the wording, Recheck, Send |
| Exception management | `/prototype/exception` | Same as Main flow | Request an exception for Sam Lee, then approve or reject it from the prototype bar, or withdraw it |
| Review unavailable | `/prototype/review-unavailable` | Version 3, both corrections made, review outdated | First Recheck fails; Retry check succeeds |

### Rules the prototype enforces

- Send is enabled only when the current draft version has passed a check with no unresolved blocking issue. It stays disabled while blocked, pending approval, outdated, checking or unavailable.
- Any edit to recipients or message text makes the review outdated and requires an explicit Recheck. Undo restores the recipient but is still an edit.
- A coordinator can request and withdraw an exception. Only the Deal Owner decides, and the workspace has no approve or reject action.
- Pending approval is not approval. An approved exception covers that recipient only.
- An approval that still applies survives unrelated edits and is re-evaluated by the next check.
- A failed check leaves Send disabled and offers Retry check.
- A sent message is read-only.

## What is simulated

- **Reviews.** `src/domain/reviewEngine.ts` is a deterministic mock with two fixed rules: a recipient outside the project team blocks unless an approved exception covers them, and a sentence containing "guarantee", "guarantees" or "guaranteed" blocks. It is a stand-in, not a claim about how real detection would work.
- **The Deal Owner.** Approve and Reject are in the prototype bar at the top of the screen. That bar is not part of DealDesk; it exists so a reviewer can drive the scenario.
- **The failed check.** The Review unavailable scenario fails exactly one check by design.
- **Sending.** Nothing is delivered anywhere.
- **Data.** All names, times and text are fixtures.

## Limitations

- Not implemented: Add recipient, free editing of the message outside the flagged sentence, exceptions for wording, the Deal Owner's own screens, and the Overview, Deals, Activity and Settings destinations.
- An approved recipient cannot be removed from the workspace; that control has not been designed.
- On narrow screens issues stay inline. The bottom-sheet pattern from the designs is not implemented.
- In the Hub only Project Harbor opens. The other rows are examples.
- On the homepage, Deal coordination and Operational visibility are labelled as product vision. Nothing has been designed or built for them.
- State is in memory. Reloading the page resets the scenario.
- Screenshots in the Process Journey were captured from this prototype on 24 November 2026. The five design-system images come from the design reference board. Recapture them if the UI changes.

## Project structure

```
index.html
src/
  main.tsx, App.tsx, router.tsx
  domain/            types, mock review engine, reducer (all transitions), selectors
  scenarios/         fixtures for the three scenarios
  components/        Shell, PrototypeBar, Modal, icons and tags
  features/          Hub, Workspace, SentView, modals
  pages/             Home, ScenarioPicker, ScenarioPage
  pages/process/     Process Journey page and screenshot size map
  styles/            app.css (tokens, prototype), home.css, process.css
scripts/
  verify-rules.ts    rule checks, run with npm run verify
public/journey/      screenshots used by the Process Journey
vercel.json          rewrites so /prototype and /process load directly
```

## Verification

Status as of 24 November 2026.

**Run and passed**

- `npm run verify`: 20 of 20 rule checks on the reducer and mock engine.
- 28 scripted browser checks in headless Chrome at 1280 px and 390 px, against a local bundle of this source, with no console errors:

| Area | Checked |
|---|---|
| Main flow: Blocked start, remove Sam Lee, Undo, revise wording, Recheck, Ready, Send, Sent record | Yes |
| Authorized recipient: confirmation, Cancel, confirm, Undo toast | Yes |
| Revise wording modal: prefilled, Save disabled until changed, empty-field error, Escape, focus return | Yes |
| Recheck with one correction stays Blocked | Yes |
| Exception: reason required, pending keeps Send disabled, no approve or reject in the workspace | Yes |
| Exception outcomes: approved, rejected, withdrawn; send to three after approval, revision and Recheck | Yes |
| Review unavailable: fail, Retry, recovery; Reset reproduces the failure | Yes |
| Reset scenario; Hub status; review history disclosure | Yes |
| `/`, `/prototype`, `/process` render; navigation between all three; direct load and refresh of `/process` | Yes |
| Homepage: headline, pillars, featured workflow, CTAs, section links | Yes |
| Process Journey: all images load, no empty links, anchors resolve, no prototype controls | Yes |
| No horizontal overflow at 390 px on `/`, the workspace and `/process` | Yes |

- TypeScript over all source with a stand-in for the React type definitions: no errors other than six event-handler parameters that the real React types infer.

**Not run**

- `npm install`, `npm run typecheck` with the real React types, `npm run build` and `npm run dev`. The environment this was prepared in could not install packages. The browser checks used an esbuild bundle of the same source, not the Vite build.
- A Vercel deployment and its rewrites.
- Screen readers, browsers other than Chrome, real devices.
- The toast's 10-second auto-dismiss.
- The browser check script is not part of this repository.
- Nothing has been tested with users.

## Deploying to Vercel

1. Push this repository to GitHub.
2. In Vercel, choose **Add New → Project** and import the repository.
3. Keep the detected settings: framework Vite, build command `npm run build`, output directory `dist`.
4. Deploy.
5. Check `/`, `/prototype`, a direct load of `/prototype/exception`, and a direct load and refresh of `/process`.

`vercel.json` rewrites `/prototype`, `/prototype/*` and `/process` to the app so those URLs work when opened directly. No environment variables are needed.
