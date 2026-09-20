# TrustGate

**AI Agent Identity & Credential Management on Terminal 3 Network**

Built for the **DoraHacks ADK Challenge** on Terminal 3 Network (T3N).

## Overview

TrustGate is a comprehensive dashboard for managing AI agent identities, verifiable credentials (VCs), and decentralized identifiers (DIDs) on the Terminal 3 Network. It provides a unified interface for:

- **DID Management** — Register and manage decentralized identifiers
- **VC Wallet** — Store, issue, and present verifiable credentials
- **AI Agent Permissions** — Define and enforce role-based access control for AI agents
- **Sub-Client Management** — Multi-tenant sub-client administration
- **Access Audit** — Real-time logging and monitoring of all access events
- **Live T3N API Integration** — Full integration with Terminal 3's REST API (25+ endpoints)
- **UiPath Intake** — Ingest credential, presentation, and access-log handoffs from UiPath

## Architecture

```
TrustGate Dashboard (Next.js 16)
    |
    +-- T3 API Client (typed, OpenAPI-derived)
    |       |
    |       +-- User Management (create, wallet addresses, social data)
    |       +-- DID Registry (register, query)
    |       +-- VC Operations (store, list, generate presentations)
    |       +-- Sub-Client CRUD (create, update, get, delete, list)
    |       +-- Sign-In (OAuth authorize, token exchange)
    |       +-- Notifications (webhooks)
    |       +-- OpenID4VP (verifiable presentation authorization)
    |
    +-- Prisma ORM --> SQLite (local dev) / PostgreSQL (production)
    |
    +-- Demo Mode (seeded data, works without API key)
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 + shadcn/ui |
| Database | Prisma ORM (SQLite dev / Postgres prod) |
| Auth | T3N x-api-token header |
| API | Terminal 3 Network REST API v1 |

## Getting Started

### Prerequisites

- Node.js 18+ / Bun
- A T3N API key from [dashboard.terminal3.io](https://dashboard.terminal3.io)

### Installation

```bash
# Install dependencies
bun install
# or: npm install

# Set up database
npx prisma db push

# Seed demo data
npx prisma db seed

# Start development server
bun dev
# or: npm run dev
```

### Environment Variables

Copy `.env.example` to `.env` and fill in your T3N API key:

```bash
cp .env.example .env
```

The app works in **demo mode** without an API key (uses seeded local data).

## API Reference

Full T3N API reference with all 25 endpoints documented: [docs/t3n-api-reference.md](docs/t3n-api-reference.md)

### T3 API Endpoints

| Domain | Endpoints |
|--------|-----------|
| **User** | Create User, Get Social Data, Get Wallet Addresses |
| **DID** | Register DID, Get DID |
| **Credentials** | Store Credential, List Credentials, Generate Presentation |
| **Sub-Client** | Create, Update, Get, Delete, List |
| **Sign-In** | Authorize, Exchange Token V2 |
| **Notification** | User Event Webhook |
| **OpenID4VP** | Authorization Request |

### Authentication

All T3 API calls require the `x-api-token` header:

```
GET /v1/user/{user_id}/wallet_addresses
Header: x-api-token: <your-api-token>
Optional Header: x-api-subclient-id: <subclient-id>
```

### UiPath Intake

UiPath can POST credential, presentation, or access-log payloads to `/api/uipath`.
Signature checks are always on and fail closed: set `UIPATH_WEBHOOK_SECRET` and have
UiPath send the value in the `x-uipath-signature` (or `x-webhook-signature`) header.
Without a configured secret the endpoint rejects every request.

## Dashboard Tabs

1. **Dashboard** — Overview stats, active agents, recent credentials, system health
2. **DID Identity** — Register DIDs, manage wallet addresses, view social profiles
3. **AI Agents** — Agent registry, role permissions, capability management
4. **Credentials** — VC wallet, issue/present credentials, verification status
5. **Verification** — Active presentations, verification pipeline, trust scores
6. **Access Logs** — Real-time audit trail, filtering, compliance monitoring

## MAPS Integration

<p align="center">
  <img src="https://img.shields.io/badge/Built%20with-MAPS%20%7C%20Multi-Agent%20Pipeline%20Skills-blue" alt="MAPS" />
</p>

TrustGate's AI agent identity and credential management system aligns with the [MAPS framework](https://mojoaistudio.com/maps/) (Multi-Agent Pipeline Skills) for structured agent identity development.

### APS Layer (Per-Agent Pipeline) — Phase Mapping

| MAPS Phase | TrustGate Component |
|------------|---------------------|
| **A0 Alignment** | AI agent identity management on Terminal 3 Network — DID/VC/A permissions |
| **A1 Define** | Agent identity brief — role, capabilities, permission scope, credential types |
| **A2 Design** | DID/VC data model, role-based access control, sub-client multi-tenancy |
| **A3 Build** | Next.js 16 dashboard, T3 API client integration, Prisma ORM data layer |
| **A4 Equip** | Credential issuance/presentation capabilities, DID registration tools, API auth |
| **A5 Evaluate** | Verification pipeline — presentation validation, trust score assessment |
| **A6 Deploy** | Next.js deployment, T3N API integration configuration |
| **A7 Observe** | Access Logs tab — real-time audit trail, filtering, compliance monitoring |
| **A8 Improve** | Permission refinement from access patterns, trust score calibration |

### Key MAPS Concepts Applied

| Concept | TrustGate Implementation |
|---------|------------------------|
| **Agent Roster (M2)** | AI Agent registry with role permissions and capability management |
| **Capability Map (A4)** | DID operations, VC wallet, sub-client management, OpenID4VP auth |
| **Evaluation (A5)** | Verification pipeline — trust scores, credential validation status |
| **Observation (A7)** | Access audit trail — real-time logging, filtering, compliance dashboards |

### Recommended MAPS Skills

| Skill | Use Case |
|-------|----------|
| `/foundation` | M0 preflight — identity management domain, T3N API stack, credential standards |
| `/shape` | Validate Single-Agent track (identity per agent) vs Multi-Agent (multi-tenant) |
| `/define-agent` | Brief new agent identity types for expanded credential frameworks |
| `/equip-agent` | Capability mapping for DID/VC/permission tools per agent role |
| `/design-experience++` | UX for identity management dashboard with verification flows |
| `/observe-agent` | Access log monitoring and compliance audit trail analysis |
| `/improve-agent` | Improvement backlog from trust score degradation patterns |

---

## License

MIT
