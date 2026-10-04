# Backend Migration: Nestar → Petoria

> Status as of **2026-10-05** · branch `modification` · last migration commit `f9c138e fix: Modify project name into petoria`
> The **Domain Rules** in `CLAUDE.md` win over anything in this file.

Every item in this file is labelled with one of these statuses:

| Label | Meaning |
|---|---|
| ✅ **Done** | Implemented, verified, and committed |
| 🟢 **Accepted** | Decided by the project owner (in `CLAUDE.md` Domain Rules), not implemented yet |
| 🟡 **Proposed** | Designed in an earlier session but **not confirmed by the project owner yet**. Confirm it before you implement it. |
| ⬜ **Unchanged** | Kept as-is on purpose |

---

## 1. Original project (Nestar)

A real-estate platform. **Agents** post **properties** (apartments, villas, houses). Users browse, view, like, and comment on them, and follow members. It also has a community board and a WebSocket chat.

NestJS 11 monorepo (`nest-cli.json` → `"monorepo": true`) with two apps:

| App | Purpose | Main tech |
|---|---|---|
| `apps/nestar-api` | GraphQL API + WebSocket chat | `@nestjs/graphql` + Apollo (`autoSchemaFile: true`, code-first), Mongoose 9, JWT, `@nestjs/platform-ws`, `graphql-upload` |
| `apps/nestar-batch` | Nightly ranking cron jobs | `@nestjs/schedule` |

API feature modules (`src/components/`): `auth`, `member`, `property`, `board-article`, `comment`, `follow`, `like`, `view`.
Schemas (`src/schemas/`): `Member`, `Property`, `BoardArticle`, `Comment`, `Follow`, `Like`, `View`, `Notice`, `Notification`. The last two have **no module** yet.

Batch jobs (`batch.controller.ts`):

| Cron | Name constant | Logic |
|---|---|---|
| `00 00 01 * * *` | `BATCH_ROLLBACK` | Set `propertyRank = 0` on ACTIVE properties and `memberRank = 0` on ACTIVE agents |
| `20 00 01 * * *` | `BATCH_TOP_PROPERTIES` | `propertyRank = propertyLikes*2 + propertyViews` |
| `40 00 01 * * *` | `BATCH_TOP_AGENTS` | `memberRank = memberProperties*5 + memberArticles*3 + memberLikes*2 + memberViews` |

## 2. New project (Petoria)

A **pet shop** platform. It keeps the same infrastructure: members, auth, community, likes, views, follows, comments, chat, and batch ranking. The real-estate domain is replaced by a pet-shop domain.

🟢 **Accepted domain:** **Product** replaces Property. A product has a `ProductType` (`PET`, `FOOD`, `TOY`, `ACCESSORY`), a `productSpecies` (`DOG`, `CAT`, `BIRD`, `FISH`) and a `productGender` (`MALE`, `FEMALE`).
🟢 **Accepted role:** `MemberType.USER`, `AGENT`, `ADMIN` stay **unchanged**. Products are owned by `AGENT` members. There is **no** `SELLER` role. See [DECISIONS.md](DECISIONS.md) P1, P2.

## 3. Backend migration goal

1. ✅ **Rename layer:** every project/app identifier says Petoria, with **no change** to business logic, the GraphQL API, or MongoDB.
2. ~~Role layer: `AGENT` → `SELLER`~~ **Cancelled.** `MemberType.AGENT` stays (CLAUDE.md Domain Rules).
3. 🟢 **Domain layer:** the property module → a product module (new schema, DTOs, resolver, service, batch jobs). The details below that `CLAUDE.md` does not decide are still 🟡.
4. Keep the backend and frontend (`../petoria-next`) in sync whenever a GraphQL name changes.

## 4. Naming changes

### 4.1 Done in the rename layer (commit `f9c138e`)

| Area | Before | After |
|---|---|---|
| API app folder | `apps/nestar-api` | `apps/petoria-api` (`git mv`, history kept) |
| Batch app folder | `apps/nestar-batch` | `apps/petoria-batch` |
| Batch controller file | `src/nestar-batch.controller.ts` | `src/batch.controller.ts` (class name `BatchController` unchanged) |
| `nest-cli.json` | `sourceRoot`/`root`/`tsConfigPath` → `apps/nestar-*`; project keys `nestar-api`, `nestar-batch` | `apps/petoria-*`; keys `petoria-api`, `petoria-batch` |
| `package.json` `name` | `nestar` | `petoria` |
| `package.json` scripts | `start:dev:batch: nest start nestar-batch --watch`, `start:prod: … dist/apps/nestar-api/main`, `start:prod:batch: … dist/apps/nestar-batch/main`, `test:e2e: … ./apps/nestar-api/test/jest-e2e.json` | same scripts with `petoria-*` |
| `package-lock.json` | `"name": "nestar"` (root + `packages[""]`) | `"name": "petoria"` (only these 2 lines; no reinstall) |
| `tsconfig.app.json` (both) | `outDir: ../../dist/apps/nestar-*` | `../../dist/apps/petoria-*` |
| Batch imports | `../../nestar-api/src/...` (in `batch.module.ts`, `batch.service.ts`) | `../../petoria-api/src/...` |
| API welcome text (`app.service.ts`) | `Welcome to Nestar REST API Server!` | `Welcome to Petoria REST API Server!` |
| Batch welcome text (`batch.service.ts`) | `Welcome to Nestar BATCH Server!` | `Welcome to Petoria BATCH Server!` |
| Batch e2e test name | `NestarBatchController (e2e)` | `PetoriaBatchController (e2e)` |
| `CLAUDE.md` | old paths | new paths + migration status |

