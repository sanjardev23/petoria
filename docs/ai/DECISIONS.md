# Architectural Decisions: Nestar → Petoria

> Status as of **2026-10-05**. Each decision lists its status, the reason, risks, and the alternatives.
> **Accepted** = approved by the project owner. **Rejected** = the owner chose something else. **Proposed** = suggested by an earlier AI session but **not confirmed yet**.
> The rules in `CLAUDE.md` (Domain Rules, Workflow, Validation) win over this file.

## Summary

| ID | Decision | Status |
|---|---|---|
| D1 | Migrate in phases: rename layer → domain layer → frontend (the role layer was dropped, see P2) | Accepted |
| D2 | The rename layer does not change the GraphQL API, MongoDB, or business logic | Accepted |
| D3 | Move folders with `git mv` | Accepted |
| D4 | Rename `nestar-batch.controller.ts` → `batch.controller.ts` | Accepted |
| D5 | Validate with `tsc --noEmit` (api + batch) + `npm run build`; lint only when rewriting files is OK | Accepted (updated 2026-10-05) |
| D6 | Never read or edit `.env`; keep the DB name inside the Mongo URI | Accepted |
| D7 | One commit per task on `modification`; user is the only author; no PRs | Accepted |
| D8 | Do not fix old lint/test problems inside a rename commit | Accepted |
| D9 | Do not kill processes the session did not start | Accepted |
| D10 | AI handoff docs live in `docs/ai/`; project rules and skills live in `CLAUDE.md` and `.claude/skills/` | Accepted (2026-10-05) |
| P1 | **Product** becomes the main entity, with `ProductType` `PET, FOOD, TOY, ACCESSORY` + `productSpecies` + `productGender` | **Accepted** (2026-10-05) |
| P2 | `MemberType.AGENT` → `SELLER` | **Rejected** (2026-10-05): `AGENT` stays |
| P3 | Replace the property module in place; new `products` collection; drop the old `properties` collection (dev DB) after the product code works | **Accepted** (2026-10-05) |
| P4 | Keep the location enum (renamed `ProductLocation`) | **Accepted** (2026-10-05) |
| P5 | Orders / cart / payment are out of scope for now | Proposed |
| P6 | Move `OrdinaryInquiry` to a common DTO file | **Accepted** (2026-10-05, part of the approved plan; done) |
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

### D5: Validation commands (updated 2026-10-05)
- **Now (from `CLAUDE.md` Validation):** after backend work run
  `npx tsc -p apps/petoria-api/tsconfig.app.json --noEmit` · `npx tsc -p apps/petoria-batch/tsconfig.app.json --noEmit` · `npm run build`.
- **Lint:** `npm run lint` uses `eslint --fix`, which re-formats files (for example the space-indented `test/app.e2e-spec.ts`). Use it only when file rewriting is OK. A report-only run (`npx eslint "{src,apps,libs,test}/**/*.ts"`) is still fine for comparing against the baseline.
- **Risks:** `tsc` per app config skips `test/` (excluded in `tsconfig.app.json`), so spec files are covered only by ESLint. `npm run build` writes `dist/`.
- **History:** on 2026-10-03 the checks were report-only ESLint + `tsc --noEmit`, compared before and after the rename.

### D10: Where AI docs and rules live
- **Why:** The handoff docs moved from `docs/` to `docs/ai/` (commit `65c2d74`). Rules that Claude must always follow are in `CLAUDE.md`, which loads automatically every session. Repeatable workflows are skills in `.claude/skills/<name>/SKILL.md` (`backend-migration`, `product-logic`, `commit`).
- **Risks:** The docs and `CLAUDE.md` can drift apart. `CLAUDE.md` wins when they disagree.

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

## Decided by the owner (2026-10-05, in `CLAUDE.md` Domain Rules)

### Product details (2026-10-05)
- `ProductStatus`: `ACTIVE`, `SOLD_OUT`, `DELETE`.
- `productSpecies` is required for every product. `productGender` and `productBirthDate` are only for `PET`.
- No `productStock`, `productBrand`, `productOnSale`, `productFreeDelivery`. The `options` filter is removed.
- Full target model: [ER_MODEL.md](ER_MODEL.md).

### P1: Product as the main entity: Accepted
- **Decision:** One `Product` entity. Pets are products too: `ProductType` = `PET`, `FOOD`, `TOY`, `ACCESSORY`. Extra fields: `productSpecies` (`DOG`, `CAT`, `BIRD`, `FISH`) and `productGender` (`MALE`, `FEMALE`). Do not bring back property or real-estate fields.
- **Why:** The property shape (title, price, images, desc, status, location, likes/views/comments/rank, owner) maps almost 1-to-1 to a product. One module covers both pets and pet goods.
- **Risks:** `productGender` has no meaning for food/toys. Its nullability must be decided when the schema is written.
- **Replaced idea:** The earlier proposal (`productCategory` with 8 values + `productPetType`) is dropped.

### P2: AGENT → SELLER: Rejected
- **Decision:** `MemberType.USER`, `AGENT`, `ADMIN` stay unchanged. Products are owned by `AGENT` members, unless a later migration explicitly changes it.
- **Effect:** No role layer. `getAgents`, `AgentsInquiry`, `availableAgentSorts`, `batchTopAgents` keep their names. Agent-related product names use "Agent" (e.g. `getAgentProducts`). No data migration for `memberType`.

## Proposed (needs confirmation before implementation)

### P3: Replace in place + new `products` collection: Accepted (2026-10-05)
- **Decision:** The property code becomes product code. Products live in a new, empty `products` collection. The old real-estate documents cannot be converted (no species, type or gender), so the `properties` collection is **dropped from the dev DB** in the clean-up step, after the product code works. Check the document count first. Production is not touched without a separate OK.
- **Why:** It avoids two parallel modules. A fresh collection avoids mixing old real-estate documents with new product documents. The old `properties` data stays untouched as a fallback.
- **Risks:** A breaking GraphQL change. Dev data in `properties` is not visible in the new UI.
- **Alternatives:** Add `product` next to `property` and remove `property` later (safer rollout, temporary duplication); migrate documents from `properties` → `products` with a script.

### P4: Keep the location enum: Accepted (2026-10-05)
- **Why:** The search UI already filters by city. A shop listing can still have a city (pickup/delivery area).
- **Risks:** It may not be needed for an online shop.
- **Alternatives:** Remove location; replace it with a free-text address or delivery zones.

### P5: Orders / cart / payment deferred
- **Why:** It keeps the domain migration a refactor, not a new feature set.
- **Risks:** `productStock` has no consumer until orders exist.
- **Alternatives:** Design `Order`/`Cart` modules together with Product.

### P6: `OrdinaryInquiry` → `libs/dto/common.input.ts`: Accepted and done (2026-10-05)
- **Why:** It is generic paging (`page`, `limit`) used by like, view, and property/product. It should not live in a domain DTO file.
- **Risks:** Import path updates only. The GraphQL type name stays the same.
- **Alternatives:** Keep it in `product.input.ts`.

### P7: Frontend after the backend, as a separate task
- **Why:** The frontend depends on the final GraphQL names. Each repo gets its own commits. The frontend **rename layer** (titles, footer, `package.json` name) does not depend on the backend and can be done first. Agent pages and names stay (P2 rejected).
- **Risks:** Between the backend domain commit and the frontend update, the frontend is broken against the dev API.
- **Alternatives:** Develop both in lockstep on the same day; or keep old GraphQL names for a short time.
