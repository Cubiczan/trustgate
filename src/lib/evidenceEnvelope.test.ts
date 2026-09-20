import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  canonicalEvidenceJson,
  computeEvidenceHash,
  verifyEvidenceChain,
} from './evidenceEnvelope.ts'
import type { SealedEvidenceRow } from './evidenceEnvelope.ts'

const entry = (overrides: Partial<Parameters<typeof computeEvidenceHash>[0]> = {}) => ({
  agentId: 'agent_1',
  action: 'credential_requested',
  resource: 'KYC Verified',
  details: '{"level":3}',
  createdAt: new Date('2025-06-01T12:00:00Z'),
  ...overrides,
})

const seal = (entries: Parameters<typeof computeEvidenceHash>[0][]): SealedEvidenceRow[] => {
  let prevHash = ''
  return entries.map((entry) => {
    const entryHash = computeEvidenceHash(entry, prevHash)
    const sealed = { ...entry, prevHash, entryHash }
    prevHash = entryHash
    return sealed
  })
}

describe('canonicalEvidenceJson (sealed evidence envelopes)', () => {
  it('is deterministic regardless of key insertion order', () => {
    const a = canonicalEvidenceJson(entry())
    const b = canonicalEvidenceJson({
      createdAt: new Date('2025-06-01T12:00:00Z'),
      details: '{"level":3}',
      resource: 'KYC Verified',
      action: 'credential_requested',
      agentId: 'agent_1',
    })
    assert.equal(a, b)
  })

  it('normalizes Date and ISO-string createdAt to the same canonical form', () => {
    const a = canonicalEvidenceJson(entry())
    const b = canonicalEvidenceJson(entry({ createdAt: '2025-06-01T12:00:00.000Z' }))
    assert.equal(a, b)
  })
})

describe('computeEvidenceHash (chain sealing)', () => {
  it('produces a stable 64-char hex digest', () => {
    const hash = computeEvidenceHash(entry(), '')
    assert.match(hash, /^[0-9a-f]{64}$/)
    assert.equal(hash, computeEvidenceHash(entry(), ''))
  })

  it('changes when the previous hash changes (linkage is content)', () => {
    assert.notEqual(
      computeEvidenceHash(entry(), 'aaa'),
      computeEvidenceHash(entry(), 'bbb')
    )
  })
})

describe('verifyEvidenceChain (tamper detection)', () => {
  const chain = seal([entry(), entry({ action: 'data_accessed' }), entry({ resource: 'Trade #TX-1' })])

  it('accepts an intact chain', () => {
    const result = verifyEvidenceChain(chain)
    assert.equal(result.intact, true)
    assert.equal(result.checked, 3)
    assert.equal(result.brokenAtIndex, null)
  })

  it('detects content tampering on a middle entry', () => {
    const tampered = chain.map((row, i) => (i === 1 ? { ...row, details: '{"level":9}' } : row))
    const result = verifyEvidenceChain(tampered)
    assert.equal(result.intact, false)
    assert.equal(result.brokenAtIndex, 1)
    assert.match(result.reason ?? '', /entry hash mismatch/)
  })

  it('detects a broken link when a row is spliced out', () => {
    const spliced = [chain[0], chain[2]]
    const result = verifyEvidenceChain(spliced)
    assert.equal(result.intact, false)
    assert.equal(result.brokenAtIndex, 1)
    assert.match(result.reason ?? '', /prevHash does not match/)
  })

  it('returns intact for an empty chain', () => {
    const result = verifyEvidenceChain([])
    assert.equal(result.intact, true)
    assert.equal(result.checked, 0)
  })
})
