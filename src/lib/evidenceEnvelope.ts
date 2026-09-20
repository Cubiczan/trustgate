import { createHash } from 'node:crypto'

/**
 * Sealed evidence envelopes for the access audit trail (row 10).
 *
 * Every AccessLog row carries a SHA-256 `entryHash` over its canonical
 * content plus the previous row's `entryHash` (`prevHash`), forming a
 * tamper-evident chain: editing or deleting a historical row breaks every
 * hash after it, and `verifyEvidenceChain` reports the first break.
 */

export interface EvidenceEntry {
  agentId: string
  action: string
  resource: string
  details: string
  createdAt: string | Date
}

export interface SealedEvidenceRow extends EvidenceEntry {
  entryHash: string
  prevHash: string
}

export interface ChainVerification {
  intact: boolean
  checked: number
  brokenAtIndex: number | null
  reason: string | null
}

/** Deterministic canonical JSON: keys sorted recursively so equal entries hash equally. */
export function canonicalEvidenceJson(entry: EvidenceEntry): string {
  const sorted = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map(sorted)
    if (value instanceof Date) return value.toISOString()
    if (value && typeof value === 'object') {
      return Object.fromEntries(
        Object.entries(value as Record<string, unknown>)
          .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
          .map(([k, v]) => [k, sorted(v)])
      )
    }
    return value
  }
  return JSON.stringify(
    sorted({
      agentId: entry.agentId,
      action: entry.action,
      resource: entry.resource,
      details: entry.details,
      createdAt: entry.createdAt instanceof Date ? entry.createdAt.toISOString() : entry.createdAt,
    })
  )
}

/** SHA-256 hex over canonical(entry) chained onto prevHash. */
export function computeEvidenceHash(entry: EvidenceEntry, prevHash: string): string {
  return createHash('sha256').update(`${prevHash}:${canonicalEvidenceJson(entry)}`).digest('hex')
}

/**
 * Verify a chain of sealed rows (ascending order). Detects content tampering
 * (recomputed hash mismatch), link tampering (prevHash mismatch), and gaps.
 */
export function verifyEvidenceChain(rows: SealedEvidenceRow[]): ChainVerification {
  if (rows.length === 0) {
    return { intact: true, checked: 0, brokenAtIndex: null, reason: null }
  }
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const expected = computeEvidenceHash(row, row.prevHash)
    if (row.entryHash !== expected) {
      return {
        intact: false,
        checked: rows.length,
        brokenAtIndex: i,
        reason: `entry hash mismatch at index ${i}: recorded ${row.entryHash}, computed ${expected}`,
      }
    }
    if (i > 0 && row.prevHash !== rows[i - 1].entryHash) {
      return {
        intact: false,
        checked: rows.length,
        brokenAtIndex: i,
        reason: `chain broken at index ${i}: prevHash does not match the prior entryHash`,
      }
    }
  }
  return { intact: true, checked: rows.length, brokenAtIndex: null, reason: null }
}
