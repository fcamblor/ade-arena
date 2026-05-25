# ADR 005 — Pin versions by SHA

- **Status**: Accepted
- **Date**: 2026-05-22
- **Deciders**: @fcamblor

## Context

The repo originally referenced:
- `mise.toml` with `age = "latest"`, `sops = "latest"`, `terraform = "latest"`.
- GitHub Actions with floating tags (`actions/checkout@v4`, `hashicorp/setup-terraform@v3`, etc.).

Risks:
1. **Reproducibility not guaranteed**: a build green yesterday may break tomorrow if a release ships in between.
2. **Supply chain**: a Git tag is mutable. If a maintainer (or an attacker who compromised the maintainer's account) re-points `v4` at a malicious commit, every CI that uses `@v4` runs the malicious code on the next run. Real precedents: `tj-actions/changed-files` (March 2025), `reviewdog/action-setup` (August 2024).

## Options considered

1. **Pin by tag only**: `@v4.2.2`. Readable, but the tag remains mutable upstream.
2. **Pin by SHA + tag as a comment**: `@<sha> # v4.2.2`. SHA is immutable, tag stays readable and Dependabot-friendly.
3. **Vendoring** (cloning actions locally): overkill for this project.

## Decision

**Option 2** for GitHub Actions, **exact versions** for `mise.toml`.

### GitHub Actions

```yaml
- uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2
```

### `mise.toml`

```toml
[tools]
age = "1.2.1"
sops = "3.9.4"
terraform = "1.10.3"
node = "22.21.1"
pnpm = "10.17.0"
```

No `latest`, no `^1.0` ranges.

### Node dependencies

`package.json` may use `^` on application dependencies (developer ergonomics), **but**:
- `pnpm-lock.yaml` is always committed (already the case).
- Every CI action uses `pnpm install --frozen-lockfile`.

### Bumps

SHA bumps go through:
- **Dependabot** enabled on workflows (`.github/dependabot.yml` to be added).
- Explicit PR with upstream release notes reviewed.
- For binary tools (age, sops, terraform), manual resolution from the official Releases page on GitHub.

## Consequences

- ✅ 100% reproducible build.
- ✅ Immune to a post-publication tag compromise.
- ✅ The `# vX.Y.Z` comment stays readable and is parseable by Dependabot for automated bumps.
- ⚠️ More friction when adding actions (the SHA must be resolved). Mitigation: standard command `gh api repos/<owner>/<repo>/git/refs/tags/<tag> --jq '.object.sha'`.
- ⚠️ Patch bumps become visible in the diff (the SHA changes). That is actually desirable for audit.
- 🔄 **Re-evaluate** if the ecosystem adopts a signature standard (Sigstore, etc.) that makes tag mutability moot — we might relax then.

## Operational anchoring

A Claude rule reinforces this behavior when editing CI/infra:
- [`.claude/rules/pin-versions-by-sha.md`](../../.claude/rules/pin-versions-by-sha.md) (triggered on `mise.toml`, `.github/workflows/*.yml`).

## Links

- Floating-tag attack precedent: https://semgrep.dev/blog/2025/popular-github-action-tj-actionschanged-files-is-compromised/
- GitHub doc on SHA pinning: https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions#using-third-party-actions
