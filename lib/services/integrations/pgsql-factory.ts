import { Pool } from 'pg'
import { PgSql } from './pgsql'

const schema = process.env.CATALOG_PGSQL_SCHEMA || 'airtable'

const connectionInfo = {
  host: process.env.PGSQL_HOST,
  user: process.env.CATALOG_PGSQL_PRODUCTS_USER,
  password: process.env.CATALOG_PGSQL_PRODUCTS_PASSWORD,
  database: process.env.CATALOG_PGSQL_PRODUCTS_DB,
  port: process.env.PGSQL_PORT || 5432,
  ssl: {
    rejectUnauthorized: false,
  },
}

export function create(idField?: string): PgSql {
  return new PgSql(createPool(), schema, idField)
}

function createPool(): Pool {
  return new Pool(connectionInfo)
}
