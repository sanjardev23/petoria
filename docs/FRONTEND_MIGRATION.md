# Frontend Migration Plan: `nestar-next` → `petoria-next`

> Status as of **2026-10-03** · repo `../petoria-next` · branch `modification` · last commit `db85dd1 feat: start client migration process`
> **Nothing in the frontend has been changed yet.** This is a plan based on reading the code in the previous session.
> Stack: Next.js 14 (Pages Router), React 18, Apollo Client 3, MUI 5, `next-i18next` (locales `en`, `kr`, `ru`), SCSS.

The domain names below (**Product**, **Seller**) follow the 🟡 **proposed** backend design ([DECISIONS.md](DECISIONS.md) P1/P2). Confirm them before steps F1–F6.

---

## 1. Step-by-step plan

| Step | Scope | Depends on backend? | Commit (suggested) |
|---|---|---|---|
| **F0** | **Rename layer only**: `package.json` name, `<title>`/meta, footer, join page, placeholder texts, `_document.tsx` SEO text | **No**, can be done now | `feat: develop petoria naming for client` |
| F1 | Enums + types + config (`libs/enums`, `libs/types/property → product`, `libs/config.ts`) | Yes (final GraphQL names) | `feat: develop product types for client` |
| F2 | Apollo operations (`apollo/user/*`, `apollo/admin/*`), see §4 | Yes | (together with F1/F3) |
| F3 | Pages + routes (`pages/property → product`, `agent → seller`, `_admin/properties → products`) and every link/`router.push` | Yes | `feat: develop product pages` |
| F4 | Components (rename files, props, variables, filter UI fields) | Yes | (together with F3) |
| F5 | i18n texts in `public/locales/{en,kr,ru}/common.json` | No (text only) | `fix: modify petoria ui texts` |
| F6 | SCSS file and class renames (`scss/pc/property`, `agent`, `mypage/addNewProperty`, …), optional | No | `fix: modify petoria style names` |
| F7 | Verify: `npm run dev`, click through every page against the dev API, check the browser console for GraphQL errors | — | — |

### F0 detail: rename layer (safe now)

| File | Current | New |
|---|---|---|
| `package.json` | `"name": "nestar-next"` | `"petoria-next"` (also the 2 name lines in `package-lock.json`) |
| `libs/components/layout/LayoutHome.tsx`, `LayoutBasic.tsx`, `LayoutFull.tsx` | `<title>Nestar</title>`, `<meta name="title" content="Nestar">` (×2 each, PC + mobile) | `Petoria` |
| `libs/components/Footer.tsx` (lines ~66, ~131) | `© Nestar - All rights reserved. Nestar {year}` | `© Petoria - All rights reserved. Petoria {year}` |
| `pages/account/join.tsx` | `<span>Nestar</span>` | `Petoria` |
| `pages/_document.tsx` | keywords `nestar, nestar.uz, …`; description "Buy and sell properties … nestar.uz" | Petoria keywords + pet-shop description (the description is domain text, so agree on it with the owner) |
| `member/MemberProperties.tsx`, `member/MemberFollowers.tsx`, `member/MemberFollowings.tsx`, `mypage/MyFavorites.tsx`, `mypage/RecentlyVisited.tsx`, `mypage/MyProperties.tsx` | Mobile placeholders `NESTAR … MOBILE` | `PETORIA … MOBILE` |
| `.gitignore` | `# nestar specifiv` | `# petoria specific` |
| `CHANGELOG.md` | historic `nestar-next` links | **Keep.** It is history |

## 2. Page mapping

| Old route / file | New route / file | Notes |
|---|---|---|
| `/property` → `pages/property/index.tsx` | `/product` → `pages/product/index.tsx` | List + `Filter` |
| `/property/detail?id=` → `pages/property/detail.tsx` | `/product/detail?id=` → `pages/product/detail.tsx` | Detail, comments (`commentGroup: PRODUCT`), like |
| `/agent` → `pages/agent/index.tsx` | `/seller` → `pages/seller/index.tsx` | Uses `getSellers` |
| `/agent/detail` → `pages/agent/detail.tsx` | `/seller/detail` → `pages/seller/detail.tsx` | Seller products + reviews |
| `/_admin/properties` → `pages/_admin/properties/index.tsx` | `/_admin/products` → `pages/_admin/products/index.tsx` | Also the menu entry in `admin/AdminMenuList.tsx` |
| `/mypage?category=myProperties` | `?category=myProducts` | Tab key in `MyMenu.tsx` + `pages/mypage/index.tsx` |
| `/mypage?category=addProperty` | `?category=addProduct` | Same |
| `/member` tab `case 'properties'` | `case 'products'` | `MemberMenu.tsx` + `pages/member/index.tsx` |
| `/`, `/about`, `/account/join`, `/community/*`, `/cs`, `/member`, `/mypage`, `/_admin/{index,users,community,cs/*}` | unchanged routes | Only texts and child components change |

