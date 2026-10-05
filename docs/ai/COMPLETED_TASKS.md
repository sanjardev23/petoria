# Completed Tasks: Nestar → Petoria Migration

> Sessions: **2026-10-03**, **2026-10-05** · backend repo `petoria` · branch `modification`

## 1. Task log

| # | Task | Result | Commit |
|---|---|---|---|
| 1 | Analysed the monorepo structure (apps, modules, schemas, batch, config) and the sibling frontend `petoria-next` | Full inventory of real-estate code and every `nestar` reference | — |
| 2 | Drafted a full domain migration plan (Property → Product, AGENT → SELLER) | Plan written. The owner did not confirm the domain choices that day. On 2026-10-05: Product accepted (with new enum values), SELLER rejected ([DECISIONS.md](DECISIONS.md)) | — |
| 3 | Planned and implemented the **safe rename layer** (names only, no logic/API/DB change) | Done | `f9c138e fix: Modify project name into petoria` (committed by the owner) |
| 4 | Validated the rename (lint, typecheck, both apps running) | Passed. No new problems (see §3) | — |
| 5 | Wrote the migration documentation (`docs/*.md`) | This folder | `095708b feat: create agentic docs and history` |
| 6 | Moved the docs to `docs/ai/` | Same files, new place | `65c2d74 fix: modify docs content` |
| 7 | 2026-10-05: Added owner rules to `CLAUDE.md` (Read First, Project Shape, Domain Rules, Workflow, Validation); added the skills `backend-migration` and `product-logic` (`.claude/skills/`) and `SKILLS.MD` | Domain decided: Product with `ProductType` `PET/FOOD/TOY/ACCESSORY`, `productSpecies`, `productGender`; `AGENT` stays | `172bcdc` |
| 8 | 2026-10-05: Updated `docs/ai/*` to match `CLAUDE.md` (P1 accepted, P2 rejected, new validation commands, `docs/ai/` paths, port 3008 free) | This folder | `172bcdc` |
| 9 | 2026-10-05: ER model for Petoria (`docs/ai/ER_MODEL.md` + shareable diagram page); owner confirmed product details, P3, P4 | Docs only | `9ac47a9` |
| 10 | 2026-10-05: **Domain layer**: property → product in API and batch; fixed I1; dropped the empty `properties` collection from the dev DB | See §5 | `feat: transform properties into product business logic` |
| 11 | 2026-10-05: Tested all member GraphQL APIs live (signup, login, checkAuth, checkAuthRoles, updateMember, getMember, getAgents, likeTargetMember, getAllMembersByAdmin, updateMemberByAdmin). Fixed 3 security bugs in `member.service.ts`: signup as `ADMIN` is refused; `updateMember` refuses `memberType`/`memberStatus` (admin only); new passwords are hashed in `updateMember` and `updateMemberByAdmin`. Added `member.service.spec.ts` (7 tests) | ✅ tests and tsc pass; fixes checked on the live API. Test members `aziza` (USER) and `bobur` (AGENT) stay in the dev DB | — |
| 12 | 2026-10-07: Tested all 11 product GraphQL APIs live (create, get, update, list with filters, agent list, like, favorites, visited, and the 3 admin APIs with admin `Simon`). Fixed: `productPrice` must be ≥ 0 (`@Min(0)` in `ProductInput` and `ProductUpdate`); `getFavorites` and `getVisited` now return `meLiked` (`like.service.ts`, `view.service.ts`) | ✅ tsc passes; fixes checked on the live API. Test data: agent `jasur`, 3 products of `bobur` (the 4th was removed by the admin test) | — |

## 2. Files and modules changed in the rename layer (`f9c138e`)

90 files changed, 35 insertions(+), 36 deletions(−). Almost all of them are pure renames (100% similarity).

