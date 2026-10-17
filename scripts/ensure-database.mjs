import { readFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'

const text = readFileSync(new URL('../.env', import.meta.url), 'utf8')
const line = text.split(/\r?\n/).find((row) => row.startsWith('DATABASE_URL='))
if (!line) throw new Error('DATABASE_URL is missing')

let value = line.slice('DATABASE_URL='.length).trim()
if (
  (value.startsWith('"') && value.endsWith('"')) ||
  (value.startsWith("'") && value.endsWith("'"))
) {
  value = value.slice(1, -1)
}

const url = new URL(value)
const dbName = decodeURIComponent(url.pathname.replace(/^\//, '').split('/')[0] ?? '')
if (!/^[A-Za-z0-9_]+$/.test(dbName)) throw new Error('Unexpected database name')

const password = decodeURIComponent(url.password)
const psql = 'C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe'
const env = { ...process.env, PGPASSWORD: password }
const baseArgs = [
  '-h',
  url.hostname,
  '-p',
  url.port || '5432',
  '-U',
  decodeURIComponent(url.username),
  '-d',
  'postgres',
  '-v',
  'ON_ERROR_STOP=1',
]

function reportFailure(step, status, stderr) {
  const safe = password ? stderr.replaceAll(password, '[redacted]') : stderr
  process.stdout.write(`${JSON.stringify({ ok: false, step, status, detail: safe.trim().slice(0, 300) })}\n`)
}

const check = spawnSync(
  psql,
  [...baseArgs, '-tAc', `SELECT 1 FROM pg_database WHERE datname='${dbName}'`],
  { env, encoding: 'utf8' },
)
if (check.status !== 0) {
  reportFailure('check', check.status, `${check.stderr ?? ''}\n${check.stdout ?? ''}`)
  process.exit(check.status ?? 1)
}

if (check.stdout.trim() === '1') {
  process.stdout.write(`${JSON.stringify({ ok: true, created: false })}\n`)
  process.exit(0)
}

const create = spawnSync(psql, [...baseArgs, '-c', `CREATE DATABASE "${dbName}"`], {
  env,
  encoding: 'utf8',
})
if (create.status !== 0) {
  reportFailure('create', create.status, `${create.stderr ?? ''}\n${create.stdout ?? ''}`)
  process.exit(create.status ?? 1)
}

process.stdout.write(`${JSON.stringify({ ok: true, created: true })}\n`)
