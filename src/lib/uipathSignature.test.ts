import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { signatureIsValid } from './uipathSignature.ts'
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