| Change type | Files |
|---|---|
| Folder move (`git mv`) | `apps/nestar-api/**` → `apps/petoria-api/**` (80 files: all `src/`, `test/`, `tsconfig.app.json`) |
| Folder move (`git mv`) | `apps/nestar-batch/**` → `apps/petoria-batch/**` |
| File rename | `apps/petoria-batch/src/nestar-batch.controller.ts` → `apps/petoria-batch/src/batch.controller.ts` |
| Config edit | `nest-cli.json` (paths + project keys `petoria-api`, `petoria-batch`) |
| Config edit | `package.json` (`name`, scripts `start:dev:batch`, `start:prod`, `start:prod:batch`, `test:e2e`) |
| Config edit | `package-lock.json` (`name` ×2) |
| Config edit | `apps/petoria-api/tsconfig.app.json`, `apps/petoria-batch/tsconfig.app.json` (`outDir`) |
| Code edit (paths) | `apps/petoria-batch/src/batch.module.ts` (controller import + 2 schema imports) |
| Code edit (paths + text) | `apps/petoria-batch/src/batch.service.ts` (4 imports + welcome text) |
| Code edit (text) | `apps/petoria-api/src/app.service.ts` (welcome text) |
| Test edit (text) | `apps/petoria-batch/test/app.e2e-spec.ts` (`describe` name) |
| Docs edit | `CLAUDE.md` (paths, migration status) |

**Not changed (on purpose):** GraphQL schema, Mongoose models/collections, `.env`, business logic, `property`/`agent` naming, frontend repo.

## 3. Validation status

> These checks were run on 2026-10-03, before the validation rule changed. From now on use the commands in `CLAUDE.md` → Validation (`tsc --noEmit` for api + batch, then `npm run build`).

| Check | Command | Before rename | After rename | Status |
|---|---|---|---|---|
| Typecheck API | `npx tsc --noEmit --incremental false -p apps/petoria-api/tsconfig.app.json` | 0 errors | 0 errors | ✅ |
| Typecheck batch | `npx tsc --noEmit --incremental false -p apps/petoria-batch/tsconfig.app.json` | 0 errors | 0 errors | ✅ |
| Lint (report-only) | `npx eslint "{src,apps,libs,test}/**/*.ts"` | 15 problems (14 errors, 1 warning) | identical 15 | ✅ no new problems; ⚠️ old ones remain |
| Leftover names | `grep -rniI nestar --exclude-dir={node_modules,dist,.claude} .` | many | only the migration notes in `CLAUDE.md` | ✅ |
| API runtime | `npm run start:dev` | — | Nest started, "MongoDB is connected into development", `GET /` → `Welcome to Petoria REST API Server!`, GraphQL `{ sayHello }` → `"GraphQL API Server"` | ✅ |
| Batch runtime | `npm run start:dev:batch` | — | ❌ `EADDRINUSE :::3008` (stale PID 92147). With `PORT_BATCH=3018`: "MongoDB is connected into development", "BATCH SERVER READY!", `GET /` → `Welcome to Petoria BATCH Server!` | ✅ code OK; ⚠️ port conflict |
| Unit / e2e tests | `npm test`, `npm run test:e2e` | not run | not run | ⚠️ e2e specs expect `'Hello World!'`, so they are known to fail |

Old lint problems (the same before and after):
- `apps/petoria-api/test/app.e2e-spec.ts`: 14 × `prettier/prettier` (space indentation instead of tabs, multi-line chain)
- `apps/petoria-batch/test/app.e2e-spec.ts:19`: 1 × `@typescript-eslint/no-unsafe-return` warning

## 4. Issues found but not fixed

