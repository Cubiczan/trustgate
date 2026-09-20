import { timingSafeEqualString } from './timingSafeEqual.ts'

/**
 * Why a request was refused by the UiPath webhook signature gate.
 * Surfaced server-side (console.warn in the route) so an operator can tell
 * "the secret is not configured" apart from "the signature was wrong" —
 * the external 401 response deliberately does not distinguish them.
 */
export type SignatureRefusal =
  | 'secret_not_configured'
  | 'missing_signature'
  | 'signature_mismatch'

/**
 * Fails closed: without a configured UIPATH_WEBHOOK_SECRET no request is
 * trusted, so a misconfigured deployment rejects every payload instead of
 * accepting it unauthenticated.
 *
 * The import uses a relative `.ts` specifier so the node:test runner
 * (`node --experimental-strip-types --test`) can resolve it without a
 * path-alias loader.
 */
export function signatureRefusalReason(
  signature: string | null,
  secret: string | undefined,
): SignatureRefusal | null {
  if (!secret) return 'secret_not_configured'
  // An empty header value means the caller sent no usable signature —
  // same diagnostic as an absent header, same refusal either way.
  if (signature == null || signature === '') return 'missing_signature'
  return timingSafeEqualString(signature, secret) ? null : 'signature_mismatch'
}

export function signatureIsValid(
  signature: string | null,
  secret: string | undefined,
): boolean {
  return signatureRefusalReason(signature, secret) === null
}
