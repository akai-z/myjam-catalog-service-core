import algoliasearch from 'algoliasearch'
import Algolia from './algolia'

export function create(indexName: string): Algolia {
  const client = algoliasearch(
    process.env.NEXT_PUBLIC_ALGOLIA_APP_ID,
    process.env.FUNCTIONS_ALGOLIA_ADMIN_KEY,
  )

  return new Algolia(client.initIndex(indexName))
}
