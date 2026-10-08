# Timezone explorer

This is the operator-owned setup base, **not an implemented application**.
The first application must be Vite + React + TypeScript, without an API,
settings, persistence or a timezone picker.

## Application contract

Use Node **24.21.0** and npm **11.7.0**. The application author must add the
application dependency manifest, an npm-generated synchronized lockfile, source,
and meaningful tests. Then document and support:

```sh
npm ci
npm run dev
npm run typecheck
npm run test:unit
npm run build
npm run test:e2e
```

Display exactly `UTC`, `Pacific/Auckland`, `America/New_York`, `Asia/Kolkata`
and `Asia/Kathmandu`. Each labelled row must show its local `YYYY-MM-DD` date
and 24-hour `HH:mm:ss` time, calculated from one real current instant. Refresh
each second and after focus/visibility return, using supported IANA/Intl
semantics (including DST and fractional offsets). Invalid zones must produce
an explicit accessible error, never a UTC fallback.

Public acceptance hooks are `data-testid="timezone-clock"` on each row,
`data-timezone="<IANA>"`, and children with `data-testid="timezone-date"` and
`data-testid="timezone-time"`.

## Independent validation

The operator-owned [workflow](.github/workflows/timezone-acceptance.yml) runs
automatically on pushes and pull requests. It invokes frozen trusted
TypeScript/Vite/Vitest/Playwright entry points, not application-authored
successful scripts. Acceptance tests observe the sandboxed app only through
its browser UI. Missing manifests/source/tests fail, including on this setup
base. A red setup-only app check is expected; bootstrap readiness is separate.

The protected [acceptance assets](.github/trusted-validation/) are not worker
owned. Generated code runs in disposable credential-free containers, without
publisher/Steward/Azure credentials or an OIDC grant. Do not add credentials or
change governance/workflow files as part of application work. Operator release
is blocked unless the actual repository path/protection and credential
capability controls have been verified separately.
