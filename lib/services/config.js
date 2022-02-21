const airtable = require('./integrations/airtable')

const tableName = 'configuration'

async function list() {
  const selectParams = { filter: '{status} = "enabled"' }
  return await airtable.listAllRecords(tableName, selectParams)
}

module.exports = {
  list,
}