| # | Issue | Location | Severity |
|---|---|---|---|
| I1 | ✅ Fixed in task 10. `getVisited()` returned **favorites**: it calls `likeService.getFavoriteProperties` instead of `viewService.getVisitedProperties` | `apps/petoria-api/src/components/property/property.service.ts` (`getVisited`) | Bug: medium |
| I2 | Both e2e specs expect `'Hello World!'` from `GET /` | `apps/petoria-api/test/app.e2e-spec.ts`, `apps/petoria-batch/test/app.e2e-spec.ts` | Test debt |
| I3 | 14 prettier errors in the API e2e spec | `apps/petoria-api/test/app.e2e-spec.ts` | Style |
| I4 | `lookupMember` aggregations load the `memberPassword` hash (`$lookup` ignores `select: false`). It is **not exposed**, because `memberPassword` has no `@Field` in `libs/dto/member/member.ts` | `libs/config.ts` `lookupMember` + its users in property/board-article/comment services | Low (defence in depth) |
| I5 | `Notice` and `Notification` schemas have no module/resolver. (`Notification.propertyId` is now `productId` → `'Product'`) | `apps/petoria-api/src/schemas/` | Info |
| I6 | ✅ Resolved. Stale process on port 3008 (PID 92147) on 2026-10-03. On 2026-10-05 the port was free | local machine | Env |

## 5. Domain layer: property → product (task 10)

### Files

| Change | Files |
|---|---|
| `git mv` + rewrite | `components/property/*` → `components/product/{product.module,product.resolver,product.service}.ts`; `libs/dto/property/*` → `libs/dto/product/{product,product.input,product.update}.ts`; `libs/enums/property.enum.ts` → `product.enum.ts`; `schemas/Property.model.ts` → `Product.model.ts` |
| New | `libs/dto/common.input.ts` (`OrdinaryInquiry`) |
| Edit | `like.service.ts` (`getFavoriteProducts`), `view.service.ts` (`getVisitedProducts`), `comment.{module,service}.ts`, `components.module.ts`, `libs/config.ts` (`availableProductSorts`, `favoriteProduct`/`visitedProduct`), group enums (`PROPERTY` → `PRODUCT`), `common.enum.ts` (`PET_ONLY_FIELDS`), `Member.model.ts` + `member.ts` (`memberProducts`), `Notification.model.ts` (`productId`) |
| Batch | `batch.{module,service,controller}.ts`, `lib/config.ts` (`BATCH_TOP_PRODUCTS`, `batchTopProducts`, agent rank uses `memberProducts`) |
| Docs | `CLAUDE.md`, `docs/ai/*` |

### Behaviour changes besides the renames

- **I1 fixed:** `getVisited` now calls `viewService.getVisitedProducts`.
- **Sold/deleted dates are saved now.** The old property code set `soldAt`/`deletedAt` in local variables only, so they were never written. `soldOutAt`/`deletedAt` are now part of the update.
- **Pet-only fields:** gender and birth date are rejected on non-PET products. Changing a PET into another type clears them.
- **Unique index** is now `{ memberId, productTitle }`.

### Validation

| Check | Result |
|---|---|
| `npx tsc -p apps/petoria-api/tsconfig.app.json --noEmit` | ✅ 0 errors |
| `npx tsc -p apps/petoria-batch/tsconfig.app.json --noEmit` | ✅ 0 errors |
| `npm run build` | ✅ compiled successfully |
| ESLint report-only on the changed files | ✅ clean (Prettier run only on the 6 new product files) |
| `grep -rniI propert apps --include=*.ts` | ✅ no matches |
| API runtime (`npm run start:dev`, port 3007) | ✅ `ProductModule` loaded, MongoDB connected |
| Batch runtime (`npm run start:dev:batch`) | ✅ "BATCH SERVER READY!" |
| GraphQL scenario (Node script against the dev API) | ✅ 19/19: signup AGENT/USER, createProduct PET/DOG/MALE, FOOD with gender rejected, duplicate title rejected, USER cannot create, view counter, like, comment `PRODUCT`, favorites, visited (I1), type/species/gender/price filter, text search + price sort, agent list, gender on FOOD blocked, PET→TOY clears pet fields, SOLD_OUT sets `soldOutAt`, `memberProducts` = 1 |
| Dev DB | `properties` had 0 documents → dropped. No `PROPERTY` group documents existed |

Test data from the scenario (2 members, 2 products, 1 like, 3 views, 1 comment) was deleted from the dev DB afterwards. The dev API server was stopped.

