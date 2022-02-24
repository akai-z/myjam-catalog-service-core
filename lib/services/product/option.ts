import * as airtable from '../integrations/airtable'

const tableName = 'item_options'

export default async function list(): Promise<Record<string, unknown>[]> {
  return await airtable.listAllRecords(tableName)
}
