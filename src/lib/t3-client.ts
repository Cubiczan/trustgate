/**
 * T3 API Client — Terminal 3 Network API Helper
 * Proxies requests to the Terminal 3 API with authentication.
 *
 * Based on official OpenAPI spec extracted from docs.terminal3.io
 * Base URL: staging.terminal3.io (or api.terminal3.io for production)
 * Auth: x-api-token header (required)
 * Sub-client: x-api-subclient-id header (optional)
 * Error format: { errors: [{ code: string, message: string }] }
 * Success format: { data: ... }
 */

import { safeFetch, isResilienceError } from './resilience'

// Production base URL (docs list staging.terminal3.io but api.terminal3.io is the live endpoint)
const T3_API_BASE = process.env.T3_API_BASE || 'https://api.terminal3.io'
const T3_API_KEY = process.env.T3_API_KEY || ''

// ── OpenAPI-derived types ──

export interface T3WalletAddress {
  wallet_address: string
  primary: boolean
  type: 'account' | 'linked'
}

export interface T3SocialData {
  // Populated from real API response
  [key: string]: unknown
}

export interface T3UserCredential {
  // VC structure from /v1/vc/issuer/credentials
  [key: string]: unknown
}

export interface T3DID {
  did: string
  // Populated from real API response
  [key: string]: unknown
}

export interface T3SubClient {
  id: string
  name?: string
  // Populated from real API response
  [key: string]: unknown
}

export interface T3ErrorResponse {
  errors: Array<{ code: string; message: string }>
}

export interface T3SuccessResponse<T> {
  data: T
}

export interface T3ApiResult<T> {
  success: boolean
  status: number
  data: T | null
  error: string | null
}

interface T3RequestOptions {
  method: string
  path: string
  body?: unknown
  params?: Record<string, string>
  subClientId?: string
  /**
   * OIDC access token. When present the request authenticates with an
   * `Authorization: Bearer <token>` header instead of the `x-api-token`
   * client header — required by the /openidc endpoints.
   */
  accessToken?: string
}

