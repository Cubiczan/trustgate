import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  signatureIsValid,
  signatureRefusalReason,
} from './uipathSignature.ts'
import { timingSafeEqualString } from './timingSafeEqual.ts'

const SECRET = 'test-webhook-secret'

describe('signatureIsValid (UiPath webhook gate)', () => {
  it('refuses every request when the secret is missing (fail closed)', () => {
    assert.equal(signatureIsValid('anything', undefined), false)
    assert.equal(signatureIsValid(null, undefined), false)
    assert.equal(signatureIsValid('', undefined), false)
  })

  it('refuses every request when the secret is configured but blank', () => {
    assert.equal(signatureIsValid('anything', ''), false)
    assert.equal(signatureIsValid(null, ''), false)
  })

  it('refuses a missing signature when a secret is configured', () => {
    assert.equal(signatureIsValid(null, SECRET), false)
    assert.equal(signatureIsValid('', SECRET), false)
  })

  it('refuses a wrong signature when a secret is configured', () => {
    assert.equal(signatureIsValid('wrong-signature', SECRET), false)
  })

  it('accepts the matching signature when a secret is configured', () => {
    assert.equal(signatureIsValid(SECRET, SECRET), true)
  })

  it('compares via the constant-time string equality', () => {
    assert.equal(timingSafeEqualString(SECRET, SECRET), true)
    assert.equal(timingSafeEqualString(SECRET, 'not-the-secret'), false)
  })
})

describe('signatureRefusalReason (server-side diagnostics)', () => {
  it('names a missing or blank secret as secret_not_configured', () => {
    assert.equal(signatureRefusalReason('anything', undefined), 'secret_not_configured')
    assert.equal(signatureRefusalReason(null, undefined), 'secret_not_configured')
    assert.equal(signatureRefusalReason('anything', ''), 'secret_not_configured')
  })

  it('names a missing signature as missing_signature when a secret is configured', () => {
    assert.equal(signatureRefusalReason(null, SECRET), 'missing_signature')
    assert.equal(signatureRefusalReason('', SECRET), 'missing_signature')
  })

  it('names a wrong signature as signature_mismatch', () => {
    assert.equal(signatureRefusalReason('wrong-signature', SECRET), 'signature_mismatch')
  })

  it('returns null for the matching signature', () => {
    assert.equal(signatureRefusalReason(SECRET, SECRET), null)
  })

  it('agrees with signatureIsValid on every case', () => {
    const cases: Array<[string | null, string | undefined]> = [
      ['anything', undefined],
      [null, SECRET],
      ['wrong-signature', SECRET],
      [SECRET, SECRET],
    ]
    for (const [signature, secret] of cases) {
      assert.equal(
        signatureIsValid(signature, secret),
        signatureRefusalReason(signature, secret) === null,
      )
    }
  })
})
