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

## Dashboard Tabs

1. **Dashboard** — Overview stats, active agents, recent credentials, system health
2. **DID Identity** — Register DIDs, manage wallet addresses, view social profiles
3. **AI Agents** — Agent registry, role permissions, capability management
4. **Credentials** — VC wallet, issue/present credentials, verification status
5. **Verification** — Active presentations, verification pipeline, trust scores
6. **Access Logs** — Real-time audit trail, filtering, compliance monitoring

## License

MIT
