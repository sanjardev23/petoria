# ER Model: Petoria (pet shop)

> Status as of **2026-10-05** · branch `modification` · **implemented** in the backend (product module). The `properties` collection was dropped from the dev DB.
> The **Domain Rules** in `CLAUDE.md` win over this file. Product details were confirmed by the owner on 2026-10-05. Items marked 🟡 are still open.

The database is MongoDB, so there are no real foreign keys. A "FK" below is an `ObjectId` field that points to another collection. The code (services and `$lookup`) keeps the links correct, not the database.

## 1. Diagram

```mermaid
erDiagram
    MEMBER ||--o{ PRODUCT : "owns (memberType = AGENT)"
    MEMBER ||--o{ BOARD_ARTICLE : writes
    MEMBER ||--o{ COMMENT : writes
    MEMBER ||--o{ LIKE : gives
    MEMBER ||--o{ VIEW : makes
    MEMBER ||--o{ FOLLOW : "followerId"
    MEMBER ||--o{ FOLLOW : "followingId"
    MEMBER ||--o{ NOTICE : "writes (ADMIN)"
    MEMBER ||--o{ NOTIFICATION : "authorId"
    MEMBER ||--o{ NOTIFICATION : "receiverId"

    PRODUCT ||--o{ LIKE : "likeRefId (likeGroup = PRODUCT)"
    PRODUCT ||--o{ VIEW : "viewRefId (viewGroup = PRODUCT)"
    PRODUCT ||--o{ COMMENT : "commentRefId (commentGroup = PRODUCT)"
    PRODUCT |o--o{ NOTIFICATION : "productId"

    BOARD_ARTICLE ||--o{ LIKE : "likeRefId (likeGroup = ARTICLE)"
    BOARD_ARTICLE ||--o{ VIEW : "viewRefId (viewGroup = ARTICLE)"
    BOARD_ARTICLE ||--o{ COMMENT : "commentRefId (commentGroup = ARTICLE)"
    BOARD_ARTICLE |o--o{ NOTIFICATION : "articleId"

    MEMBER ||--o{ LIKE : "likeRefId (likeGroup = MEMBER)"
    MEMBER ||--o{ VIEW : "viewRefId (viewGroup = MEMBER)"
    MEMBER ||--o{ COMMENT : "commentRefId (commentGroup = MEMBER)"

    MEMBER {
        ObjectId _id PK
        string memberType "USER | AGENT | ADMIN"
        string memberStatus "ACTIVE | BLOCK | DELETE"
        string memberAuthType "PHONE | EMAIL | TELEGRAM"
        string memberPhone UK
        string memberNick UK
        string memberPassword "hash, select false"
        string memberFullName "optional"
        string memberImage
        string memberAddress "optional"
        string memberDesc "optional"
        int memberProducts "renamed from memberProperties"
        int memberArticles
        int memberFollowers
        int memberFollowings
        int memberPoints
        int memberLikes
        int memberViews
        int memberComments
        int memberRank
        int memberWarnings
        int memberBlocks
        date deletedAt "optional"
        date createdAt
        date updatedAt
    }

    PRODUCT {
        ObjectId _id PK
        ObjectId memberId FK "AGENT owner"
        string productType "PET | FOOD | TOY | ACCESSORY"
        string productStatus "ACTIVE | SOLD_OUT | DELETE"
        string productSpecies "DOG | CAT | BIRD | FISH"
        string productGender "MALE | FEMALE, only for PET"
        string productLocation "SEOUL | BUSAN | INCHEON | ... (city enum)"
        string productTitle
        number productPrice
        array productImages "string[]"
        string productDesc "optional"
        int productViews
        int productLikes
        int productComments
        int productRank
        date productBirthDate "optional, only for PET"
        date soldOutAt "optional"
        date deletedAt "optional"
        date createdAt
        date updatedAt
    }

    BOARD_ARTICLE {
        ObjectId _id PK
        ObjectId memberId FK
        string articleCategory "FREE | RECOMMEND | NEWS | HUMOR"
        string articleStatus "ACTIVE | DELETE"
        string articleTitle
        string articleContent
        string articleImage "optional"
        int articleLikes
        int articleViews
        int articleComments
        date createdAt
        date updatedAt
    }

    COMMENT {
        ObjectId _id PK
        ObjectId memberId FK "author"
        string commentGroup "MEMBER | ARTICLE | PRODUCT"
        ObjectId commentRefId "target, depends on commentGroup"
        string commentStatus "ACTIVE | DELETE"
        string commentContent
        date createdAt
        date updatedAt
    }

    LIKE {
        ObjectId _id PK
        ObjectId memberId FK "who liked"
        string likeGroup "MEMBER | PRODUCT | ARTICLE"
        ObjectId likeRefId "target, depends on likeGroup"
        date createdAt
        date updatedAt
    }

    VIEW {
        ObjectId _id PK
        ObjectId memberId FK "who viewed"
        string viewGroup "MEMBER | ARTICLE | PRODUCT"
        ObjectId viewRefId "target, depends on viewGroup"
        date createdAt
        date updatedAt
    }

    FOLLOW {
        ObjectId _id PK
        ObjectId followerId FK "member who follows"
        ObjectId followingId FK "member who is followed"
        date createdAt
        date updatedAt
    }

    NOTICE {
        ObjectId _id PK
        ObjectId memberId FK "admin author"
        string noticeCategory "FAQ | TERMS | INQUIRY"
        string noticeStatus "HOLD | ACTIVE | DELETE"
        string noticeTitle
        string noticeContent
        date createdAt
        date updatedAt
    }

    NOTIFICATION {
        ObjectId _id PK
        ObjectId authorId FK
        ObjectId receiverId FK
        ObjectId productId FK "optional, renamed from propertyId"
        ObjectId articleId FK "optional"
        string notificationType "LIKE | COMMENT"
        string notificationStatus "WAIT | READ"
        string notificationGroup "MEMBER | ARTICLE | PRODUCT"
        string notificationTitle
        string notificationDesc "optional"
        date createdAt
        date updatedAt
    }
```

