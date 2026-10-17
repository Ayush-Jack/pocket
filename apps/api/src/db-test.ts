import pg from 'pg'
import { loadEnvFile } from './runtime-config'

const { Client } = pg

loadEnvFile()

const client = new Client({
  connectionString: process.env.DATABASE_URL,
})

try {
  await client.connect()

  const result = await client.query('SELECT current_database(), version()')

  console.log('✅ PostgreSQL connected!')
  console.log('Database:', result.rows[0].current_database)
  console.log('PostgreSQL:', result.rows[0].version)
} catch (error) {
  console.error('❌ PostgreSQL connection failed:', error)
  process.exitCode = 1
} finally {
  await client.end().catch(() => {})
}