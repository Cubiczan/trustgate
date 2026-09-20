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

describe('verifyEvidenceChain — unsealed legacy rows', () => {
  const sealedChain = seal([entry(), entry({ action: 'trade_executed' }), entry({ action: 'settlement_recorded' })])

  it('skips empty-hash legacy rows and reports them as unsealed, not broken', () => {
    // The real migration scenario: pre-chain rows (empty entryHash from the
    // @default("") migration) precede any sealing; the first append after them
    // starts a fresh genesis (prevHash ''), per the append path's
    // `last?.entryHash ?? ''` lookup. Legacy rows must not report as breakage.
    const legacy = { ...sealedChain[0], entryHash: '', prevHash: '' }
    const fresh = seal([entry({ action: 'first_post_legacy' }), entry({ action: 'second_post_legacy' })])
    const result = verifyEvidenceChain([legacy, ...fresh])
    assert.equal(result.intact, true)
    assert.equal(result.unsealed, 1)
    assert.equal(result.checked, 2)
    assert.equal(result.brokenAtIndex, null)
  })

  it('chains a sealed row onto the last sealed row across an unsealed gap', () => {
    // A sealed row written after legacy rows has prevHash '' (genesis) per the
    // append path's `last?.entryHash ?? ''` lookup; it must verify as intact.
    const genesis = entry({ action: 'first_sealed_after_legacy' })
    const withLegacyThenSealed = [
      { ...sealedChain[0], entryHash: '', prevHash: '' },
      { ...genesis, prevHash: '', entryHash: computeEvidenceHash(genesis, '') },
    ]
    const result = verifyEvidenceChain(withLegacyThenSealed)
    assert.equal(result.intact, true)
    assert.equal(result.unsealed, 1)
    assert.equal(result.checked, 1)
  })

  it('still detects tampering of a sealed row after unsealed rows', () => {
    const genesis = entry({ action: 'post_legacy_genesis' })
    const second = entry({ action: 'post_legacy_second' })
    const genesisHash = computeEvidenceHash(genesis, '')
    const rows = [
      { ...sealedChain[0], entryHash: '', prevHash: '' },
      { ...genesis, prevHash: '', entryHash: genesisHash },
      { ...second, prevHash: genesisHash, entryHash: computeEvidenceHash(second, genesisHash) },
    ]
    const tampered = rows.map((r, i) => (i === 2 ? { ...r, details: '{"tampered":true}' } : r))
    const result = verifyEvidenceChain(tampered)
    assert.equal(result.intact, false)
    assert.equal(result.brokenAtIndex, 2)
    assert.equal(result.unsealed, 1)
  })
})
