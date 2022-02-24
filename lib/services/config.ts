import * as airtable from './integrations/airtable'

const tableName = 'configuration'

export async function list(): Promise<Record<string, unknown>[]> {
  const selectParams = { filter: '{status} = "enabled"' }
  return await airtable.listAllRecords(tableName, selectParams)
}
