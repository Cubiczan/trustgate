/**
 * Vendored subset of cubiczan-resilience (typescript/src).
 *
 * Copied here because the repo has no npm registry access. Source of truth:
 * ../../../../cubiczan-resilience/typescript/src — keep in sync when upgrading.
 *
 * Provides: safeFetch (per-attempt timeout + exponential-backoff retry on
 * 429/5xx + network errors, optional SSRF allowlist) and requireAuth /
 * requireAuthResponse (fail-closed bearer-token gate).
 */
export { safeFetch } from "./safeFetch.js";
export type { SafeFetchOptions, AllowlistHook } from "./safeFetch.js";
export { requireAuth, requireAuthResponse } from "./auth.js";
export type { AuthResult, RequireAuthOptions } from "./auth.js";
export { ResilienceError, isResilienceError } from "./errors.js";
export type { ResilienceErrorKind } from "./errors.js";
export { retry } from "./retry.js";
export { withTimeout } from "./timeout.js";
