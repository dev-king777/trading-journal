# Contributing

## Development

```bash
npm install
npm run dev
```

Before opening a pull request:

```bash
npm run typecheck
npm run lint
npm run build
```

## Standards

- Keep TypeScript strict.
- Use server-side calculations for trading metrics.
- Keep Supabase keys and Stripe secrets out of git.
- Preserve the dark-first visual system.
- Prefer small, semantic commits.

## Branches

Use short branch names:

- `feat/pdf-reports`
- `fix/auth-flow`
- `docs/deployment-guide`

## Pull Requests

Include:

- What changed
- Screenshots for UI work
- Test/verification commands
- Any migration or env var changes
