# Research Summary

## Repository findings

- The repo is a monorepo combining a Next.js storefront, a FastAPI backend, LangFlow automation assets, and Supabase database artifacts.
- The project clearly targets an agricultural marketplace with buyer, farmer, and admin roles.
- The README documents a brownfield setup, with environment-sensitive integration points and explicit warnings to avoid destructive live database operations.
- Frontend and backend run as distinct local services, while the LangFlow automation connects to backend endpoints rather than directly to the database.

## Risks and constraints

- Runtime configuration is distributed across multiple services and env files.
- The architecture is split across multiple stacks with different startup conventions.
- Safety requirements prevent automatic schema changes against the live Supabase environment.
- The current project needs a disciplined onboarding and validation pass before deeper implementation work.

## Initial focus

Phase 1 should establish a reliable local baseline and clear product understanding before moving to deeper feature work.
