# Completed Tasks: Nestar → Petoria Migration

> Session date: **2026-10-03** · backend repo `petoria` · branch `modification`

## 1. Task log

| # | Task | Result | Commit |
|---|---|---|---|
| 1 | Analysed the monorepo structure (apps, modules, schemas, batch, config) and the sibling frontend `petoria-next` | Full inventory of real-estate code and every `nestar` reference | — |
| 2 | Drafted a full domain migration plan (Property → Product, AGENT → SELLER) | Plan written. The owner did **not** confirm the domain choices, so they stay **Proposed** ([DECISIONS.md](DECISIONS.md)) | — |
| 3 | Planned and implemented the **safe rename layer** (names only, no logic/API/DB change) | Done | `f9c138e fix: Modify project name into petoria` (committed by the owner) |
| 4 | Validated the rename (lint, typecheck, both apps running) | Passed. No new problems (see §3) | — |
| 5 | Wrote the migration documentation (`docs/*.md`) | This folder | pending |

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
| I1 | `getVisited()` returns **favorites**: it calls `likeService.getFavoriteProperties` instead of `viewService.getVisitedProperties` | `apps/petoria-api/src/components/property/property.service.ts` (`getVisited`) | Bug: medium |
| I2 | Both e2e specs expect `'Hello World!'` from `GET /` | `apps/petoria-api/test/app.e2e-spec.ts`, `apps/petoria-batch/test/app.e2e-spec.ts` | Test debt |
| I3 | 14 prettier errors in the API e2e spec | `apps/petoria-api/test/app.e2e-spec.ts` | Style |
| I4 | `lookupMember` aggregations load the `memberPassword` hash (`$lookup` ignores `select: false`). It is **not exposed**, because `memberPassword` has no `@Field` in `libs/dto/member/member.ts` | `libs/config.ts` `lookupMember` + its users in property/board-article/comment services | Low (defence in depth) |
| I5 | `Notice` and `Notification` schemas have no module/resolver. `Notification.propertyId` refs `'Property'` | `apps/petoria-api/src/schemas/` | Info |
| I6 | Stale process on port 3008 (PID 92147, `node dist/apps/nestar-api/main`, started 2026-10-02) | local machine | Env |
