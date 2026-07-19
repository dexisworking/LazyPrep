# Contributing to LazyPrep

Thanks for taking an interest. Bug reports, fixes, and content corrections are
all welcome.

## Before you start

For anything beyond a small fix, **open an issue first**. LazyPrep is an opinionated
product with a specific scope, and it's better to agree on an approach before you
spend an evening on a PR that turns out not to fit.

## Two licenses, two kinds of contribution

This repository is split-licensed, and it matters for what you send:

| You're changing | Licensed under | By contributing you agree |
| --- | --- | --- |
| Code (anything outside `content/`) | [MIT](LICENSE) | Your contribution is MIT licensed |
| Course content (`content/`) | [CC BY-NC-ND 4.0](content/LICENSE) | It's your original work, and copyright is assigned to DexForge |

Do not submit course material you don't hold the rights to. Copying from
official exam guides, question banks, or another vendor's courseware is
copyright infringement and will be rejected.

## Local setup

See [Self-hosting](README.md#self-hosting) in the README. Short version:

```bash
pnpm install
cp .env.example .env      # fill in DATABASE_URL, DIRECT_URL, and the two secrets
pnpm prisma migrate deploy
pnpm content:import
pnpm dev
```

## Before you open a PR

```bash
pnpm lint
pnpm build
```

Both should pass. If you touched the Android project, also run:

```bash
pnpm android:check
```

That guards two Bubblewrap regressions that fail silently — see
[`android/README.md`](android/README.md).

## Conventions

- **Commits** follow [Conventional Commits](https://www.conventionalcommits.org/)
  (`feat:`, `fix:`, `chore:`, `docs:`) — the existing history is the reference.
- **Match the surrounding code.** This codebase has a consistent style for
  comments, naming, and component structure. Fit in rather than introducing a
  new dialect.
- **Server Actions over API routes** for mutations, unless there's a reason not to.
- **Validate input with Zod** at every trust boundary.
- **Keep PRs focused.** One concern per pull request; unrelated cleanups belong
  in their own.

## Adding a course

New content packs are genuinely useful. Drop a folder into `content/` with
`course.json`, `lessons/*.md`, and optionally `questions.json` and
`flashcards.json` — no code changes needed. The schema is documented in
[`content/README.md`](content/README.md).

Please open an issue before authoring a full course, so two people don't write
the same one.

## Security

Don't file security problems as public issues — see [SECURITY.md](SECURITY.md).
