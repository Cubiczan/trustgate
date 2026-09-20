import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { isSerializationConflict, runWithWriteRetry } from './appendWithRetry.ts'

const conflict = (attemptNo: number) => {
  const err = new Error(`serialization failure on attempt ${attemptNo}`) as Error & { code?: string }
  err.code = 'P2034'
  return err
}

describe('isSerializationConflict (appendWithRetry)', () => {
  it('matches P2034-shaped errors and rejects everything else', () => {
    assert.equal(isSerializationConflict(conflict(1)), true)
    const other = new Error('unique constraint') as Error & { code?: string }
    other.code = 'P2002'
    assert.equal(isSerializationConflict(other), false)
    assert.equal(isSerializationConflict(new Error('no code')), false)
    assert.equal(isSerializationConflict(null), false)
    assert.equal(isSerializationConflict('P2034'), false)
  })
})

describe('runWithWriteRetry (appendWithRetry)', () => {
  it('retries a serialization conflict and succeeds on a later attempt', async () => {
    let calls = 0
    const retries: number[] = []
    const result = await runWithWriteRetry(
      async () => {
        calls += 1
        if (calls < 3) throw conflict(calls)
        return 'sealed'
      },
      { onRetry: (a) => retries.push(a) }
    )
    assert.equal(result, 'sealed')
    assert.equal(calls, 3)
    assert.deepEqual(retries, [1, 2])
  })

  it('gives up after maxAttempts when the conflict persists', async () => {
    let calls = 0
    await assert.rejects(
      () =>
        runWithWriteRetry(
          async () => {
            calls += 1
            throw conflict(calls)
          },
          { maxAttempts: 3 }
        ),
      (err: unknown) => isSerializationConflict(err)
    )
    assert.equal(calls, 3)
  })

  it('does not retry non-conflict errors', async () => {
    let calls = 0
    await assert.rejects(
      () =>
        runWithWriteRetry(async () => {
          calls += 1
          const err = new Error('unique constraint violation') as Error & { code?: string }
          err.code = 'P2002'
          throw err
        }),
      (err: unknown) => (err as { code?: string }).code === 'P2002'
    )
    assert.equal(calls, 1)
  })
})
