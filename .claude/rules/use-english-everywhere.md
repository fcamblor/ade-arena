---
description: English is the default language for all repository artifacts (source code, comments, commit messages, docs, ADRs, Claude rules, runbooks). Chat with the user follows the user's own language preference.
globs:
  - "**/*"
---

# English by default

Every artifact committed to this repository is written in **English**:

- Source code identifiers (variables, functions, types, classes, files).
- Code comments and docstrings.
- Commit messages and PR descriptions.
- Markdown docs (`docs/`, `README.md`, `CHANGELOG.md`, runbooks).
- Architecture Decision Records (`docs/decisions/`).
- Claude rules (`.claude/rules/`).
- GitHub issue and PR templates.
- CLI help text, error messages, log entries.
- Internal scripts (comments, prompts, usage strings).

## Why

- English is the shared baseline that contributors of any background can read and edit without translation friction.
- AI assistants and search tooling perform best on English source material.
- Mixing languages inside the repo (e.g. French comments + English identifiers) makes diffs harder to scan and risks information drift between language variants.

## What stays in the user's language

- The **interactive conversation** between Claude and the user follows the user's own preference (typically French here — driven by per-user settings, not by repo rules).
- User-facing UI copy if the product is localized (Astro pages targeting end-users may have localized strings — those live in their own i18n files, not in identifiers/comments).

## When in doubt

If a piece of content is going to end up in `git` (file content, commit message, PR description), write it in English. If it is going to end up only in the user's chat or a transient terminal, follow the user's language.
