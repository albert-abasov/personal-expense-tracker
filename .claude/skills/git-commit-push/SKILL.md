---
name: git-commit-push
description: >
  Use this skill whenever the user asks to commit, push, save changes to git, or ship code.
  Trigger on phrases like "commit this", "push the changes", "save my work", "commit and push",
  "make a commit", "ship it", "push to git", or any variation. Also trigger after completing
  a feature or fix if the user says "done" or "that's good" in a context where changes have
  been made. This skill governs the full workflow: staging, writing the commit message,
  committing, and pushing — do not improvise this process.
---

# Git Commit & Push Skill

Follow this workflow exactly every time. Do not skip steps.

---

## Step 1 — Understand what changed

Before touching git, run:

```bash
git status
git diff --stat
```

Read the output. If the diff is large or spans multiple concerns, note the distinct areas —
this affects how you write the commit message and whether to suggest splitting into multiple
commits (see Step 3).

---

## Step 2 — Stage changes

Default: stage everything unless the user says otherwise.

```bash
git add -A
```

If the diff spans clearly unrelated concerns (e.g. a bug fix + an unrelated refactor), ask the
user before staging everything:

> "I see changes in X and Y — should I commit these together or as separate commits?"

Wait for their answer. Do not assume.

---

## Step 3 — Write the commit message

Use the **Conventional Commits** format:

```
<type>(<scope>): <short summary>

<optional body — what and why, not how>

<optional footer — breaking changes, issue refs>
```

### Types

| Type       | When to use                                              |
|------------|----------------------------------------------------------|
| `feat`     | New feature or endpoint                                  |
| `fix`      | Bug fix                                                  |
| `refactor` | Code change that neither fixes a bug nor adds a feature  |
| `test`     | Adding or updating tests                                 |
| `chore`    | Build, deps, config, migrations (no production logic)    |
| `docs`     | Documentation only                                       |
| `style`    | Formatting, whitespace (no logic change)                 |

### Scope

Use the domain or layer affected: `transaction`, `category`, `budget`, `auth`, `frontend`,
`migration`, `config`, etc.

### Summary line rules

- Imperative mood: "add endpoint" not "added endpoint" or "adds endpoint"
- Max 72 characters
- No period at the end
- Specific: "add DELETE /api/v1/categories/{id} with conflict guard" not "update categories"

### Body (include when the change is non-obvious)

- Explain *why*, not *what* (the diff shows what)
- Mention tradeoffs, constraints, or spec references if relevant
- Wrap at 72 characters

### Examples

```
feat(transaction): add paginated list endpoint with category filter

Implements GET /api/v1/transactions with userId scoping, date range
and category filters, and URL-param-based pagination per spec §5.4.
```

```
fix(category): block deletion when transactions exist

Returns 409 Conflict if any transaction references the category,
per spec §6.4. Frontend already handles this error shape.
```

```
chore(migration): add V2 transactions table

Includes composite index on (user_id, transaction_date DESC) for
the primary listing query.
```

---

## Step 4 — Commit

```bash
git commit -m "<summary line>" -m "<body if needed>"
```

For multi-line bodies, prefer a heredoc or writing to a temp file to avoid shell escaping issues:

```bash
git commit -F- <<'EOF'
feat(transaction): add paginated list endpoint with category filter

Implements GET /api/v1/transactions with userId scoping, date range
and category filters per spec §5.4.
EOF
```

---

## Step 5 — Push

```bash
git push
```

If the push is rejected (non-fast-forward), **stop and tell the user**. Do not rebase or force-push without explicit instruction. Show the error and ask what they want to do.

If the branch has no upstream yet:

```bash
git push -u origin <branch-name>
```

---

## Step 6 — Confirm

After a successful push, report back concisely:

> ✓ Committed and pushed: `feat(category): add color field and CRUD endpoints`
> Branch: `main` → `origin/main`

If something failed at any step, show the exact error and stop. Do not try to silently recover.

---

## Hard Rules

- **Never force-push** (`--force` or `--force-with-lease`) without the user explicitly asking.
- **Never amend a pushed commit** without the user explicitly asking.
- **Never rebase** without the user explicitly asking.
- **Never commit secrets** — if `git diff` shows anything resembling an API key, token, password,
  or `.env` content, stop and flag it before staging.
- If `git status` shows untracked files that look sensitive (`.env`, `*.pem`, `secrets.*`),
  flag them even if they won't be staged.