Link sources to update (found with grep): 3× `href='/property…'`, 2× `href={`/property/detail?id=…`}`, 6× `pathname: '/property/detail'`, 2× `href='/agent…'`, 2× `pathname: '/agent/detail'`. Also `Top.tsx` / `Footer.tsx` navigation.

## 3. Component mapping

| Old component | New component |
|---|---|
| `property/Filter.tsx` | `product/Filter.tsx`: replace rooms/beds/square/year filters with category / pet type / price / options |
| `property/PropertyCard.tsx` | `product/ProductCard.tsx` |
| `property/Review.tsx` | `product/Review.tsx` |
| `common/PropertyBigCard.tsx` | `common/ProductBigCard.tsx` |
| `common/AgentCard.tsx` | `common/SellerCard.tsx` |
| `agent/ReviewCard.tsx` | `seller/ReviewCard.tsx` |
| `homepage/TopProperties.tsx`, `TopPropertyCard.tsx` | `homepage/TopProducts.tsx`, `TopProductCard.tsx` |
| `homepage/PopularProperties.tsx`, `PopularPropertyCard.tsx` | `homepage/PopularProducts.tsx`, `PopularProductCard.tsx` |
| `homepage/TrendProperties.tsx`, `TrendPropertyCard.tsx` | `homepage/TrendProducts.tsx`, `TrendProductCard.tsx` |
| `homepage/TopAgents.tsx`, `TopAgentCard.tsx` | `homepage/TopSellers.tsx`, `TopSellerCard.tsx` |
| `homepage/HeaderFilter.tsx` | same file; new filter fields |
| `mypage/AddNewProperty.tsx` | `mypage/AddNewProduct.tsx`: form fields per the new `ProductInput` |
| `mypage/MyProperties.tsx`, `mypage/PropertyCard.tsx` | `mypage/MyProducts.tsx`, `mypage/ProductCard.tsx` |
| `mypage/MyFavorites.tsx`, `mypage/RecentlyVisited.tsx` | same files; item type `Product` |
| `member/MemberProperties.tsx` | `member/MemberProducts.tsx` |
| `admin/properties/PropertyList.tsx` | `admin/products/ProductList.tsx` |
| `libs/types/property/{property,property.input,property.update}.ts` | `libs/types/product/{product,product.input,product.update}.ts` |
| `libs/enums/property.enum.ts` | `libs/enums/product.enum.ts` |
| `libs/enums/member.enum.ts` | `AGENT` → `SELLER` |
| `libs/enums/{like,view,comment,notification}.enum.ts` | `PROPERTY` → `PRODUCT` |
| `libs/config.ts` | `availableOptions` → `['productOnSale','productFreeDelivery']`; remove `propertyYears`, `propertySquare`; `topPropertyRank` → `topProductRank` |

Unchanged: `Chat.tsx`, `community/*`, `cs/*`, `admin/{community,cs,users}/*`, `layout/*` (except F0 texts), `mypage/{MyProfile,MyArticles,Article,WriteArticle}`, `member/{MemberArticles,MemberFollowers,MemberFollowings}` (except F0 placeholders).

## 4. GraphQL query / mutation rename plan

The file locations stay the same (`apollo/user/query.ts`, `apollo/user/mutation.ts`, `apollo/admin/query.ts`, `apollo/admin/mutation.ts`). Each operation renames the constant, the operation name, the root field, and the variable/return types. The selection sets must use the new field names (`productTitle`, `productPrice`, …, see [BACKEND_MIGRATION.md §7](BACKEND_MIGRATION.md)).

