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
  /** Rows with a legacy empty entryHash: unsealed, cannot participate in the chain. */
  unsealed: number
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
 *
 * Rows with an empty `entryHash` are pre-chain legacy records (added before
 * sealing existed, or written by a path that never sealed): they cannot
 * participate in a hash chain, so they are skipped and counted in `unsealed`
 * rather than reported as breakage. The first sealed row after them starts a
 * fresh genesis (its `prevHash` must be `''`, matching the append path's
 * `last?.entryHash ?? ''` lookup), and sealed rows chain onto the last sealed
 * row's `entryHash` — never onto an unsealed row.
 */
export function verifyEvidenceChain(rows: SealedEvidenceRow[]): ChainVerification {
  if (rows.length === 0) {
    return { intact: true, checked: 0, unsealed: 0, brokenAtIndex: null, reason: null }
  }
  let unsealed = 0
  let lastSealedHash: string | null = null
  let checkedSealed = 0
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    if (row.entryHash === '') {
      // Legacy unsealed row: absent from the chain, reported separately.
      unsealed++
      continue
    }
    checkedSealed++
    const expected = computeEvidenceHash(row, row.prevHash)
    if (row.entryHash !== expected) {
      return {
        intact: false,
        checked: checkedSealed,
        unsealed,
        brokenAtIndex: i,
        reason: `entry hash mismatch at index ${i}: recorded ${row.entryHash}, computed ${expected}`,
      }
    }
    const expectedPrev = lastSealedHash ?? ''
    if (row.prevHash !== expectedPrev) {
      return {
        intact: false,
        checked: checkedSealed,
        unsealed,
        brokenAtIndex: i,
        reason: `chain broken at index ${i}: prevHash does not match the prior sealed entryHash`,
      }
    }
    lastSealedHash = row.entryHash
  }
  return { intact: true, checked: checkedSealed, unsealed, brokenAtIndex: null, reason: null }
}
