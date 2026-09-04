# Blue Bolt Page Studio

## Mandatory Project Rules

* **Blue Bolt Design System is mandatory**: All visual decisions must follow `docs/DESIGN_SYSTEM_BLUE_BOLT.md`.
* **No arbitrary colors, fonts, or UI patterns**: Stick strictly to the predefined design system tokens.
* **Security first**: No raw HTML injection, `eval`, remote scripts, or unsafe URLs.
* **Secret management**: All AI/API keys remain server-side. Never expose secrets in browser code.
* **State management**: Every feature must have loading, empty, and error states.
* **Database safety**: No automatic database writes.
* **Deployment protocol**: No production deployment without explicit approval.
* **Verification protocol**: Run lint, build, and browser verification before reporting completion. Distinguish what was verified by browser, API, database, and build.
