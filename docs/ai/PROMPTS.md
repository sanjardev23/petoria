# Prompts: Nestar → Petoria Migration

> Prompts that worked in the 2026-10-03 and 2026-10-05 sessions, plus ready-to-use templates for the next AI coding session.
> Copy a template and fill in the `<…>` parts. Claude Code loads `CLAUDE.md` (rules, Domain Rules, Validation) and the skills list automatically, so the templates do not need to repeat every rule.

## 1. Prompts used in this session

| # | Prompt (as given) | What it produced | Lesson |
|---|---|---|---|
| 1 | "Analyze current Nestar monorepo structure to transform existing NestJS monorepo NESTAR platform into Petshop platform" | Full inventory + a full domain plan (Product/SELLER) | Too broad. The domain choices could not be confirmed, so the plan stayed "proposed". Ask for one layer at a time |
| 2 | "Safe rename Layer (No Business logic change). Rename all visible project/app identifiers from Nestar to Petoria. Do Not change domain logic. Keep APIs and database collections unchanged. Update package names, environment labels constants. Run lint and typecheck after refactoring. Please make plan first!" | Precise, low-risk plan → commit `f9c138e` | **Best prompt.** Clear scope, explicit non-goals, validation requested, plan first |
| 3 | "Implement plan" | Execution with baseline/after checks | Works well after an approved plan |
| 4 | "Create a new folder: docs … BACKEND_MIGRATION.md, DECISIONS.md, FRONTEND_MIGRATION.md, COMPLETED_TASKS.md, NEXT_STEPS.md, PROMPTS.md … Do not change application source code." | This folder (now `docs/ai/`) | Good for handover. Repeat it at the end of each working day |
| 5 | (2026-10-05) "add this to claude md file … read them first, add the missing part" (with screenshots of rules) | `CLAUDE.md` Project Shape, Domain Rules, Workflow, Validation | Putting fixed rules in `CLAUDE.md` means you never need to repeat them |
| 6 | (2026-10-05) "make update docs to match with claude md" | This update of `docs/ai/` | Run it whenever `CLAUDE.md` rules change |

## 2. Reusable templates

### 2.1 Start of session (load context)
```text
Read every file in docs/ai/ (BACKEND_MIGRATION, DECISIONS, COMPLETED_TASKS, NEXT_STEPS).
Then tell me in easy English:
1) the current migration state (done vs accepted vs proposed),
2) the top 3 tasks from NEXT_STEPS.md,
3) anything that looks out of date in docs/ai/ compared to the code or CLAUDE.md (check with git log and grep).
Do not change any files.
```

### 2.2 Confirm the open decisions
```text
Open docs/ai/DECISIONS.md, items P3–P7 (Proposed), and docs/ai/NEXT_STEPS.md §0.2 (open product details).
For each one, ask me to confirm or change it, with 2–3 options and your recommendation.
After my answers, update only docs/ai/DECISIONS.md (Status → Accepted/Rejected, with the date) and the 🟡 labels in
docs/ai/BACKEND_MIGRATION.md and docs/ai/FRONTEND_MIGRATION.md. No source code changes.
```

### 2.3 Product API review (uses the `product-logic` skill)
```text
Use the product-logic skill. Review only, do not change code.
Check GraphQL operation names, DTOs, schemas, enums (ProductType, productSpecies, productGender), filters,
and leftover property/real-estate names. Report real findings with file paths and behavior impact.
```

### 2.4 Backend domain layer: Product module (uses the `backend-migration` skill)
```text
Use the backend-migration skill. Domain layer: replace the property module with a product module, following
docs/ai/BACKEND_MIGRATION.md §5–7 and the CLAUDE.md Domain Rules (ProductType PET/FOOD/TOY/ACCESSORY,
productSpecies, productGender, MemberType.AGENT stays as owner). Keep the old `properties` data, do not delete or migrate it.
Copy the existing property code pattern 1-to-1 (resolver guards, aggregation with $facet, statsEditor, lookupMember,
lookupAuthMemberLiked). Fix the getVisited bug (it must call viewService, not likeService).
Update like/view/comment services, Group enums, Notification schema, components.module, batch (memberProducts).
Plan first, with a file list. After my OK: implement, run the CLAUDE.md Validation commands, run the API, and run the
playground scenario from docs/ai/NEXT_STEPS.md §3.4. Ask before committing. No co-author.
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
In ../petoria-next: migrate to the backend product API (agent names stay), following docs/ai/FRONTEND_MIGRATION.md
(steps F1–F5, page and component mapping, GraphQL rename table, UI terminology table).
First check the real backend schema (start the API, read the GraphQL playground schema) and list any difference from the doc.
Plan first, grouped by step. After my OK, implement step by step and run `npm run dev` after each step.
Update all three locales (en, kr, ru). Ask before committing. No co-author.
```

### 2.8 Verification only
```text
Do not change code. Run the checks and report the results in a table:
the CLAUDE.md Validation commands (tsc api, tsc batch, npm run build), eslint report-only
(compare with the last known baseline in docs/ai/COMPLETED_TASKS.md),
grep for leftover names <words>, start the API and batch (tell me if a port is busy and which process holds it, do not kill it),
and call GET / and the GraphQL `{ sayHello }`.
```

### 2.9 Update the docs at the end of the day
```text
Update docs/ai/ to match today's work: add finished tasks + validation to COMPLETED_TASKS.md, remove them from NEXT_STEPS.md
and re-order what is left, update decision statuses in DECISIONS.md, refresh BACKEND_MIGRATION.md / FRONTEND_MIGRATION.md
labels (Done / Accepted / Proposed / Unchanged), and add useful new prompts to PROMPTS.md.
Only change files in docs/ai/. Use real file paths and commit hashes from git log. CLAUDE.md wins if they disagree.
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
- Say "report-only lint" when you do not want files changed. `npm run lint` uses `--fix` and changes unrelated files.
- Fixed rules (no `.env`, ask before data changes, ask before commit, no co-author, Domain Rules, Validation) are in `CLAUDE.md` and load automatically. Put new fixed rules there instead of repeating them in prompts.
- Name a skill (`backend-migration`, `product-logic`) when the task fits it.
