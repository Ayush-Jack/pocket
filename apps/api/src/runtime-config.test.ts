import assert from 'node:assert/strict'
import path from 'node:path'
import { describe, it } from 'node:test'
import { isDeviceSessionId, repoRootFrom } from './runtime-config'

describe('repoRootFrom', () => {
  it('finds the repository root from apps/api/src', () => {
    const moduleDir = path.join('D:\\Project\\telegram drive', 'apps', 'api', 'src')
    assert.equal(repoRootFrom(moduleDir), path.resolve('D:\\Project\\telegram drive'))
  })
})

describe('isDeviceSessionId', () => {
  it('accepts a 32-character hex id', () => {
    assert.equal(isDeviceSessionId('a'.repeat(32)), true)
  })

  it('rejects path tricks and other browsers ids', () => {
    assert.equal(isDeviceSessionId('../local'), false)
    assert.equal(isDeviceSessionId('local'), false)
    assert.equal(isDeviceSessionId(`${'a'.repeat(32)}/database`), false)
    assert.equal(isDeviceSessionId(''), false)
  })
})
