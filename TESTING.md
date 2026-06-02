# Backend Testing Guide

Automated test suite for the Prajaakeeya NestJS backend, built with
[Jest](https://jestjs.io/). All tests are **pure unit tests** — they use mocked
dependencies and run entirely in-process, with **no database, no Redis, and no
running server required**. This makes them fast, deterministic, and safe to run
anywhere (locally or in CI).

> **Status:** 26 test suites · 88 tests · all passing.

---

## Running the tests

```bash
npm install        # first time only
npm test           # run the whole suite once
npm run test:watch # re-run on file changes (TDD)
npm run test:cov   # run with a coverage report
```

Run a single file or pattern:

```bash
npx jest src/votes                       # everything under src/votes
npx jest aspirants.service.spec.ts       # one spec file
npx jest -t "castVote"                   # tests whose name matches "castVote"
```

Nothing else to set up — no `.env`, no DB connection, no services.

---

## What is tested

Tests live **next to the code** they cover (`*.spec.ts` beside each source
file). There are two layers:

### 1. Module wiring tests — `*.module.spec.ts` (22 files, 58 tests)

Every NestJS module has a spec that verifies its dependency-injection wiring via
the module metadata: that each module **registers its providers**, **declares
its controllers**, and **exports** what other modules depend on. These catch
broken or missing wiring (e.g. a service removed from `providers`, a controller
not registered) before the app is ever booted.

Covered modules: `admin`, `aspirants`, `aspirant-chat`, `aspirant-discussion`,
`aspirant-ward-meetings`, `auth`, `elections`, `extraction`, `forum`,
`geography`, `grama-panchayat`, `issues`, `media`, `notifications`,
`pdf-upload`, `reminders`, `stats`, `users`, `verification`, `voter-roll`,
`votes`, `wards`.

### 2. Service behavior tests — `*.service.spec.ts` (4 files, 30 tests)

These exercise the actual **business rules** of key services with mocked
repositories and dependencies, asserting real outcomes (return values, thrown
exceptions, and the fields written to the data layer).

| Service | What it locks in |
|---|---|
| **AspirantsService** (15) | Contact privacy: `phone` only shown when `allowPhone` is true, `whatsappNumber` only when `allowWhatsapp` is true — **except the owner**, who always sees their own. Plus `register` (auth, phone/whatsapp uniqueness, no duplicate active profile), `updatePermissions` (owner-only), `withdrawAspirant` (blocked while voting is open, reverts role to voter). |
| **VotesService** (6) | `castVote` rules: an active voting window is required, one vote per user per window, aspirant must exist and not be withdrawn, the user must have interacted first, and a successful vote is persisted with the correct fields. |
| **UsersService** (5) | `createReport` (unknown target → 404, disallowed attachment type rejected, valid attachment uploaded, report saved as `pending` with the reporter id) and `findAllVoters` pagination (`skip`/`take`) + response shaping. |
| **IssuesService** (4) | `createHandRaise` toggle (category required; raising an already-raised category removes it, otherwise adds it) and `createIssue` persistence with scoping + creator fields. |

---

## CI/CD

The suite runs automatically in GitHub Actions on **every pull request and push
to `main` and `staging`** (`.github/workflows/ci.yml`). The `validate` job runs:

```
lint  →  typecheck  →  npm test -- --runInBand  →  build
```

Because the tests need no external services, they run on a plain
`ubuntu-latest` runner with no extra setup. A red test fails the check and
blocks the merge (when branch protection requires CI). The deploy workflow
(`deploy.yml`) builds and ships only after this validation.

---

## Adding a new test

1. Create `<name>.spec.ts` next to the file it tests (Jest auto-discovers any
   `*.spec.ts` under `src/`).
2. For a **module**, copy an existing `*.module.spec.ts` and assert its
   providers / controllers / exports.
3. For a **service**, construct it with mock dependencies (or
   `Object.create(Service.prototype)` for services with large constructors),
   stub the methods it calls, and assert the behavior — see
   `src/votes/votes.service.spec.ts` for the pattern.
4. Keep tests **DB-free and server-free** so they stay fast and CI-safe.
5. Run `npm test` and make sure everything is green before opening a PR.