A case-insensitive `grep -rniI nestar` (excluding `node_modules`, `dist`, `.claude`) now finds the word only in the migration notes in `CLAUDE.md`.

### 4.2 Domain renames

Agent names stay as they are (⬜): `MemberType.AGENT`, `availableAgentSorts`, `AgentsInquiry`, `getAgents`, `BATCH_TOP_AGENTS`, `batchTopAgents`.

| Old | New | Status |
|---|---|---|
| `memberProperties` (schema + DTO) | `memberProducts` | 🟢 (used by the `backend-migration` skill) |
| `availablePropertySorts` | `availableProductSorts` = `createdAt, updatedAt, productLikes, productViews, productRank, productPrice` | 🟡 |
| `availableOptions = ['propertyBarter','propertyRent']` | `['productOnSale','productFreeDelivery']` | 🟡 |
| `lookupFavorite` / `lookupVisit` paths `favoriteProperty.*` / `visitedProperty.*` | `favoriteProduct.*` / `visitedProduct.*` | 🟢 |
| `BATCH_TOP_PROPERTIES`, `batchTopProperties` | `BATCH_TOP_PRODUCTS`, `batchTopProducts` | 🟢 |

## 5. Module changes

| Module / file | Current state | Planned change |
|---|---|---|
| `components/property/*` | ⬜ Real-estate CRUD, likes, favorites, visited, admin | 🟢 Replace with `components/product/{product.module,product.resolver,product.service}.ts`, using the same method set with new names (see §6). Keep the resolver/service/module pattern |
| `libs/dto/property/*` | ⬜ `Property`, `Properties`, `PropertyInput`, `PropertiesInquiry`, `AgentPropertiesInquiry`, `AllPropertiesInquiry`, `OrdinaryInquiry`, `PropertyUpdate`, ranges | 🟢 `libs/dto/product/*`. 🟡 Move `OrdinaryInquiry` to `libs/dto/common.input.ts` (it is generic paging) and remove `SquaresRange` |
| `libs/enums/property.enum.ts` | ⬜ `PropertyType`, `PropertyStatus`, `PropertyLocation` | 🟢 `libs/enums/product.enum.ts` with `ProductType` (`PET, FOOD, TOY, ACCESSORY`) and enums for `productSpecies` (`DOG, CAT, BIRD, FISH`) and `productGender` (`MALE, FEMALE`). 🟡 `ProductStatus`, `ProductLocation` |
| `components/like/like.service.ts` | ⬜ `getFavoriteProperties` (`$lookup from: 'properties'`) | `getFavoriteProducts` (`from: 'products'`) |
| `components/view/view.service.ts` | ⬜ `getVisitedProperties` (`$lookup from: 'properties'`) | `getVisitedProducts` |
| `components/comment/*` | ⬜ Imports `PropertyModule`, calls `propertyStatsEditor(... 'propertyComments')` | `ProductModule`, `productStatsEditor(... 'productComments')` |
| `components/member/*` | ⬜ `getAgents`, `Roles(USER, AGENT)` | ⬜ No role change. Only `memberProperties` → `memberProducts` |
| `components/components.module.ts` | ⬜ Imports `PropertyModule` | Imports `ProductModule` |
| `apps/petoria-batch/src/*` | ⬜ Property + agent ranking | Product + agent ranking (agent rank uses `memberProducts`) |
| Other modules (`auth`, `board-article`, `follow`, `socket`, `database`) | ⬜ No domain dependency | None |

## 6. GraphQL changes

**Rename layer (✅): the GraphQL schema is 100% unchanged.** Frontend operations keep working.

Proposed renames 🟡. Each one is a **breaking change** for `petoria-next`:

