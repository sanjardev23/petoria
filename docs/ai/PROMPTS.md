# Prompts: Nestar → Petoria Migration

> Prompts that worked in the 2026-10-03 session, plus ready-to-use templates for the next AI coding session.
> Copy a template and fill in the `<…>` parts. Every template repeats the project rules, so it works even without extra context.

## 1. Prompts used in this session

| # | Prompt (as given) | What it produced | Lesson |
|---|---|---|---|
| 1 | "Analyze current Nestar monorepo structure to transform existing NestJS monorepo NESTAR platform into Petshop platform" | Full inventory + a full domain plan (Product/SELLER) | Too broad. The domain choices could not be confirmed, so the plan stayed "proposed". Ask for one layer at a time |
| 2 | "Safe rename Layer (No Business logic change). Rename all visible project/app identifiers from Nestar to Petoria. Do Not change domain logic. Keep APIs and database collections unchanged. Update package names, environment labels constants. Run lint and typecheck after refactoring. Please make plan first!" | Precise, low-risk plan → commit `f9c138e` | **Best prompt.** Clear scope, explicit non-goals, validation requested, plan first |
| 3 | "Implement plan" | Execution with baseline/after checks | Works well after an approved plan |
| 4 | "Create a new folder: docs … BACKEND_MIGRATION.md, DECISIONS.md, FRONTEND_MIGRATION.md, COMPLETED_TASKS.md, NEXT_STEPS.md, PROMPTS.md … Do not change application source code." | This `docs/` folder | Good for handover. Repeat it at the end of each working day |

## 2. Reusable templates

### 2.1 Start of session (load context)
```text
Read CLAUDE.md and every file in docs/ (BACKEND_MIGRATION, DECISIONS, COMPLETED_TASKS, NEXT_STEPS).
Then tell me in easy English:
1) the current migration state (done vs proposed),
2) the top 3 tasks from NEXT_STEPS.md,
3) anything that looks out of date in docs/ compared to the code (check with git log and grep).
Do not change any files.
```

### 2.2 Confirm domain decisions
```text
Open docs/DECISIONS.md, items P1–P7 (Proposed).
For each one, ask me to confirm or change it, with 2–3 options and your recommendation.
After my answers, update only docs/DECISIONS.md (Status → Accepted/Rejected, with the date) and the 🟡 labels in
docs/BACKEND_MIGRATION.md and docs/FRONTEND_MIGRATION.md. No source code changes.
```

### 2.3 Backend role layer: AGENT → SELLER
```text
Role layer (no other domain change). Rename MemberType.AGENT to SELLER in the backend:
enum, @Roles guards, availableAgentSorts, AgentsInquiry → SellersInquiry, getAgents → getSellers,
memberProperties → memberProducts (schema + DTO), batchTopAgents → batchTopSellers (+ constant).
Do not touch the property module except the @Roles lines. Do not touch .env or MongoDB data.
Make a plan first (easy English, list every file). After my OK, implement, then:
- run `npx tsc --noEmit --incremental false -p apps/petoria-api/tsconfig.app.json` (and petoria-batch)
- run `npx eslint "{src,apps,libs,test}/**/*.ts"` (report only, no --fix) and compare with the baseline
- start the API and test getSellers in the GraphQL playground.
List the frontend files that will break. Ask before committing. No co-author.
```

### 2.4 Backend domain layer: Product module
```text
Domain layer: replace the property module with a product module, following docs/BACKEND_MIGRATION.md §5–7
(field mapping, enums, GraphQL names, collection `products`). Keep the old `properties` data, do not delete or migrate it.
Copy the existing property code pattern 1-to-1 (resolver guards, aggregation with $facet, statsEditor, lookupMember,
lookupAuthMemberLiked). Move OrdinaryInquiry to libs/dto/common.input.ts.
Fix the getVisited bug (it must call viewService, not likeService).
Update like/view/comment services, Group enums, Notification schema, components.module, batch.
Plan first, with a file list. After my OK: implement, typecheck, lint (report only), run the API, and run the
playground scenario from docs/NEXT_STEPS.md §3.4. Ask before committing. No co-author.
```

### 2.5 Small bug fix
```text
Fix only this bug: <description> in <file>. No other changes, no renames, no formatting of other code.
Explain the cause and the fix in 2–3 sentences first. After my OK, fix it and show how to test it
(a GraphQL query or a curl command). Ask before committing; message style `fix: modify …`.
```

### 2.6 Frontend rename layer (F0)
```text
In ../petoria-next: safe rename layer only. Change visible "Nestar"/"nestar" to "Petoria"/"petoria":
package.json name (and the 2 name lines in package-lock.json), <title>/meta in LayoutHome/LayoutBasic/LayoutFull,
Footer.tsx, pages/account/join.tsx, pages/_document.tsx keywords, the "NESTAR … MOBILE" placeholders, the .gitignore comment.
Do NOT change routes, GraphQL operations, types, or the property/agent wording. Keep CHANGELOG.md as is.
Show the _document.tsx description text you propose before writing it.
Plan first → my OK → implement → `npm run dev` smoke test → ask before committing. No co-author.
```

### 2.7 Frontend domain migration (F1–F5)
```text
In ../petoria-next: migrate to the backend product/seller API, following docs/FRONTEND_MIGRATION.md
(steps F1–F5, page and component mapping, GraphQL rename table, UI terminology table).
First check the real backend schema (start the API, read the GraphQL playground schema) and list any difference from the doc.
Plan first, grouped by step. After my OK, implement step by step and run `npm run dev` after each step.
Update all three locales (en, kr, ru). Ask before committing. No co-author.
```

### 2.8 Verification only
```text
Do not change code. Run the checks and report the results in a table:
typecheck (api, batch), eslint report-only (compare with the last known baseline in docs/COMPLETED_TASKS.md),
grep for leftover names <words>, start the API and batch (tell me if a port is busy and which process holds it, do not kill it),
and call GET / and the GraphQL `{ sayHello }`.
```

### 2.9 Update the docs at the end of the day
```text
Update docs/ to match today's work: add finished tasks + validation to COMPLETED_TASKS.md, remove them from NEXT_STEPS.md
and re-order what is left, update decision statuses in DECISIONS.md, refresh BACKEND_MIGRATION.md / FRONTEND_MIGRATION.md
labels (Done / Proposed / Unchanged), and add useful new prompts to PROMPTS.md.
Only change files in docs/. Use real file paths and commit hashes from git log.
```

### 2.10 Commit
```text
The task is done. Show me `git status` and a short diff summary, then suggest one commit message
in the project style (`feat: develop …` / `fix: modify …`). Commit only after I say yes, on the `modification` branch,
with me as the only author (no Co-Authored-By, no "Generated with"). Then remind me to push.
```

## 3. Tips that made prompts work

- Name the **layer** (rename / role / domain / frontend) and write the **non-goals** ("do not change API/DB/logic").
- Ask for a **plan first**, and ask for **validation** as concrete commands.
- Say "report-only lint". `npm run lint` uses `--fix` and changes unrelated files.
- Mention the rules: no `.env`, ask before data changes, ask before commit, no co-author.
