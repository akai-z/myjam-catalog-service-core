import { Pool } from 'pg'
import HttpError from '../../error/http'

export class PgSql {
  private pool: Pool
  private schema: string
  private idField?: string

  constructor(pool: Pool, schema = 'public', idField?: string) {
    this.pool = pool
    this.schema = schema
    this.idField = idField
  }

  async record(
    table: string,
    filter: string,
    filterValues: Array<string | number> = [],
    fields = '*',
  ): Promise<Record<string, unknown> | null> {
    const query = `
      SELECT ${fields}
      FROM ${this.schema}.${table}
      ${this.prepareFilter(filter)}
      LIMIT 1`

    const result = (await this.runQuery(query, filterValues)) as Record<string, unknown>

    return result['rows']
      ? (result['rows'] as Record<string, unknown>[])[0]
      : (result['rows'] as null)
  }

  async list(
    table: string,
    pageNumber: number,
    pageSize: number,
    filter = '',
    filterValues: Array<string | number> = [],
    fields = '*',
  ): Promise<Record<string, unknown>[]> {
    const queryValues = [pageSize, pageNumber, pageSize, ...filterValues]
    const query = `
      SELECT ${fields}
      FROM ${this.schema}.${table}
      ${this.prepareFilter(filter)}
      LIMIT $1 OFFSET ($2 - 1) * $3`

    const result = (await this.runQuery(query, queryValues)) as Record<string, unknown>

    return result['rows'] as Record<string, unknown>[]
  }

  async listSize(
    table: string,
    filter = '',
    filterValues: Array<string | number> = [],
  ): Promise<Record<string, string | number>> {
    const queryValues = [...filterValues]
    const query = `
      SELECT count(${this.idField})
      FROM ${this.schema}.${table}
      ${this.prepareFilter(filter)}`

    const result = (await this.runQuery(query, queryValues)) as Record<string, unknown>

    return (result['rows'] as Record<string, unknown>[])[0] as Record<string, string | number>
  }

  private prepareFilter(filter = ''): string {
    return filter ? ` WHERE ${filter}` : filter
  }

  private async runQuery(query: string, values: Array<string | number>): Promise<unknown> {
    try {
      return await this.pool.query(query, values)
    } catch (err) {
      console.error(err)
      throw new HttpError(500, 'Failed to execute the request query')
    }
  }
}
