# Petoria (backend)

Backend for Petoria. The frontend is in the sibling project `../petoria-next`.


## Read First

Before changing code, read the current AI handoff docs:

- `docs/ai/BACKEND_MIGRATION.md`
- `docs/ai/DECISIONS.md`
- `docs/ai/COMPLETED_TASKS.md`
- `docs/ai/NEXT_STEPS.md`

Use those files as the source of truth for AI Agent related migration history, accepted decisions, remaining work and validation status.

## Project Shape

- Backend apps are `petoria-api` and `petoria-batch`.
- Keep the existing NestJS resolver/service/module pattern based on MVC and DI.
- Keep DTOs, enums, schemas under `apps/petoria-api/src/libs`.
- Keep shared modules reusable: auth, member, like, view, comment, follow, board article, socket.

## Domain Rules

- Use Petoria/product terminology for the main catalog entity.
- Do not reintroduce property or real-estate fields.
- Keep `MemberType.USER`, `MemberType.AGENT` and `MemberType.ADMIN` unchanged.
- Product ownership continues to use `MemberType.AGENT` unless a later migration explicitly changes it.
- Product enum values are:
  - `ProductType`: `PET`, `FOOD`, `TOY`, `ACCESSORY`
  - `productSpecies`: `DOG`, `CAT`, `BIRD`, `FISH`
  - `productGender`: `MALE`, `FEMALE`

## Workflow

1. Analyze before editing.
2. Keep changes small and consistent with existing project patterns.
3. Do not remove working logic unless it is replaced safely.
4. Update `docs/ai/COMPLETED_TASKS.md` after major completed work.
5. Add or update focused tests when behavior changes.

## How to talk to the user

- Use **easy, simple English** in every reply, plan, and explanation.
- Normal length: not too long, not too short.
- If a technical word is needed, explain it in plain words.

## Project overview

NestJS monorepo with two apps:

- `apps/petoria-api` — GraphQL API (Apollo) + MongoDB (Mongoose) + JWT auth + WebSocket chat
  - `src/components/` — feature modules: auth, member, property, board-article, comment, follow, like, view
  - `src/schemas/` — Mongoose models
  - `src/libs/` — config, dto, enums, types, interceptor
  - `src/socket/` — WebSocket chat gateway
- `apps/petoria-batch` — scheduled batch jobs (batchRollback, batchTopProperties, batchTopAgents)

Env variables are in `.env` (PORT_API, PORT_BATCH, MONGO_DEV, MONGO_PROD, SECRET_TOKEN). **Never read out, change, or commit `.env` without asking.**

## Migration: nestar → petoria

We are **migrating this project from `nestar` to `petoria`**.

- **Done:** project/app names (folders `apps/petoria-api`, `apps/petoria-batch`, `package.json` name and scripts, `nest-cli.json`, `tsconfig.app.json`, welcome texts, tests).
- **Still old:** the real-estate domain (property) — the next step is changing it into a pet-shop **product** domain. `MemberType.AGENT` stays (see Domain Rules).

Rules for the migration:

- All **new** code, names, and commit messages use **petoria**, not nestar.
- Rename old `nestar` parts step by step, only when the user asks. Before renaming, explain in easy words what will change (folders, paths, scripts) and wait for the user's OK.
- Keep the backend (`petoria`) and frontend (`petoria-next`) in sync when a name both sides use is changed.

## Commands

- `npm run start:dev` — run the API in watch mode
- `npm run start:dev:batch` — run the batch app in watch mode
- Package manager: **npm**

## Validation

Use these checks for backend work:

```bash
npx tsc -p apps/petoria-api/tsconfig.app.json --noEmit
npx tsc -p apps/petoria-batch/tsconfig.app.json --noEmit
npm run build
```

`npm run lint` runs ESLint with `--fix`, so use it only when file rewriting is acceptable!

## Working rules

- If the user says "change", "fix", or "do", you can edit files. Before **big** changes, first explain the plan in easy words.
- **npm packages:** do not install or upgrade on your own. First check the new version fits the other packages, then ask the user.
- You may start the dev servers and use MongoDB for testing.
- Always ask before risky actions: force-push, deleting branches, rewriting git history, deleting data, touching `.env`.

## Git rules (short — full steps in the `commit` skill)

- Branches: `master`, `develop`, and **`modification`**. **All work now goes to `modification`** (the migration branch). Do not switch branches without asking.
- When a task is done, say: "We are done, it's time to commit. Let me commit?" — commit **only after the user says yes**.
- One commit per task. Message style: `feat: develop ...` / `fix: modify ...` (see the `commit` skill).
- **NEVER add Claude or any agent as co-author.** No `Co-Authored-By`, no "Generated with Claude Code". The user is the only author.
- After a commit, remind the user to push to `modification` (or do it if they said "commit and push").
- No pull requests.

## Skills in this project

Skills live in `.claude/skills/<name>/SKILL.md`:

- `commit` — how to commit and push in this project
- `backend-migration` — continue the Nestar to Petoria backend modification while preserving the current NestJS architecture
- `product-logic` — review product GraphQL, DTO, schema, enum, filter and naming consistency
- `frontend-design`, `design-taste-frontend` — design guides (installed; tracked in `skills-lock.json`)
