import * as algoliaFactory from '../integrations/algolia-factory'
import Algolia from '../integrations/algolia'
import * as product from '../product'

export async function indexData(filter?: string): Promise<void> {
  const products: Record<string, unknown>[] = await product.listAll(filter)
  if (!products.length) {
    return
  }

  const productsData: Record<string, unknown>[] = []

  for (const item of products) {
    ;(item.fields as Record<string, unknown>)['objectID'] = item['id']
    productsData.push(item.fields as Record<string, unknown>)
  }

  const algolia = algoliaInit()
  await algolia.indexData(productsData)
}

export async function reindexData(): Promise<void> {
  await indexData('LAST_MODIFIED_TIME() >= TODAY()')
}

export async function clearData(): Promise<void> {
  const algolia = algoliaInit()
  await algolia.clearData()
}

export function algoliaInit(): Algolia {
  return algoliaFactory.create(process.env.CATALOG_ALGOLIA_PRODUCTS_INDEX || '')
}
