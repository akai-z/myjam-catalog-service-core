import * as product from './product'
import * as pgsqlFactory from './integrations/pgsql-factory'
import HttpError from '../error/http'

const fields = [
  'id',
  'record_id',
  'name',
  'slug',
  'price',
  'special_price',
  'sku',
  'description',
  'status',
  'main_image',
  'thumbnail_image',
  'options',
  'categories',
]

export async function record(slug: string): Promise<Record<string, unknown>> {
  const filter = `${product.identifierField} = $1 and status = 'enabled'`
  const pgsql = pgsqlFactory.create()
  const result = await pgsql.record(product.tableName, filter, [slug], queryFields())

  if (!result) {
    throw new HttpError(404, `Could not find the product "${slug}"`)
  }

  return result
}

export async function listByIds(
  ids: Array<string | number>,
  pageNumber: number,
  pageSize: string | number = product.defaultListPageSize,
): Promise<Record<string, unknown>[]> {
  const filter = `${product.idField} = ANY($4::varchar[])`
  return await list(pageNumber, pageSize, filter, [ids])
}

export async function listByIdsSize(ids: Array<string | number>): Promise<Record<string, unknown>> {
  const filter = `${product.idField} = ANY($4::varchar[])`
  return await listSize(filter, [ids])
}

export async function listByType(
  type: string,
  pageNumber: number,
  pageSize: string | number = product.defaultListPageSize,
): Promise<Record<string, unknown>[]> {
  validateType(type)
  return await list(pageNumber, pageSize, type)
}

export async function listByTypeSize(type: string): Promise<Record<string, string | number>> {
  validateType(type)
  return await listSize(type)
}

export async function list(
  pageNumber: number,
  pageSize: string | number = product.defaultListPageSize,
  filter = '',
  filterValues: Array<string | number | Array<string | number>> = [],
  maxPageSize: string | number = product.defaultListPageSize,
): Promise<Record<string, unknown>[]> {
  const pgsql = pgsqlFactory.create()
  const { listFilter, listFilterValues } = listFilters(filter, filterValues, 4)

  pageSize = parseInt(pageSize as string)
  pageSize = pageSize > maxPageSize ? maxPageSize : pageSize

  return await pgsql.list(
    product.tableName,
    pageNumber,
    pageSize as number,
    listFilter as string,
    listFilterValues as Array<string | number>,
    queryFields(),
  )
}

export async function listSize(
  filter = '',
  filterValues: Array<string | number | Array<string | number>> = [],
): Promise<Record<string, string | number>> {
  const pgsql = pgsqlFactory.create(product.idField)
  const { listFilter, listFilterValues } = listFilters(filter, filterValues)

  return await pgsql.listSize(
    product.tableName,
    listFilter as string,
    listFilterValues as Array<string | number>,
  )
}

function listFilters(
  filter = '',
  filterValues: Array<string | number | Array<string | number>> = [],
  placeholderOffset = 1,
): Record<string, string | Array<string | number | Array<string | number>>> {
  const placeholderNumber = placeholderOffset + filterValues.length
  const statusFilter = 'status = $' + placeholderNumber
  const listFilterValues: Array<string | number | Array<string | number>> = [...filterValues]

  const listFilter = filter !== '' ? '(' + filter + ') and ' + statusFilter : statusFilter

  listFilterValues.push('enabled')

  return { listFilter, listFilterValues }
}

function validateType(type: string): void {
  if (!product.validTypes.includes(type)) {
    throw new HttpError(400, 'Invalid product type')
  }
}

function queryFields(): string {
  return fields.join(', ')
}