| Kind | Old | New |
|---|---|---|
| Object type | `Property`, `Properties` | `Product`, `Products` |
| Input type | `PropertyInput`, `PropertyUpdate` | `ProductInput`, `ProductUpdate` |
| Input type | `PropertiesInquiry`, `AgentPropertiesInquiry`, `AllPropertiesInquiry` | `ProductsInquiry`, `AgentProductsInquiry`, `AllProductsInquiry` |
| Input type (nested, also public names) | `PISearch`, `APISearch`, `ALPISearch`, `SquaresRange` | Rename to match (e.g. `ProductSearch`, `AgentProductSearch`, `AllProductSearch`); remove `SquaresRange` |
| Enum | `PropertyType` | 🟢 `ProductType` (`PET, FOOD, TOY, ACCESSORY`) + new enums for `productSpecies` and `productGender` |
| Enum | `PropertyStatus` (`ACTIVE, SOLD, DELETE`) | 🟡 `ProductStatus` (`ACTIVE, SOLD_OUT, DELETE`) |
| Enum | `PropertyLocation` | 🟡 `ProductLocation` (same city values) |
| Enum value | `LikeGroup/ViewGroup/CommentGroup/NotificationGroup.PROPERTY` | `.PRODUCT` |
| Query | `getProperty(propertyId)` | `getProduct(productId)` |
| Query | `getProperties`, `getAgentProperties`, `getAllPropertiesByAdmin` | `getProducts`, `getAgentProducts`, `getAllProductsByAdmin` |
| Query | `getFavorites`, `getVisited` | Same names; return type becomes `Products` |
| Mutation | `createProperty`, `updateProperty`, `likeTargetProperty(propertyId)` | `createProduct`, `updateProduct`, `likeTargetProduct(productId)` |
| Mutation | `updatePropertyByAdmin`, `removePropertyByAdmin(propertyId)` | `updateProductByAdmin`, `removeProductByAdmin(productId)` |

Unchanged in every phase: `signup`, `login`, `updateMember`, `getMember`, `getAgents`, `AgentsInquiry`, `MemberType` (`USER, AGENT, ADMIN`), `likeTargetMember`, all board-article, comment, and follow operations, `sayHello`.

## 7. MongoDB collection / schema changes

**Rename layer (✅): nothing changed.** Collections, model names (`'Property'`, `'Member'`…), indexes, and the DB name inside the `MONGO_DEV`/`MONGO_PROD` URI were all left as they were.

Proposed 🟡:

| Item | Current | Proposed |
|---|---|---|
| Collection | `properties` | New `products` collection. The old `properties` data is **kept, not deleted** |
| Model name | `'Property'` | `'Product'` |
| Unique index | `{propertyType, propertyLocation, propertyTitle, propertyPrice}` | `{memberId: 1, productTitle: 1}` |
| `members.memberProperties` | counter | `memberProducts` |
| `members.memberType` | `'AGENT'` values | ⬜ unchanged (`AGENT` stays) |
| `likes.likeGroup`, `views.viewGroup`, `comments.commentGroup` | `'PROPERTY'` | `'PRODUCT'` |
| `notifications.propertyId` (ref `'Property'`) | — | `productId` (ref `'Product'`) |

Field mapping (Property → Product). 🟢 rows come from `CLAUDE.md`; the rest is 🟡:

| Property field | Product field |
|---|---|
| `propertyType` | 🟢 `productType` (`PET, FOOD, TOY, ACCESSORY`) |
| (new) | 🟢 `productSpecies` (`DOG, CAT, BIRD, FISH`) |
| (new) | 🟢 `productGender` (`MALE, FEMALE`). Nullability is not decided yet (it only makes sense for `PET`) |
| `propertyStatus` | `productStatus` |
| `propertyLocation` | `productLocation` |
| `propertyAddress` | removed |
| `propertyTitle`, `propertyPrice`, `propertyImages`, `propertyDesc` | `productTitle`, `productPrice`, `productImages`, `productDesc` |
| `propertySquare`, `propertyBeds`, `propertyRooms` | removed. New: `productBrand` (optional string), `productStock` (int ≥ 0) |
| `propertyBarter`, `propertyRent` | `productOnSale`, `productFreeDelivery` |
| `propertyViews/Likes/Comments/Rank` | `productViews/Likes/Comments/Rank` |
| `soldAt` | `soldOutAt` |
| `constructedAt` | removed |
| `memberId`, `deletedAt`, timestamps | unchanged |

## 8. Compatibility notes

| # | Note | Impact |
|---|---|---|
| C1 | The rename layer did not change the GraphQL schema or the DB | The frontend and existing data still work as they are |
| C2 | Every proposed GraphQL rename (§6) breaks `petoria-next` until its Apollo operations, types, and enums are updated | Ship backend and frontend changes together, or keep the old names for a short time |
| C3 | Existing dev documents use the group value `'PROPERTY'` (`memberType: 'AGENT'` stays valid) | After the group enum change they stop matching queries. Plan a data migration or reseed (needs approval) |
| C4 | The batch app imports API code by relative path (`../../petoria-api/src/...`) | Any future folder move must update these imports. A shared `libs/` package could remove this coupling |
| C5 | An old `dist/apps/nestar-*` build may still exist | It is git-ignored, and `deleteOutDir: true` cleans it on the next `nest build` |
| C6 | ✅ Resolved. A stale process (PID 92147) held **port 3008** on 2026-10-03. On 2026-10-05 the port was free | `npm run start:dev:batch` can use its default port again |
| C7 | Both e2e specs expect `'Hello World!'` from `GET /`, but the apps return the welcome strings | The e2e tests fail. This was already broken before the rename and is not caused by it |
| C8 | `.env` keys (`PORT_API`, `PORT_BATCH`, `MONGO_DEV`, `MONGO_PROD`, `SECRET_TOKEN`) contain no project name | No env change is needed for any phase |
