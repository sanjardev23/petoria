---
name: product-logic
description: Review Petoria product API consistency across GraphQL operations, DTOs, schemas, enums, filters, and remaining legacy terminology.
---

# Petoria Product API Review

Use this skill for review-only passes or pre-edit analysis of the product API.

## Review Checklist

- Confirm GraphQL operation names use product terminology:
  - `createProduct`
  - `getProduct`
  - and the other related product operations
- Confirm shared operations such as `getFavorites` and `getVisited` return product data.
- Confirm DTOs, schemas, and enums agree on product fields and nullability.
- Confirm filters use product type, species, gender, price, etc.
- Report real findings with paths and behavior impact.
