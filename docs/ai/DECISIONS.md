# Architectural Decisions: Nestar → Petoria

> Status as of **2026-10-03**. Each decision lists its status, the reason, risks, and the alternatives.
> **Accepted** = approved by the project owner and applied. **Proposed** = suggested by the previous AI session but **not confirmed yet**.

## Summary

| ID | Decision | Status |
|---|---|---|
| D1 | Migrate in phases: rename layer → role layer → domain layer → frontend | Accepted |
| D2 | The rename layer does not change the GraphQL API, MongoDB, or business logic | Accepted |
| D3 | Move folders with `git mv` | Accepted |
| D4 | Rename `nestar-batch.controller.ts` → `batch.controller.ts` | Accepted |
| D5 | Validate with report-only ESLint + `tsc --noEmit`, compared against a baseline | Accepted |
| D6 | Never read or edit `.env`; keep the DB name inside the Mongo URI | Accepted |
| D7 | One commit per task on `modification`; user is the only author; no PRs | Accepted |
| D8 | Do not fix old lint/test problems inside a rename commit | Accepted |
| D9 | Do not kill processes the session did not start | Accepted |
| P1 | **Product** (pet products) becomes the main entity | Proposed |
| P2 | `MemberType.AGENT` → `SELLER` | Proposed |
| P3 | Replace the property module in place; new `products` collection; keep old data | Proposed |
| P4 | Keep the location enum (renamed `ProductLocation`) | Proposed |
| P5 | Orders / cart / payment are out of scope for now | Proposed |
| P6 | Move `OrdinaryInquiry` to a common DTO file | Proposed |
| P7 | Migrate the frontend after the backend, as a separate task in `petoria-next` | Proposed |

---

## Accepted

### D1: Phased migration
- **Why:** A rename-only commit is easy to review (90 files, almost all pure moves) and easy to revert. Mixing renames with domain changes hides logic bugs inside a huge diff.
- **Risks:** More commits, and a mixed state for a while (Petoria names on a real-estate domain).
- **Alternatives:** A single big-bang rewrite (faster, but impossible to review); starting a fresh repository (loses git history).

### D2: Rename layer keeps the API, DB, and logic unchanged
- **Why:** The frontend and existing dev data keep working with no coordinated deploy. The rename can be proven safe by type check + lint + a running app.
- **Risks:** Old domain names (`property`, `agent`) stay visible until the next phases.
- **Alternatives:** Renaming GraphQL types at the same time. This would break `petoria-next` immediately.

### D3: `git mv` for folder moves
- **Why:** Git records the files as renames (status `R`), so `git log --follow` and blame keep working.
- **Risks:** None in practice. Very large edits in the same commit could make git detect delete+add instead of a rename. Avoided here because content changes were tiny.
- **Alternatives:** Copy + delete (loses history detection).

### D4: `batch.controller.ts` file name
- **Why:** The class was already `BatchController`, and the sibling files are `batch.module.ts` / `batch.service.ts`. Removing the app name from the file name means the next rename does not need to touch it.
- **Risks:** None. Only one import (`batch.module.ts`) referenced it.
- **Alternatives:** `petoria-batch.controller.ts` (keeps the app name inside a file name, which is the same problem as before).

### D5: Report-only lint + `tsc --noEmit`, baseline vs after
- **Why:** The user asked for lint and typecheck. `npm run lint` uses `eslint --fix`, which would re-format unrelated files (for example the space-indented `test/app.e2e-spec.ts`) and pollute the rename commit. Running the checks **before** and **after** shows that problems are old, not new.
- **Commands:** `npx eslint "{src,apps,libs,test}/**/*.ts"` · `npx tsc --noEmit --incremental false -p apps/petoria-api/tsconfig.app.json` (and the same for `petoria-batch`).
- **Risks:** `tsc` per app config skips `test/` (excluded in `tsconfig.app.json`), so spec files are covered only by ESLint.
- **Alternatives:** `nest build` (writes `dist/`, slower); `npm run lint` (changes files).