| File | Old constant / operation | Variables (old) | New constant / operation | Variables (new) | Returns |
|---|---|---|---|---|---|
| user/query | `GET_PROPERTY` / `getProperty` | `$input: String!` → `propertyId` | `GET_PRODUCT` / `getProduct` | `productId` | `Product` |
| user/query | `GET_PROPERTIES` / `getProperties` | `PropertiesInquiry!` | `GET_PRODUCTS` / `getProducts` | `ProductsInquiry!` | `Products` |
| user/query | `GET_AGENT_PROPERTIES` / `getAgentProperties` | `AgentPropertiesInquiry!` | `GET_SELLER_PRODUCTS` / `getSellerProducts` | `SellerProductsInquiry!` | `Products` |
| user/query | `GET_AGENTS` / `getAgents` | `AgentsInquiry!` | `GET_SELLERS` / `getSellers` | `SellersInquiry!` | `Members` |
| user/query | `GET_FAVORITES` / `getFavorites` | `OrdinaryInquiry!` | unchanged name | `OrdinaryInquiry!` | `Products` (selection set changes) |
| user/query | `GET_VISITED` / `getVisited` | `OrdinaryInquiry!` | unchanged name | `OrdinaryInquiry!` | `Products` (selection set changes) |
| user/mutation | `CREATE_PROPERTY` / `createProperty` | `PropertyInput!` | `CREATE_PRODUCT` / `createProduct` | `ProductInput!` | `Product` |
| user/mutation | `UPDATE_PROPERTY` / `updateProperty` | `PropertyUpdate!` | `UPDATE_PRODUCT` / `updateProduct` | `ProductUpdate!` | `Product` |
| user/mutation | `LIKE_TARGET_PROPERTY` / `likeTargetProperty` | `$input: String!` → `propertyId` | `LIKE_TARGET_PRODUCT` / `likeTargetProduct` | `productId` | `Product` |
| admin/query | `GET_ALL_PROPERTIES_BY_ADMIN` / `getAllPropertiesByAdmin` | `AllPropertiesInquiry!` | `GET_ALL_PRODUCTS_BY_ADMIN` / `getAllProductsByAdmin` | `AllProductsInquiry!` | `Products` |
| admin/mutation | `UPDATE_PROPERTY_BY_ADMIN` / `updatePropertyByAdmin` | `PropertyUpdate!` | `UPDATE_PRODUCT_BY_ADMIN` / `updateProductByAdmin` | `ProductUpdate!` | `Product` |
| admin/mutation | `REMOVE_PROPERTY_BY_ADMIN` / `removePropertyByAdmin` | `$input: String!` → `propertyId` | `REMOVE_PRODUCT_BY_ADMIN` / `removeProductByAdmin` | `productId` | `Product` |

Also: every `memberProperties` in member selection sets → `memberProducts`; every `commentGroup`/`likeGroup` value `PROPERTY` → `PRODUCT`.
Unchanged operations: `GET_MEMBER`, `GET_BOARD_ARTICLE(S)`, `GET_COMMENTS`, `GET_MEMBER_FOLLOWERS/FOLLOWINGS`, `SIGN_UP`, `LOGIN`, `UPDATE_MEMBER`, `LIKE_TARGET_MEMBER`, board-article/comment mutations, `SUBSCRIBE`, `UNSUBSCRIBE`, `GET_ALL_MEMBERS_BY_ADMIN`, `GET_ALL_BOARD_ARTICLES_BY_ADMIN`, `UPDATE_MEMBER_BY_ADMIN`, `UPDATE/REMOVE_BOARD_ARTICLE_BY_ADMIN`, `REMOVE_COMMENT_BY_ADMIN`.

## 5. UI terminology changes

| Old (Nestar) | New (Petoria) | Where |
|---|---|---|
| Nestar | Petoria | titles, footer, join page, SEO |
| Property / Properties | Product / Products | nav, headings, cards, admin |
| Agent / Agents | Seller / Sellers | nav, seller pages, homepage "Top Agents" |
| Property type (Apartment / Villa / House) | Category (Food, Treat, Toy, Accessory, Clothing, Health, Grooming, Housing) | filter, add form |
| (none) | Pet type (Dog, Cat, Bird, Fish, Small animal, Reptile) | filter, add form, card badge |
| Rooms, Beds, Square, Year built | removed → Brand, Stock | filter, add form, detail page |
| Barter / Rent | On sale / Free delivery | filter options, card badges |
| Sold | Sold out | status labels, mypage |
| Address | removed (city/location kept) | add form, detail |
| "Property Search", "Agent Page", "Property type" (locale keys) | "Product Search", "Seller Page", "Category" | `public/locales/{en,kr,ru}/common.json`. Update **all three** locales |
| "Buy and sell properties anywhere anytime in South Korea" | pet-shop description (owner to approve) | `pages/_document.tsx` |

## 6. Risks

- F1–F4 must land **together** with the backend domain commit. Otherwise every property page errors against the dev API.
- Route changes (`/property` → `/product`) break old bookmarks. Add redirects in `next.config.js` if needed.
- SCSS class names (`.property-…`) are referenced from TSX. Renaming files without classes (or the reverse) breaks styles. This is why F6 is optional and separate.
