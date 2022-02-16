const product = require('./product')
const pgsqlFactory = require('./integrations/pgsql-factory')
const HttpError = require('../error/http')

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

async function record(slug) {
  const filter = `${product.identifierField} = $1 and status = 'enabled'`
  const pgsql = pgsqlFactory.create()
  const result = await pgsql.record(product.tableName, filter, [slug], queryFields())

  if (!result) {
    throw new HttpError(404, `Could not find the product "${slug}"`)
  }

  return result
}

async function listByIds(ids, pageNumber, pageSize = product.defaultListPageSize) {
  const filter = `${product.idField} = ANY($4::varchar[])`
  return await list(pageNumber, pageSize, filter, [ids])
}

async function listByIdsSize(ids) {
  const filter = `${product.idField} = ANY($4::varchar[])`
  return await listSize(filter, [ids])
}

async function listByType(type, pageNumber, pageSize = product.defaultListPageSize) {
  validateType(type)
  return await list(pageNumber, pageSize, type)
}

async function listByTypeSize(type) {
  validateType(type)
  return await listSize(type)
}

async function list(
  pageNumber,
  pageSize = product.defaultListPageSize,
  filter = '',
  filterValues = [],
  maxPageSize = product.defaultListPageSize,
) {
  const pgsql = pgsqlFactory.create()
  const { listFilter, listFilterValues } = listFilters(filter, filterValues, 4)

  pageSize = parseInt(pageSize)
  pageSize = pageSize > maxPageSize ? maxPageSize : pageSize

  return await pgsql.list(
    product.tableName,
    pageNumber,
    pageSize,
    listFilter,
    listFilterValues,
    queryFields(),
  )
}

async function listSize(filter = '', filterValues = []) {
  const pgsql = pgsqlFactory.create(product.idField)
  const { listFilter, listFilterValues } = listFilters(filter, filterValues)

  return await pgsql.listSize(product.tableName, listFilter, listFilterValues)
}

function listFilters(filter = '', filterValues = [], placeholderOffset = 1) {
  const placeholderNumber = placeholderOffset + filterValues.length
  const statusFilter = 'status = $' + placeholderNumber
  const listFilterValues = [...filterValues]

  const listFilter = filter !== '' ? '(' + filter + ') and ' + statusFilter : statusFilter

  listFilterValues.push('enabled')

  return { listFilter, listFilterValues }
}

function validateType(type) {
  if (!product.validTypes.includes(type)) {
    throw new HttpError(400, 'Invalid product type')
  }
}

function queryFields() {
  return fields.join(', ')
}

module.exports = {
  record,
  listByIds,
  listByIdsSize,
  listByType,
  listByTypeSize,
  list,
  listSize,
}
