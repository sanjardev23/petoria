# Petoria (backend)

Backend for Petoria. The frontend is in the sibling project `../petoria-next`.

## How to talk to the user

- Use **easy, simple English** in every reply, plan, and explanation.
- Normal length: not too long, not too short.
- If a technical word is needed, explain it in plain words.

## Project overview

NestJS monorepo with two apps:

- `apps/nestar-api` — GraphQL API (Apollo) + MongoDB (Mongoose) + JWT auth + WebSocket chat
  - `src/components/` — feature modules: auth, member, property, board-article, comment, follow, like, view
  - `src/schemas/` — Mongoose models
  - `src/libs/` — config, dto, enums, types, interceptor
  - `src/socket/` — WebSocket chat gateway
- `apps/nestar-batch` — scheduled batch jobs (batchRollback, batchProperties, batchAgents)

Env variables are in `.env` (PORT_API, PORT_BATCH, MONGO_DEV, MONGO_PROD, SECRET_TOKEN). **Never read out, change, or commit `.env` without asking.**

## Migration: nestar → petoria

We are **migrating this project from `nestar` to `petoria`**. The old name still appears in many places, for example:

- app folders `apps/nestar-api`, `apps/nestar-batch`
- `package.json` name and scripts, `nest-cli.json`, `tsconfig.app.json` files
- some code inside `src/` (e.g. `app.service.ts`, `batch.module.ts`, `batch.service.ts`) and tests

Rules for the migration:

- All **new** code, names, and commit messages use **petoria**, not nestar.
- Rename old `nestar` parts step by step, only when the user asks. Before renaming, explain in easy words what will change (folders, paths, scripts) and wait for the user's OK.
- Keep the backend (`petoria`) and frontend (`petoria-next`) in sync when a name both sides use is changed.

## Commands

- `npm run start:dev` — run the API in watch mode
- `npm run start:dev:batch` — run the batch app in watch mode
- Package manager: **npm**

## Working rules

- If the user says "change", "fix", or "do", you can edit files. Before **big** changes, first explain the plan in easy words.
- **Do not** run build or lint to check work — not needed.
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
- `frontend-design`, `design-taste-frontend` — design guides (installed; tracked in `skills-lock.json`)
