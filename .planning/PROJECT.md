# CropKart Monorepo

## What This Is

CropKart is a full-stack agri-commerce marketplace that connects farmers, buyers, and retailers around crop discovery, orders, and seller operations. The monorepo combines a Next.js storefront, a FastAPI backend, LangFlow-based AI automation, and Supabase-backed data services.

## Core Value

A trusted digital marketplace where farmers can sell directly and buyers can source produce efficiently without relying on fragmented manual workflows.

## Requirements

### Validated

- ✓ Core storefront and marketplace flows are present in the frontend codebase — Phase 1 baseline
- ✓ FastAPI backend foundation and database models exist for authentication and core API logic — Phase 1 baseline
- ✓ LangFlow automation assets and workflow exports are present for AI-assisted crop operations — Phase 1 baseline

### Active

- [ ] Launch and validate the local monorepo setup across frontend, backend, and automation services
- [ ] Align the application stack around the canonical Supabase/FastAPI data model and runtime configuration
- [ ] Complete the product catalog, cart, checkout, and order experience for buyer journeys
- [ ] Complete farmer and seller dashboard flows for product listings and operational management
- [ ] Implement admin oversight for catalog, seller verification, and marketplace operations
- [ ] Integrate AI-assisted crop guidance and recommendation flows with backend tool endpoints
- [ ] Verify the full stack end to end in a safe local development workflow without touching the live database

### Out of Scope

- Native mobile app development — the current focus is the web experience and backend services
- Live production database migrations or direct Supabase writes during local setup — safety and schema integrity take precedence
- Full enterprise ERP or warehouse automation integration — these can be layered in after core commerce flows stabilize

## Context

This repository contains a brownfield monorepo assembled from a Next.js GreenCart app, a FastAPI CropKart backend, a LangFlow CropSathi automation project, and Supabase migration assets. The app is designed for a farmer marketplace, but the implementation is currently split across multiple subsystems with separate environment conventions. The work to begin here is to establish a clear working baseline, ensure local configuration is consistent, and then drive each service toward a verified, integrated product flow.

## Constraints

- **Tech stack**: Frontend is Next.js/React, backend is FastAPI, automation is LangFlow/Python, and persistence is Supabase/PostgreSQL — changes should respect each environment boundary
- **Safety**: The live database remains authoritative; local development must avoid destructive migrations and production data writes
- **Delivery**: This is a monorepo, so cross-service changes must be traceable to the correct runtime and ownership boundary
- **Dependencies**: Frontend, backend, and LangFlow runtime configuration all depend on environment variables and local service ports

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Treat the monorepo as one product with separate runtime boundaries | Different stacks need independent local setup and validation | ✓ Good |
| Keep Supabase as the canonical data layer | Existing architecture and docs already point to Supabase as the source of truth | ✓ Good |
| Prioritize local safety over automation execution | The repo includes live DB and provider credentials and warns against destructive actions | ✓ Good |
| Start with workflow scaffolding before deep implementation | Keeps project decisions traceable and sets a disciplined execution path | ✓ Good |

---
*Last updated: 2026-10-12 after project initialization*