export async function t3Request<T = unknown>({ method, path, body, params, subClientId, accessToken }: T3RequestOptions): Promise<T3ApiResult<T>> {
  const url = new URL(`${T3_API_BASE}${path}`)
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value)
    })
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  // OIDC endpoints authenticate with a Bearer access token; everything else
  // uses the client-level x-api-token header.
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`
  } else {
    headers['x-api-token'] = T3_API_KEY
  }

  // Optional sub-client delegation header
  if (subClientId) {
    headers['x-api-subclient-id'] = subClientId
  }

  let res: Response
  try {
    // safeFetch adds a 10s per-attempt timeout (AbortSignal) and exponential
    // backoff with jitter, retrying on 429/5xx and network failures.
    res = await safeFetch(url.toString(), {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      timeoutMs: 10_000,
      maxAttempts: 3,
    })
  } catch (err) {
    // safeFetch throws a typed ResilienceError once retries are exhausted (or
    // on timeout/network failure). Surface it in the existing result shape so
    // callers keep their { success, status, data, error } contract.
    const status = isResilienceError(err) ? (err.status ?? 0) : 0
    const error = err instanceof Error ? err.message : `T3 API request failed`
    return { success: false, status, data: null, error }
  }

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    // Parse T3 error format: { errors: [{ code, message }] }
    const errorMsg = data?.errors?.[0]?.message
      || data?.error
      || data?.message
      || `T3 API error: ${res.status}`
    return { success: false, status: res.status, data: null, error: errorMsg }
  }

  // Unwrap { data: ... } envelope if present
  const payload = data?.data !== undefined ? data.data : data
  return { success: true, status: res.status, data: payload, error: null }
}

// ── Typed convenience wrappers ──

export async function t3Get<T = unknown>(path: string, params?: Record<string, string>, subClientId?: string): Promise<T3ApiResult<T>> {
  return t3Request<T>({ method: 'GET', path, params, subClientId })
}

export async function t3Post<T = unknown>(path: string, body?: unknown, subClientId?: string): Promise<T3ApiResult<T>> {
  return t3Request<T>({ method: 'POST', path, body, subClientId })
}

export async function t3Put<T = unknown>(path: string, body?: unknown, subClientId?: string): Promise<T3ApiResult<T>> {
  return t3Request<T>({ method: 'PUT', path, body, subClientId })
}

export async function t3Delete<T = unknown>(path: string, subClientId?: string): Promise<T3ApiResult<T>> {
  return t3Request<T>({ method: 'DELETE', path, subClientId })
}

// ── Domain-specific API methods (from OpenAPI spec) ──

/** POST /v1/user/create — Create a user from client */
export function createUser(body: Record<string, unknown>) {
  return t3Post('/v1/user/create', body)
}

/** GET /v1/user/{user_id}/social_data — Get user social data */
export function getSocialData(userId: number, subClientId?: string) {
  return t3Get(`/v1/user/${userId}/social_data`, undefined, subClientId)
}

/** GET /v1/user/{user_id}/wallet_addresses — Get user wallet addresses */
export function getWalletAddresses(userId: number, subClientId?: string) {
  return t3Get<T3WalletAddress[]>(`/v1/user/${userId}/wallet_addresses`, undefined, subClientId)
}

/** POST /v1/vc/issuer/store — Store a credential */
export function storeCredential(body: Record<string, unknown>, subClientId?: string) {
  return t3Post('/v1/vc/issuer/store', body, subClientId)
}

/** GET /v1/vc/issuer/credentials — List issued credentials */
export function listCredentials(subClientId?: string) {
  return t3Get<T3UserCredential[]>('/v1/vc/issuer/credentials', undefined, subClientId)
}

/** POST /v1/vc/issuer/credentials/proof — Generate presentation */
export function generatePresentation(body: Record<string, unknown>, subClientId?: string) {
  return t3Post('/v1/vc/issuer/credentials/proof', body, subClientId)
}

/** POST /v1/sub_client — Create sub-client */
export function createSubClient(body: Record<string, unknown>) {
  return t3Post<T3SubClient>('/v1/sub_client', body)
}

/** PUT /v1/sub_client/{subclient_id} — Update sub-client */
export function updateSubClient(subclientId: string, body: Record<string, unknown>) {
  return t3Put<T3SubClient>(`/v1/sub_client/${subclientId}`, body)
}

/** GET /v1/sub_client/{subclient_id} — Get sub-client */
export function getSubClient(subclientId: string) {
  return t3Get<T3SubClient>(`/v1/sub_client/${subclientId}`)
}

/** DELETE /v1/sub_client/{subclient_id} — Delete sub-client */
export function deleteSubClient(subclientId: string) {
  return t3Delete(`/v1/sub_client/${subclientId}`)
}

/** GET /v1/sub_client — List all sub-clients */
export function listSubClients() {
  return t3Get<T3SubClient[]>('/v1/sub_client')
}

/** POST /v1/did/register — Register DID */
export function registerDID(body: Record<string, unknown>) {
  return t3Post<T3DID>('/v1/did/register', body)
}

/** GET /v1/did — Get DID */
export function getDID(params?: Record<string, string>) {
  return t3Get<T3DID>('/v1/did', params)
}

/** POST /v1/transactional_email_template/send — Send transactional email */
export function sendTransactionalEmail(body: Record<string, unknown>, subClientId?: string) {
  return t3Post('/v1/transactional_email_template/send', body, subClientId)
}

// ── OIDC / Sign In with T3 ──

/** GET /v1/openidc/authorize — Initiate user auth (browser redirect) */
export function getAuthorizeUrl(params: { client_id: string; redirect_uri: string; response_type?: string; scope?: string; state?: string }) {
  const url = new URL(`${T3_API_BASE}/v1/openidc/authorize`)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  return url.toString()
}

/** POST /v2/openidc/token — Exchange one-time token for access token (v2) */
export function exchangeTokenV2(body: { code: string; client_id: string; client_secret?: string }) {
  return t3Post<{ access_token: string; token_type: string; expires_in?: number }>('/v2/openidc/token', body)
}

/** GET /v2/openidc/user — Get user info (v2) */
export function getUserInfoV2(accessToken: string) {
  return t3Request<Record<string, unknown>>({
    method: 'GET',
    path: '/v2/openidc/user',
    accessToken,
  })
}

/** GET /v1/openidc/user/social_connections — Get social connection statuses */
export function getSocialConnections(accessToken: string) {
  return t3Request({
    method: 'GET',
    path: '/v1/openidc/user/social_connections',
    accessToken,
  })
}

/** GET /v1/openidc/credentials — List user credentials via OIDC */
export function listUserCredentials(accessToken: string) {
  return t3Request<T3UserCredential[]>({
    method: 'GET',
    path: '/v1/openidc/credentials',
    accessToken,
  })
}

/** POST /v1/openidc/credentials/proof — Generate proof via OIDC */
export function generateUserProof(body: Record<string, unknown>, accessToken: string) {
  return t3Request({
    method: 'POST',
    path: '/v1/openidc/credentials/proof',
    body,
    accessToken,
  })
}
