const airtable = require('../integrations/airtable')

const tableName = 'item_options'

async function list() {
  return await airtable.listAllRecords(tableName)
}

module.exports = {
  list,
}
