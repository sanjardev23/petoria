# Next Steps: Nestar → Petoria Migration

> Updated **2026-10-05** for the next working session. Each section is in priority order (1 = first).
> Project rules for every task: plan first (in easy English) → owner OK → implement → verify → "Let me commit?" → one commit on `modification`, no co-author.
> `CLAUDE.md` (Domain Rules, Workflow, Validation) wins over this file. Use the `backend-migration` skill for backend changes and the `product-logic` skill for reviews.

## 0. Open decisions (confirm before the matching task)

| # | Task | Why |
|---|---|---|
| 0.1 | Confirm the remaining proposals P5 and P7 in [DECISIONS.md](DECISIONS.md): orders deferred, frontend after backend. P3, P4 and P6 were accepted on 2026-10-05 | P7 decides when the frontend work starts |
| 0.2 | ✅ Done 2026-10-05. Product details decided, see [ER_MODEL.md](ER_MODEL.md) | — |

P1 (Product) and P2 (keep `AGENT`) were decided on 2026-10-05. The old "role layer" (`AGENT` → `SELLER`) is **cancelled**.

## 1. Backend

| # | Task | Files | Notes |
|---|---|---|---|
| 1.1 | ✅ Done 2026-10-05. Domain layer: product module (replaces property) | New `components/product/*`, `libs/dto/product/*`, `libs/enums/product.enum.ts` (`ProductType` `PET, FOOD, TOY, ACCESSORY`; `productSpecies` `DOG, CAT, BIRD, FISH`; `productGender` `MALE, FEMALE`), `schemas/Product.model.ts`. Update `like.service.ts`, `view.service.ts`, `comment.{module,service}.ts`, `components.module.ts`, Group enums, `Notification.model.ts`, `libs/config.ts`, `memberProperties` → `memberProducts`. Then delete the property files | Follow [BACKEND_MIGRATION.md §5–7](BACKEND_MIGRATION.md). Products are owned by `AGENT` members (`@Roles(MemberType.AGENT)` stays) |
| 1.2 | ✅ Done 2026-10-05. Fix I1: `getVisited` must call the view service | `property.service.ts`, or `product.service.ts` if 1.1 is done first | `ViewService` is already injected. Call `getVisitedProperties`/`getVisitedProducts` |
| 1.3 | ✅ Done 2026-10-05. Batch: product + agent ranking | `apps/petoria-batch/src/{batch.module,batch.service,batch.controller}.ts`, `lib/config.ts` | `BATCH_TOP_PROPERTIES` → `BATCH_TOP_PRODUCTS`. `BATCH_TOP_AGENTS` stays; its formula uses `memberProducts` |
| 1.4 | I4: add `$project: { 'memberData.memberPassword': 0 }` after `lookupMember` | `libs/config.ts` or each aggregation | Defence in depth, no API change |
| 1.5 | Optional: move shared code (schemas, DTOs, enums) to a Nest `libs/` library so batch does not import `../../petoria-api/src` | `nest-cli.json`, `tsconfig.json` paths | Separate task. Bigger change |
| 1.6 | ✅ Done 2026-10-05. Dropped the `properties` collection from the dev DB (it had 0 documents). No likes/views/comments/notifications with group `PROPERTY` existed | MongoDB (dev) | Do it after 1.1 works. Count documents first. Old group docs need a separate OK. `memberType: 'AGENT'` needs no change |

## 2. Frontend migration (`../petoria-next`)

| # | Task | Depends on |
|---|---|---|
| 2.1 | **F0 rename layer**: `package.json` name, layout `<title>`/meta, `Footer.tsx`, `pages/account/join.tsx`, `_document.tsx`, `NESTAR … MOBILE` placeholders, `.gitignore` comment | Nothing, can start right away |
| 2.2 | F1: enums, types (`libs/types/property → product`), `libs/config.ts` | Backend 1.1 |
| 2.3 | F2: Apollo operations rename (see [FRONTEND_MIGRATION.md §4](FRONTEND_MIGRATION.md)) | 2.2 |
| 2.4 | F3: pages/routes (`/property → /product`, `/_admin/properties → /_admin/products`, mypage/member tab keys). `/agent` pages stay | 2.3 |
| 2.5 | F4: components (filter fields, add-product form, cards, homepage sections) | 2.4 |
| 2.6 | F5: i18n texts in `en`, `kr`, `ru` | 2.5 |
| 2.7 | F6 (optional): SCSS file/class renames | 2.5 |

## 3. Testing

| # | Task | How |
|---|---|---|
| 3.1 | Fix the e2e expectations (I2) and prettier errors (I3) | Expect the welcome strings. Use `npx eslint --fix` **only on these two files** |
| 3.2 | Run the tests | `npm test`, `npm run test:e2e` (the API e2e test needs MongoDB from `.env`) |
| 3.3 | After each backend step: validation from `CLAUDE.md` | `npx tsc -p apps/petoria-api/tsconfig.app.json --noEmit`, `npx tsc -p apps/petoria-batch/tsconfig.app.json --noEmit`, `npm run build`. `npm run lint` only when file rewriting is OK |
| 3.4 | ✅ Done 2026-10-05 (19/19 checks, see COMPLETED_TASKS §5). GraphQL scenario after 1.1 | `signup` (AGENT) → `login` → `createProduct` (e.g. `PET` / `DOG` / `MALE`) → `getProduct` (views +1) → `getProducts` with type/species/gender/price filters → `likeTargetProduct` → `getFavorites` → open a product → `getVisited` (checks 1.2) → `createComment` (`PRODUCT`) → `getAgents`, `getAgentProducts`, admin queries |
| 3.5 | Batch run | `npm run start:dev:batch` → "BATCH SERVER READY!" (port 3008 is free again). Optionally call the service methods once to check the ranking formulas |
| 3.6 | Frontend smoke test | `npm run dev` in `petoria-next`, visit every page, check the console for GraphQL errors |

## 4. Documentation

| # | Task |
|---|---|
| 4.1 | After each step, update `docs/ai/COMPLETED_TASKS.md` (task log, validation) and move the item out of `docs/ai/NEXT_STEPS.md` |
| 4.2 | When P3–P7 are confirmed or changed, update their status in `docs/ai/DECISIONS.md` and the 🟡 labels in `BACKEND_MIGRATION.md` / `FRONTEND_MIGRATION.md` |
| 4.3 | Backend `CLAUDE.md` updated 2026-10-05. Still to do: frontend `CLAUDE.md` after the frontend migration |
| 4.4 | Replace the default Nest `README.md` with a Petoria README (apps, scripts, env keys, without values) |
| 4.5 | Add new useful prompts to `docs/ai/PROMPTS.md` |
