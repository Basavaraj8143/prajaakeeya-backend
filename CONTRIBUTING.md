# Contributing to Prajaakeeya Backend

Thanks for contributing! This guide covers the workflow, conventions, and checks
we expect for every change. For project setup, architecture, and environment
configuration, start with the **[README](./README.md)**; for the test suite, see
**[TESTING.md](./TESTING.md)**.

---

## Table of contents

1. [Ground rules](#ground-rules)
2. [Getting set up](#getting-set-up)
3. [Branching model](#branching-model)
4. [Development workflow](#development-workflow)
5. [Before you commit — local checks](#before-you-commit--local-checks)
6. [Commit messages](#commit-messages)
7. [Tests](#tests)
8. [Coding standards](#coding-standards)
9. [Opening a pull request](#opening-a-pull-request)
10. [Pull request checklist](#pull-request-checklist)
11. [Reporting bugs & proposing features](#reporting-bugs--proposing-features)

---

## Ground rules

- Be respectful and constructive in issues, reviews, and discussions.
- Keep changes **focused** — one logical change per PR. Small PRs are reviewed
  and merged faster.
- Don't commit secrets. `.env` is gitignored; never paste real credentials into
  code, tests, commits, or PR descriptions.
- Don't change user-facing or API behavior incidentally. If a change alters an
  endpoint's contract, call it out explicitly in the PR description.

---

## Getting set up

Follow the [README → Getting started](./README.md#getting-started) section:
clone, `npm install`, create your `.env`, set up a local Postgres database, and
run `npm run start:dev`. Redis is optional locally (the app falls back to
in-memory cache/throttling).

---

## Branching model

- **`main`** → production. Protected; only updated via merges.
- **`staging`** → the default integration branch. **Branch your work off
  `staging` and open PRs back into `staging`.**
- Pushes to `staging` and `main` trigger CI and deploy to the respective
  environment (see [README → CI/CD](./README.md#cicd--deployment)).

Name your branch by type and scope:

```
feat/aspirant-contact-privacy
fix/vote-window-timezone
chore/bump-typeorm
docs/contributing-guide
test/votes-service
```

---

## Development workflow

```bash
# 1. Start from an up-to-date staging
git checkout staging
git pull origin staging

# 2. Create a feature branch
git checkout -b feat/my-change

# 3. Develop with the watcher running
npm run start:dev

# 4. Add/adjust tests for your change (see "Tests")

# 5. Run the full local check (see next section)

# 6. Commit using Conventional Commits, push, open a PR into staging
git push -u origin feat/my-change
```

---

## Before you commit — local checks

There are **no pre-commit hooks**, so CI is the gate — run these locally first to
avoid a red pipeline. CI runs the same four steps (`lint → typecheck → test →
build`).

```bash
npm run lint:check   # ESLint (no auto-fix) — same as CI
npm run lint         # ESLint with --fix while developing
npm run typecheck    # tsc --noEmit
npm test             # full Jest suite
npm run build        # ensure it compiles
```

A quick all-in-one before pushing:

```bash
npm run lint:check && npm run typecheck && npm test && npm run build
```

---

## Commit messages

We follow [Conventional Commits](https://www.conventionalcommits.org/). Format:

```
<type>(optional scope): <short, imperative summary>
```

**Types:** `feat`, `fix`, `refactor`, `perf`, `test`, `docs`, `chore`, `build`,
`ci`.

Examples (from this repo's history):

```
feat: add reminder functionality for meetings and visits
fix: vote window timezone handling
test: add unit tests for IssuesService, UsersService, and VotesService
docs: add comprehensive README for project overview and setup
```

Keep the summary in the imperative mood ("add", not "added"), under ~72
characters, and put any details in the body.

---

## Tests

- **Every behavior change needs a test.** New service logic → a
  `*.service.spec.ts`; new module → a `*.module.spec.ts`.
- Tests live **next to the code** they cover and must be **DB-free and
  server-free** (mock repositories and dependencies). This keeps the suite fast
  and runnable in CI with no infrastructure.
- Run `npm test` and make sure everything is green before opening a PR.
- See **[TESTING.md](./TESTING.md)** for the patterns and examples
  (`src/votes/votes.service.spec.ts` is a good template for service tests).

---

## Coding standards

- **TypeScript + NestJS module pattern.** One folder per feature with
  `controller → service → repository`. Cross-cutting concerns (guards,
  decorators, S3) live in `src/common/`.
- **DTOs + `class-validator`** for every request body. The global
  `ValidationPipe` runs with `whitelist + forbidNonWhitelisted`, so unknown
  fields are rejected — keep DTOs accurate and complete.
- **Formatting & linting:** Prettier + ESLint. Run `npm run lint` before
  committing; `lint:check` and `typecheck` must pass in CI.
- **Explicit module wiring.** Register providers/controllers and `exports`
  deliberately; prefer importing a module over reaching into globals.
- **Auth & access control:** use the existing guards
  (`JwtAuthGuard`, `OptionalJwtAuthGuard`, `RolesGuard` + `@Roles`). Don't expose
  protected data on public routes — verify access for each viewer type.

---

## Opening a pull request

1. Target the **`staging`** branch.
2. Give the PR a clear title (Conventional Commit style) and a description that
   explains **what** changed and **why**.
3. Note any API/behavior changes, migrations, or new environment variables
   explicitly.
4. Ensure **CI is green** — the `validate` job (`lint → typecheck → test →
   build`) must pass before review/merge.
5. Keep the PR focused; split unrelated changes into separate PRs.
6. Request review and address feedback with follow-up commits.

> **Migrations:** if your change touches the schema, add a timestamp-prefixed
> migration in `src/migrations/` (see
> [README → Database & migrations](./README.md#database--migrations)). Migrations
> run automatically on production deploy.

---

## Pull request checklist

- [ ] Branched off `staging` and targeting `staging`
- [ ] `npm run lint:check` passes
- [ ] `npm run typecheck` passes
- [ ] `npm test` passes (and new/changed behavior has tests)
- [ ] `npm run build` succeeds
- [ ] No secrets committed; `.env` untouched
- [ ] New env vars documented in the [README](./README.md#environment-variables)
- [ ] Schema changes include a migration
- [ ] PR description explains what & why, and flags any behavior/API changes

---

## Reporting bugs & proposing features

Open a GitHub issue with:

- **Bugs:** what you expected, what happened, steps to reproduce, the affected
  endpoint/module, and relevant logs (with secrets redacted).
- **Features:** the problem you're solving and a proposed approach.

For anything security-sensitive, contact the maintainers privately rather than
filing a public issue.
