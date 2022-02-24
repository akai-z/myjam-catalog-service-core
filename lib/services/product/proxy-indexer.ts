import * as product from '../proxied-product'
import * as indexer from './indexer'

const listPageSize = 3000

export async function indexData(
  filter = '',
  filterValues: Array<string | number> = [],
): Promise<void> {
  const listTotalSize = await product.listSize(filter, filterValues)

  if (listTotalSize.count == 0) {
    return
  }

  const pagesCount = Math.ceil((listTotalSize.count as number) / listPageSize)
  const algolia = indexer.algoliaInit()
  let productsData
  let productsBatch

  for (let pageNumber = 1; pageNumber <= pagesCount; pageNumber++) {
    productsData = []
    productsBatch = await product.list(pageNumber, listPageSize, filter, filterValues, listPageSize)

    for (const productData of productsBatch) {
      productData['objectID'] = productData['id']
      productsData.push(productData)
    }

    await algolia.indexData(productsData)
  }
}

export async function reindexData(): Promise<void> {
  await indexData("last_modified >= NOW() - INTERVAL '24 HOURS'")
}

export async function clearData(): Promise<void> {
  await indexer.clearData()
}