## 2. Collections

| Entity | Collection | Status |
|---|---|---|
| `MEMBER` | `members` | Exists. Only change: `memberProperties` → `memberProducts` |
| `PRODUCT` | `products` | **New**. Replaces `properties`, which was dropped from the dev DB on 2026-10-05 (it had 0 documents) |
| `BOARD_ARTICLE` | `boardArticles` | Exists, no change |
| `COMMENT` | `comments` | Exists. Group value `PROPERTY` → `PRODUCT` |
| `LIKE` | `likes` | Exists. Group value `PROPERTY` → `PRODUCT` |
| `VIEW` | `views` | Exists. Group value `PROPERTY` → `PRODUCT` |
| `FOLLOW` | `follows` | Exists, no change |
| `NOTICE` | `notices` | Exists, no module yet |
| `NOTIFICATION` | `notifications` | Exists, no module yet. `propertyId` → `productId` (ref `'Product'`), group `PROPERTY` → `PRODUCT` |

## 3. Relationships in plain words

| From | To | Type | How it is stored |
|---|---|---|---|
| Member (AGENT) | Product | 1 → many | `products.memberId`. Only `AGENT` members can create products (`@Roles(MemberType.AGENT)`) |
| Member | Board article | 1 → many | `boardArticles.memberId` |
| Member | Member (follow) | many ↔ many | The `follows` collection is the join table: `followerId` + `followingId`. Unique pair |
| Member | Like | 1 → many | `likes.memberId`. One member can like one target only once (unique `memberId + likeRefId`) |
| Member | View | 1 → many | `views.memberId`. One view per member per target (unique `memberId + viewRefId`) |
| Like / View / Comment | Product, Board article, or Member | many → 1 | **Polymorphic link**: one id field (`likeRefId`, `viewRefId`, `commentRefId`) plus a group field that says which collection it points to |
| Member (ADMIN) | Notice | 1 → many | `notices.memberId` |
| Notification | Member | many → 1 (twice) | `authorId` (who did it) and `receiverId` (who gets it) |
| Notification | Product / Board article | many → 0..1 | `productId` or `articleId`, chosen by `notificationGroup` |

## 4. Product rules

| Rule | Detail |
|---|---|
| Type | `productType`: `PET`, `FOOD`, `TOY`, `ACCESSORY` (required) |
| Species | `productSpecies`: `DOG`, `CAT`, `BIRD`, `FISH` (required). For goods it means "made for this animal", e.g. dog food |
| Gender | `productGender`: `MALE`, `FEMALE`. 🟡 Used only when `productType = PET`, empty for other types. The service checks this |
| Status | `ProductStatus`: `ACTIVE` → `SOLD_OUT` (sets `soldOutAt`) or `DELETE` (sets `deletedAt`) |
| Location | `ProductLocation`: same city list as before (`SEOUL`, `BUSAN`, `INCHEON`, `DAEGU`, `GYEONGJU`, `GWANGJU`, `CHONJU`, `DAEJON`, `JEJU`), required |
| Birth date | `productBirthDate`: optional, only for `PET`. Replaces the old `constructedAt` |
| Unique index | 🟡 `{ memberId: 1, productTitle: 1 }`: one agent cannot list two products with the same title |
| Counters | `productViews`, `productLikes`, `productComments` are updated by the view, like, and comment services. `productRank` is set by the batch app |
| Rank formula | `productRank = productLikes * 2 + productViews` (same as the old property formula) |
| Agent rank | `memberRank = memberProducts * 5 + memberArticles * 3 + memberLikes * 2 + memberViews` |

## 5. Removed property fields

These real-estate fields are **not** in the product model and must not come back: `propertyAddress`, `propertySquare`, `propertyBeds`, `propertyRooms`, `propertyBarter`, `propertyRent`, `constructedAt`, and the `SquaresRange` filter.

Not added on purpose (owner decision, 2026-10-05): `productStock`, `productBrand`, `productOnSale`, `productFreeDelivery`. Because of this the old `options` filter (`availableOptions`) is removed too.
