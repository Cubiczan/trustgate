import { timingSafeEqualString } from './timingSafeEqual.ts'

/**
 * Signature gate for the UiPath webhook intake.
 *
 * Fails closed: without a configured UIPATH_WEBHOOK_SECRET no request is
 * trusted, so a misconfigured deployment rejects every payload instead of
 * accepting it unauthenticated.
 *
 * The import uses a relative `.ts` specifier so the node:test runner
 * (`node --experimental-strip-types --test`) can resolve it without a
 * path-alias loader.
 */
export function signatureIsValid(
  signature: string | null,
  secret: string | undefined,
): boolean {
  if (!secret) return false
  if (signature == null) return false
  return timingSafeEqualString(signature, secret)
}
