const HttpError = require('../../error/http')

class PgSql {
  constructor(pool, schema = 'public', idField = null) {
    this.pool = pool
    this.schema = schema
    this.idField = idField
  }

  async record(table, filter, filterValues, fields = '*') {
    const query = `
      SELECT ${fields}
      FROM ${this.schema}.${table}
      ${this.prepareFilter(filter)}
      LIMIT 1`

    const result = await this.runQuery(query, filterValues)

    return result['rows'] ? result['rows'][0] : result['rows']
  }

  async list(table, pageNumber, pageSize, filter = '', filterValues = [], fields = '*') {
    const queryValues = [pageSize, pageNumber, pageSize, ...filterValues]
    const query = `
      SELECT ${fields}
      FROM ${this.schema}.${table}
      ${this.prepareFilter(filter)}
      LIMIT $1 OFFSET ($2 - 1) * $3`

    const result = await this.runQuery(query, queryValues)

    return result['rows']
  }

  async listSize(table, filter = '', filterValues = []) {
    const queryValues = [...filterValues]
    const query = `
      SELECT count(${this.idField})
      FROM ${this.schema}.${table}
      ${this.prepareFilter(filter)}`

    const result = await this.runQuery(query, queryValues)

    return result['rows'][0]
  }

  prepareFilter(filter = '') {
    return filter ? ` WHERE ${filter}` : filter
  }

  async runQuery(query, values) {
    try {
      return await this.pool.query(query, values)
    } catch (err) {
      throw new HttpError(500, 'Failed to execute the request query')
    }
  }
}

module.exports = PgSql