### D6: No `.env` access; keep the Mongo DB name
- **Why:** Project rule. Env keys contain no project name, so nothing needs to change. Renaming the DB inside the URI would point the app at a new, empty database.
- **Risks:** If the DB is named `nestar…`, the old name stays visible in the connection string.
- **Alternatives:** Migrate or rename the database. This would need a data copy and the owner's approval.

### D7: Git workflow
- **Why:** Project rule (`CLAUDE.md`, `commit` skill). All migration work goes to `modification`, one commit per task, with the message style `feat: develop …` / `fix: modify …`. The owner is the only author: no co-author trailer, no PRs.
- **Risks:** No PR review step, so the self-review must be careful.
- **Alternatives:** Feature branches + PRs (rejected by the project rules).

### D8: Old lint/test problems are not fixed in the rename commit
- **Why:** It keeps the commit "names only". The 15 lint problems and the failing e2e expectations (`'Hello World!'`) were there before.
- **Risks:** The problems stay until a cleanup task fixes them (see [NEXT_STEPS.md](NEXT_STEPS.md)).
- **Alternatives:** Fix them in the same commit (mixes concerns).

### D9: Do not kill unknown processes
- **Why:** Port 3008 was held by PID 92147 (`dist/apps/nestar-api/main`, started 2026-10-02), which the session did not start. Killing it could break the owner's running work. The batch app was verified on `PORT_BATCH=3018` instead. This is a one-command override and `.env` was not touched.
- **Risks:** `npm run start:dev:batch` keeps failing on 3008 until the owner stops that process.
- **Alternatives:** `kill 92147` (needs the owner's OK).

---

## Proposed (needs confirmation before implementation)

### P1: Product as the main entity
- **Why:** A "pet shop" sells products. The property shape (title, price, images, desc, status, location, likes/views/comments/rank, owner) maps almost 1-to-1 to a product. Only the real-estate fields (beds, rooms, square, address, constructedAt, barter/rent) need replacing.
- **Risks:** If the business actually wants **pet listings** (sale/adoption with species, breed, age, gender), the schema is wrong.
- **Alternatives:** A `Pet` entity (closest to the listing UX); both `Pet` and `Product` modules (about twice the work).

### P2: AGENT → SELLER
- **Why:** "Agent" is real-estate language. "Seller" describes who creates products. It touches only the enum, the role guards, `getAgents`, and the batch ranking.
- **Risks:** Existing dev members with `memberType: 'AGENT'` stop matching the enum (data migration or reseed needed). The frontend `MemberType` enum must change at the same time.
- **Alternatives:** `SHOP`; keep `AGENT`.

### P3: Replace in place + new `products` collection
- **Why:** It avoids two parallel modules. A fresh collection avoids mixing old real-estate documents with new product documents. The old `properties` data stays untouched as a fallback.
- **Risks:** A breaking GraphQL change. Dev data in `properties` is not visible in the new UI.
- **Alternatives:** Add `product` next to `property` and remove `property` later (safer rollout, temporary duplication); migrate documents from `properties` → `products` with a script.

### P4: Keep the location enum
- **Why:** The search UI already filters by city. A shop listing can still have a city (pickup/delivery area).
- **Risks:** It may not be needed for an online shop.
- **Alternatives:** Remove location; replace it with a free-text address or delivery zones.

### P5: Orders / cart / payment deferred
- **Why:** It keeps the domain migration a refactor, not a new feature set.
- **Risks:** `productStock` has no consumer until orders exist.
- **Alternatives:** Design `Order`/`Cart` modules together with Product.

### P6: `OrdinaryInquiry` → `libs/dto/common.input.ts`
- **Why:** It is generic paging (`page`, `limit`) used by like, view, and property/product. It should not live in a domain DTO file.
- **Risks:** Import path updates only. The GraphQL type name stays the same.
- **Alternatives:** Keep it in `product.input.ts`.

### P7: Frontend after the backend, as a separate task
- **Why:** The frontend depends on the final GraphQL names. Each repo gets its own commits. The frontend **rename layer** (titles, footer, `package.json` name) does not depend on the backend and can be done first.
- **Risks:** Between the backend domain commit and the frontend update, the frontend is broken against the dev API.
- **Alternatives:** Develop both in lockstep on the same day; or keep old GraphQL names for a short time.
