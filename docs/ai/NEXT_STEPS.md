# Next Steps: Nestar → Petoria Migration

> Written **2026-10-03** for the next working session. Each section is in priority order (1 = first).
> Project rules for every task: plan first (in easy English) → owner OK → implement → verify → "Let me commit?" → one commit on `modification`, no co-author.

## 0. Blockers (do these first)

| # | Task | Why |
|---|---|---|
| 0.1 | **Confirm the proposed domain decisions** P1–P7 in [DECISIONS.md](DECISIONS.md): Product vs Pet, SELLER vs SHOP, replace-in-place vs side-by-side, keep location, orders deferred | Every backend/frontend domain task below depends on it |
| 0.2 | Stop the stale process on port 3008 (`kill 92147`, only with the owner's OK) | `npm run start:dev:batch` cannot start on its default port |

## 1. Backend cleanup

| # | Task | Files | Notes |
|---|---|---|---|
| 1.1 | Role layer: `AGENT` → `SELLER` | `libs/enums/member.enum.ts`, `libs/config.ts` (`availableAgentSorts`), `libs/dto/member/member.input.ts` (`AgentsInquiry`), `components/member/member.{resolver,service}.ts` (`getAgents`), all `@Roles(MemberType.AGENT)` in `components/property/property.resolver.ts`, `schemas/Member.model.ts` + `libs/dto/member/member.ts` (`memberProperties`), batch `batchTopAgents` | Breaking for the frontend `MemberType` and `GET_AGENTS` |
| 1.2 | Domain layer: product module (replaces property) | New `components/product/*`, `libs/dto/product/*`, `libs/enums/product.enum.ts`, `schemas/Product.model.ts`. Update `like.service.ts`, `view.service.ts`, `comment.{module,service}.ts`, `components.module.ts`, Group enums, `Notification.model.ts`, `libs/config.ts`. Then delete the property files | Follow [BACKEND_MIGRATION.md §5–7](BACKEND_MIGRATION.md) |
| 1.3 | Fix I1: `getVisited` must call the view service | `property.service.ts`, or `product.service.ts` if 1.2 is done first | Inject `ViewService` (already injected) and call `getVisitedProperties`/`getVisitedProducts` |
| 1.4 | Batch: product + seller ranking | `apps/petoria-batch/src/{batch.module,batch.service,batch.controller}.ts`, `lib/config.ts` | Rename the constants `BATCH_TOP_PRODUCTS`, `BATCH_TOP_SELLERS` |
| 1.5 | I4: add `$project: { 'memberData.memberPassword': 0 }` after `lookupMember` | `libs/config.ts` or each aggregation | Defence in depth, no API change |
| 1.6 | Optional: move shared code (schemas, DTOs, enums) to a Nest `libs/` library so batch does not import `../../petoria-api/src` | `nest-cli.json`, `tsconfig.json` paths | Separate task. Bigger change |
| 1.7 | Optional: data plan for dev DB (`AGENT` → `SELLER`, group `PROPERTY` → `PRODUCT`) | MongoDB (dev) | **Ask before touching data** |

## 2. Frontend migration (`../petoria-next`)

| # | Task | Depends on |
|---|---|---|
| 2.1 | **F0 rename layer**: `package.json` name, layout `<title>`/meta, `Footer.tsx`, `pages/account/join.tsx`, `_document.tsx`, `NESTAR … MOBILE` placeholders, `.gitignore` comment | Nothing, can start right away |
| 2.2 | F1: enums, types (`libs/types/property → product`), `libs/config.ts` | 0.1 + backend 1.1/1.2 |
| 2.3 | F2: Apollo operations rename (12 operations, see [FRONTEND_MIGRATION.md §4](FRONTEND_MIGRATION.md)) | 2.2 |
| 2.4 | F3: pages/routes (`/property → /product`, `/agent → /seller`, `/_admin/properties → /_admin/products`, mypage/member tab keys) | 2.3 |
| 2.5 | F4: components (filter fields, add-product form, cards, homepage sections) | 2.4 |
| 2.6 | F5: i18n texts in `en`, `kr`, `ru` | 2.5 |
| 2.7 | F6 (optional): SCSS file/class renames | 2.5 |

## 3. Testing

| # | Task | How |
|---|---|---|
| 3.1 | Fix the e2e expectations (I2) and prettier errors (I3) | Expect the welcome strings. Use `npx eslint --fix` **only on these two files** |
| 3.2 | Run the tests | `npm test`, `npm run test:e2e` (the API e2e test needs MongoDB from `.env`) |
| 3.3 | After each backend step: typecheck + lint baseline compare | `npx tsc --noEmit --incremental false -p apps/petoria-api/tsconfig.app.json` (+ batch), `npx eslint "{src,apps,libs,test}/**/*.ts"` |
| 3.4 | GraphQL playground scenario after 1.1/1.2 | `signup` (SELLER) → `login` → `createProduct` → `getProduct` (views +1) → `getProducts` with filters → `likeTargetProduct` → `getFavorites` → open a product → `getVisited` (checks 1.3) → `createComment` (`PRODUCT`) → `getSellers`, `getSellerProducts`, admin queries |
| 3.5 | Batch run | `npm run start:dev:batch` → "BATCH SERVER READY!". Optionally call the service methods once to check the ranking formulas |
| 3.6 | Frontend smoke test | `npm run dev` in `petoria-next`, visit every page, check the console for GraphQL errors |

## 4. Documentation

| # | Task |
|---|---|
| 4.1 | After each step, update `docs/COMPLETED_TASKS.md` (task log, validation) and move the item out of `docs/NEXT_STEPS.md` |
| 4.2 | When P1–P7 are confirmed or changed, update their status in `docs/DECISIONS.md` and the 🟡 labels in `BACKEND_MIGRATION.md` / `FRONTEND_MIGRATION.md` |
| 4.3 | Update `CLAUDE.md` in **both** repos (module list `property` → `product`, batch job names, frontend migration status) |
| 4.4 | Replace the default Nest `README.md` with a Petoria README (apps, scripts, env keys, without values) |
| 4.5 | Add new useful prompts to `docs/PROMPTS.md` |
