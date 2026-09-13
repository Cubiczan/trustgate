import { createHash, timingSafeEqual } from 'node:crypto'

/**
 * Constant-time equality for secrets and tokens.
 *
 * Hashes both sides so `timingSafeEqual` always compares equal-length
 * digests and length mismatches cannot throw or leak via an early return.
 */
export function timingSafeEqualString(left: string, right: string): boolean {
  const leftDigest = createHash('sha256').update(left, 'utf8').digest()
  const rightDigest = createHash('sha256').update(right, 'utf8').digest()
  return timingSafeEqual(leftDigest, rightDigest)
}
