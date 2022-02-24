import * as airtable from './integrations/airtable'
import HttpError from '../error/http'

export const tableName = 'items'
export const idField = 'id'
export const identifierField = 'slug'
export const validTypes = ['featured', 'trending', 'weekly_deals']
export const defaultListPageSize = process.env.PRODUCT_LIST_PAGE_SIZE || 50

export async function product(slug: string): Promise<Record<string, unknown>> {
  const product = await airtable.findRecordByField(tableName, 'slug', slug, '{status} = "enabled"')

  if (!product) {
    throw new HttpError(404, `Could not find the product "${slug}"`)
  }

  return product
}

export async function listByIds(
  ids: Array<string | number>,
  offset?: string,
): Promise<Record<string, unknown>[]> {
  return await listByIdentifiers('RECORD_ID()', ids, offset)
}

export async function listByType(
  type: string,
  offset?: string,
): Promise<Record<string, unknown>[]> {
  return await list(`{${type}} = 1`, offset)
}

async function listByIdentifiers(
  identifierName: string,
  identifierValues: Array<string | number>,
  offset?: string,
): Promise<Record<string, unknown>[]> {
  const identifiersFilter = []
  for (const identifierValue of identifierValues) {
    identifiersFilter.push(`${identifierName} = "${identifierValue}"`)
  }

  const filter = 'OR(' + identifiersFilter.join(', ') + ')'

  return await list(filter, offset)
}

export async function listAll(
  filter?: string,
  filterLogicalOperator = 'AND',
): Promise<Record<string, unknown>[]> {
  const selectParams = filterParams(filter, filterLogicalOperator)
  return await airtable.listAllRecords(tableName, selectParams)
}

export async function list(
  filter?: string,
  offset?: string,
  filterLogicalOperator = 'AND',
): Promise<Record<string, unknown>[]> {
  const selectParams = filterParams(filter, filterLogicalOperator)
  selectParams.pageSize = defaultListPageSize

  if (offset) {
    selectParams.offset = offset
  }

  return await airtable.listRecords(tableName, selectParams)
}

function filterParams(filter?: string, filterLogicalOperator = 'AND'): Record<string, unknown> {
  const params = { filter: '{status} = "enabled"' }

  if (filter) {
    params.filter = `${filterLogicalOperator}(${params.filter}, ${filter})`
  }

  return params
}
