# Roadmap: CropKart Monorepo

## Phase 1 — Baseline and environment alignment

**Goal:** Confirm the repo is a coherent product and establish a safe local development baseline across services.

### Deliverables

- Confirm the frontend, backend, automation, and Supabase topology
- Document environment variables and service ports for each runtime
- Establish the monorepo baseline without touching live database state
- Capture a shared project context for all future work

### Requirements covered

- MKT-01
- PLT-01
- PLT-02
- PLT-03

## Phase 2 — Buyer marketplace experience

**Goal:** Validate the end-user storefront and browsing journey across products, search, and checkout.

### Deliverables

- Product discovery and category browsing work reliably
- Product detail pages and search flows reflect buying intent
- Cart and checkout logic are complete enough for validating transaction flows
- Order state can be represented and traced through the backend

### Requirements covered

- MKT-02
- MKT-03
- COM-01
- COM-02
- COM-03

## Phase 3 — Seller operations and inventory workflows

**Goal:** Make the platform operational for farmers and sellers.

### Deliverables

- Farmer and seller account flows and product listing management
- Dashboard views for operations and inventory decisions
- Distinct seller access patterns and governance rules

### Requirements covered

- FAR-01
- FAR-02
- FAR-03

## Phase 4 — Admin and AI integration

**Goal:** Close operational control and AI-assisted workflows.

### Deliverables

- Admin overview and monitoring for marketplace operations
- Interfacing between LangFlow automation and safe FastAPI tool endpoints
- Shared security and runtime boundaries for AI tool calls

### Requirements covered

- ADM-01
- ADM-02
- AI-01
- AI-02

## Phase 5 — Validation and release readiness

**Goal:** Ensure the full stack is consistent, documented, and safe to ship.

### Deliverables

- End-to-end verification of the frontend/backend/automation integration
- Runtime validation against the expected local developer setup
- Final documentation and deployment guidance for local and hosted environments

### Requirements covered

- Cross-cutting verification for all active requirements

---
*Roadmap defined: 2026-10-12*
*Last updated: 2026-10-12 after project initialization*
