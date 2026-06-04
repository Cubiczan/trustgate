# T3N API Reference — Extracted from docs.terminal3.io
# Source: Mintlify SPA RSC payload (2026-06-04)
# OpenAPI source file: terminal-3-openapi.yml

## Base URLs
- **Production**: `https://api.terminal3.io`
- **Staging**: `https://staging.terminal3.io` (listed in OpenAPI spec)

## Authentication
- **Header**: `x-api-token` (required for all endpoints)
- **Sub-client delegation**: `x-api-subclient-id` (optional)

## Response Formats
- **Success**: `{ data: <payload> }`
- **Error**: `{ errors: [{ code: string, message: string }] }`
- **Status codes**: 200, 400, 401, 403, 422

---

## TERMINAL 3 API

### User

#### POST /v1/user/create — Create User (from client)
Create a new user on Terminal 3 from the client without encryption and user acknowledgment.
- **Docs**: /api-reference/t3-api/user/create-user

#### GET /v1/user/{user_id}/social_data — Get Social Data
Retrieve the social data of a user.
- **Docs**: /api-reference/t3-api/user/get-social-data

#### GET /v1/user/{user_id}/wallet_addresses — Get Wallet Addresses
Retrieve all wallet addresses of a user.
- **Docs**: /api-reference/t3-api/user/get-wallet-addresses
- **Path params**: `user_id` (number, required, > 0)
- **Response 200**:
  ```json
  {
    "data": [
      {
        "wallet_address": "<string>",
        "primary": true,
        "type": "account"  // enum: "account" | "linked"
      }
    ]
  }
  ```

### User Credential

#### POST /v1/vc/issuer/store — Store a Credential
Store VC generated from the client.
- **Docs**: /api-reference/t3-api/user-credential/store-a-credential

#### GET /v1/vc/issuer/credentials — List Credentials
List issued credentials.
- **Docs**: /api-reference/t3-api/user-credential/list-credentials

#### POST /v1/vc/issuer/credentials/proof — Generate Presentation
Generate proof based on all VCs issued by the client and subclients.
- **Docs**: /api-reference/t3-api/user-credential/generate-presentation

### Sub Client

#### POST /v1/sub_client — Create Sub Client
- **Docs**: /api-reference/t3-api/sub-client/create-sub-client

#### PUT /v1/sub_client/{subclient_id} — Update Sub Client
- **Docs**: /api-reference/t3-api/sub-client/update-sub-client

#### GET /v1/sub_client/{subclient_id} — Get Sub Client
- **Docs**: /api-reference/t3-api/sub-client/get-sub-client

#### DELETE /v1/sub_client/{subclient_id} — Delete Sub Client
- **Docs**: /api-reference/t3-api/sub-client/delete-sub-client

#### GET /v1/sub_client — List Sub Clients
- **Docs**: /api-reference/t3-api/sub-client/list-sub-client

### DID

#### POST /v1/did/register — Register DID
Register DIDs for the client and its subclient.
- **Docs**: /api-reference/t3-api/did/register-did

#### GET /v1/did — Get DID
Retrieve a DID.
- **Docs**: /api-reference/t3-api/did/get-did

### Transactional Email Template

#### POST /v1/transactional_email_template/send — Send Transactional Email
Send an email based on a predefined custom transactional email template.
- **Docs**: /api-reference/t3-api/transactional-email-template/send-transactional-email-template

---

## SIGN IN WITH TERMINAL 3 (OIDC)

### Authorization

#### GET /v1/openidc/authorize — Authorize User
Initiate the user authentication process (OIDC Authorization Code Flow).
- **Docs**: /api-reference/sign-in/authorization/authorize-user

#### POST /v1/openidc/token — Exchange Token (DEPRECATED)
Exchange access token with one-time token.
- **Docs**: /api-reference/sign-in/authorization/exchange-token

#### POST /v2/openidc/token — Exchange Token (V2)
Exchange access token with one-time token.
- **Docs**: /api-reference/sign-in/authorization/exchange-token-v2

### User

#### GET /v1/openidc/user — Get User Info (DEPRECATED)
- **Docs**: /api-reference/sign-in/user/get-user-info

#### GET /v2/openidc/user — Get User Info (V2)
- **Docs**: /api-reference/sign-in/user/get-user-info-v2

#### GET /v1/openidc/user/social_connections — Get Social Connections
List all social connection statuses of a user.
- **Docs**: /api-reference/sign-in/user/get-social-connections

### User Credential (OIDC)

#### GET /v1/openidc/credentials — List Credentials
List issued verifiable credentials.
- **Docs**: /api-reference/sign-in/user-credential/list-credentials

#### POST /v1/openidc/credentials/proof — Generate Presentation
Generate proof for Verifiers as needed.
- **Docs**: /api-reference/sign-in/user-credential/generate-presentation

---

## NOTIFICATION

#### User Event Webhooks
- **Docs**: /api-reference/notification/user-event-webhook

---

## OPENID4VP/VC

### Getting Started
- **Docs**: /api-reference/openid4vp-vc/getting-started

### OIDC4VP

#### Authorization Endpoint
- **Docs**: /api-reference/openid4vp-vc/openid4vp/authorization

---

## Additional Documentation Pages

### Terminal 3 Network (T3N)
- /t3n/overview/introduction
- /t3n/overview/why-t3n
- /t3n/overview/use-cases
- /t3n/overview/network-philosophy
- /t3n/data-owner-guide/data-owner-overview
- /t3n/data-owner-guide/dashboard
- /t3n/data-owner-guide/manage-identity
- /t3n/data-owner-guide/delegate-access
- /t3n/developer-guide/developer-overview
- /t3n/how-t3n-works/network-architecture
- /t3n/how-t3n-works/tee-contracts
- /t3n/how-t3n-works/security-and-privacy
- /t3n/faq

### Documentation
- /documentation/overview/about
- /documentation/overview/platform-overview
- /documentation/overview/components/data-schema
- /documentation/overview/components/decentralized-storage
- /documentation/overview/components/encrypted-data-warehouse
- /documentation/overview/components/query-engine
- /documentation/preliminaries/web-standards/json
- /documentation/preliminaries/web-standards/dids
- /documentation/preliminaries/web-standards/vcs
- /documentation/preliminaries/cryptography/merkle-trees
- /documentation/preliminaries/cryptography/elliptic-curves
- /documentation/preliminaries/cryptography/accumulators
- /documentation/preliminaries/cryptography/zksnarks
- /documentation/preliminaries/cryptography/authenticated-data-structures
- /documentation/preliminaries/regulations/kyc-regulations
- /documentation/preliminaries/regulations/data-privacy
- /documentation/preliminaries/regulations/regulated-assets
- /documentation/products/identity
- /documentation/products/verify
- /documentation/products/user-onboarding
- /documentation/products/sign-in
- /documentation/products/segments
- /documentation/products/email
- /documentation/tooling/key-management
- /documentation/tooling/zkdb/purpose-architecture-benchmarks
- /documentation/tooling/zkdb/queries
- /documentation/tooling/on-chain-verifier
