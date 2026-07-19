# Security Policy

## Reporting a vulnerability

**Please do not open a public issue for security problems.**

Email **hello@iamdex.codes** with:

- What the issue is and where in the code it lives
- Steps to reproduce, or a proof of concept
- What an attacker could achieve with it

You'll get an acknowledgement within 72 hours and a fix timeline once the
report is confirmed. LazyPrep is maintained by a small team, so please allow
reasonable time to patch before any public disclosure. Credit is given in the
release notes unless you'd rather stay anonymous.

## Scope

In scope:

- The LazyPrep application code in this repository
- The hosted deployment at `lazyprep.iamdex.codes`
- The Android app (`com.lazyprep.app`)

Out of scope:

- Third-party services (Vercel, Neon, Resend, Sentry, Google) — report those to
  the vendor directly
- Findings that require a compromised device, a rooted phone, or physical access
- Missing hardening headers with no demonstrated impact
- Automated scanner output submitted without a working proof of concept
- Denial of service and volumetric testing — please don't

## Handling of secrets

No credentials belong in this repository. `.env.example` is a placeholder
template only; every real value comes from the environment.

If you believe a secret has been committed, email rather than filing an issue,
so it can be rotated before attention is drawn to it.

## Notes for self-hosters

Running your own instance means you own its security posture. In particular:

- **`ENCRYPTION_KEY`** decrypts the AI provider keys your users store. Treat it
  with the same care as a database password, and never reuse one across
  environments.
- **`BETTER_AUTH_SECRET`** signs session tokens. Rotating it signs everyone out.
- Both should be 32 random bytes — `openssl rand -base64 32`.
- Sentry is inert unless you set your own DSN. Do not point it at the DexForge
  project.
