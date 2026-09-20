/**
 * Bounded retry for evidence-chain append conflicts (Prisma P2034).
 *
 * The chain's read-prevHash-then-create pair must run at Serializable
 * isolation: under PostgreSQL's default READ COMMITTED, two concurrent
 * transactions can both read the same prevHash and insert rows with
 * identical prevHash, forking the chain. Serializable Snapshot Isolation
 * makes one of two concurrent writers abort with P2034 instead, so the
 * append retries a bounded number of times (re-reading the fresh prevHash
 * each attempt) before surfacing the conflict to the caller.
 */

const MAX_APPEND_ATTEMPTS = 5
const BASE_BACKOFF_MS = 25

/**
 * Structural match on Prisma's P2034 write-conflict/serialization-failure
 * code. Kept structural (not `instanceof`) so the classifier works across
 * Prisma versions and is constructible in tests with plain error objects.
 */
export function isSerializationConflict(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code: unknown }).code === 'P2034'
  )
}

export async function runWithWriteRetry<T>(
  fn: () => Promise<T>,
  opts: { maxAttempts?: number; onRetry?: (attempt: number) => void } = {}
): Promise<T> {
  const maxAttempts = opts.maxAttempts ?? MAX_APPEND_ATTEMPTS
  let lastErr: unknown
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (err) {
      lastErr = err
      if (!isSerializationConflict(err) || attempt === maxAttempts) throw err
      opts.onRetry?.(attempt)
      await new Promise((resolve) => setTimeout(resolve, BASE_BACKOFF_MS * attempt))
    }
  }
  throw lastErr
}
