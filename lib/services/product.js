const airtable = require('./integrations/airtable')
const HttpError = require('../error/http')

const tableName = 'items'
const idField = 'id'
const identifierField = 'slug'
const validTypes = ['featured', 'trending', 'weekly_deals']
const defaultListPageSize = process.env.PRODUCT_LIST_PAGE_SIZE || 50

async function product(slug) {
  const product = await airtable.findRecordByField(tableName, 'slug', slug, '{status} = "enabled"')

  if (!product) {
    throw new HttpError(404, `Could not find the product "${slug}"`)
  }

  return product
}

async function listByIds(ids, offset = null) {
  return await listByIdentifiers('RECORD_ID()', ids, offset)
}

async function listByType(type, offset = null) {
  return await list(`{${type}} = 1`, offset)
}

async function listByIdentifiers(identifierName, identifierValues, offset = null) {
  const identifiersFilter = []
  for (const identifierValue of identifierValues) {
    identifiersFilter.push(`${identifierName} = "${identifierValue}"`)
  }

  const filter = 'OR(' + identifiersFilter.join(', ') + ')'

  return await list(filter, offset)
}

async function listAll(filter = null, filterLogicalOperator = 'AND') {
  const selectParams = filterParams(filter, filterLogicalOperator)
  return await airtable.listAllRecords(tableName, selectParams)
}

async function list(filter = null, offset = null, filterLogicalOperator = 'AND') {
  const selectParams = filterParams(filter, filterLogicalOperator)
  selectParams.pageSize = defaultListPageSize

  if (offset) {
    selectParams.offset = offset
  }

  return await airtable.listRecords(tableName, selectParams)
}

function filterParams(filter = null, filterLogicalOperator = 'AND') {
  const params = { filter: '{status} = "enabled"' }

  if (filter) {
    params.filter = `${filterLogicalOperator}(${params.filter}, ${filter})`
  }

  return params
}

module.exports = {
  tableName,
  idField,
  identifierField,
  validTypes,
  defaultListPageSize,
  product,
  listByIds,
  listByType,
  listAll,
  list
}
