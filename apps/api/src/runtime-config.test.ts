import assert from 'node:assert/strict'
import path from 'node:path'
import { describe, it } from 'node:test'
import { repoRootFrom } from './runtime-config'

describe('repoRootFrom', () => {
  it('finds the repository root from apps/api/src', () => {
    const moduleDir = path.join('D:\\Project\\telegram drive', 'apps', 'api', 'src')
    assert.equal(repoRootFrom(moduleDir), path.resolve('D:\\Project\\telegram drive'))
  })
})
