# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Farm Plan** — Agricultural business plan template and farm management tool. Interactive web app for creating farm business plans.

## Tech Stack

- **Frontend**: Next.js, React, TypeScript
- **Deployment**: Netlify (farmplan.netlify.app)

## Key Commands

```bash
pnpm install              # Install dependencies
pnpm run dev              # Start dev server
pnpm run build            # Production build
pnpm run lint             # ESLint
```

## Related Repos

See also `zeeplan` — a similar agricultural business plan app focused on Zeerust regenerative agriculture.

## AgentKit Forge

This project has not yet been onboarded to [AgentKit Forge](https://github.com/phoenixvc/agentkit-forge). To request onboarding, [create a ticket](https://github.com/phoenixvc/agentkit-forge/issues/new?title=Onboard+farm-plan&labels=onboarding).

## Baton Integration

Baton is the shared task graph for cross-repo work. When the `baton` MCP server is available, agents should check for existing work with `task_check` at the start of meaningful tasks, create or claim visible work with `task_notify`/`log_agent_message`, update the task when significant new information becomes available, and log completion or blockers before handing off.
