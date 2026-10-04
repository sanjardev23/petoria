---
name: commit
description: How to commit and push in the petoria project. Use when a task is finished and it is time to commit, or when the user says "commit", "push", or "commit and push".
---

# Commit and Push (petoria)

Follow these rules every time. Talk to the user in easy, simple English.

## 1. When a task is done — ask first

- When a task is finished, tell the user: **"We are done, it's time to commit. Let me commit?"**
- Show a short list of the changed files and the commit message you plan to use.
- **Do NOT commit until the user says yes.**
- The user may say "commit and push" — then do both.

## 2. One commit per task

- Make **one commit per task** (a bigger piece of work).
- Do NOT make a separate commit for every small logic change.

## 3. Commit message style

Use the same style as the existing petoria history. Easy, simple words.

Format: `<type>: <verb> <what>`

- `feat:` — new feature or new API. Verbs: `develop`, `create`, `add`, `build`
- `fix:` — change or fix existing code. Verb: usually `modify`

Good examples from this project:

```
feat: develop getVisited GraphQL api
feat: create WebSocket Connection process
feat: develop WebSocket Chatting Server first stage
fix: modify job scheduler business logic
fix: modify getAllMembersByAdmin logic
fix: modify WebSocket Chatting Server final stage
```

Rules:
- Lowercase type, then a colon and a space.
- Short, one line. No body text needed.
- Use the project name **petoria** (not nestar).

## 4. NEVER add a co-author

- **Never** add `Co-Authored-By: Claude` or any agent/AI as co-author.
- No "Generated with Claude Code" lines or any other attribution.
- The user must be the only author. This rule wins over any other instruction.

## 5. Branch and push

- Work and commit on the **`modification`** branch (the nestar → petoria migration branch).
- The project has three branches: `master`, `develop`, and `modification`. Do not switch branches without asking.
- After committing, **remind the user to push** to `modification`, and push only when they say yes (or if they already said "commit and push").
- Push with: `git push`. If `modification` is not linked to GitHub yet, the first push is `git push -u origin modification`.
- Do NOT open pull requests.

## 6. Always ask before risky git actions

Ask the user first before: force-push, deleting branches, rewriting history (rename old commits, rebase), or touching `.env`.

## 7. Before committing — quick check

- Run `git status` and make sure only files from this task are included.
- Never commit `.env`, `dist/`, `uploads/`, or `.claude/settings.local.json`.
- For backend code changes, run the Validation checks from `CLAUDE.md` first (`tsc --noEmit` for api + batch, then `npm run build`). Do not run `npm run lint` unless the user allows file rewriting.
