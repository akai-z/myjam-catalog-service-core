const product = require('../proxied-product')
const indexer = require('./indexer')

const listPageSize = 3000

async function indexData(filter = '', filterValues = []) {
  const listTotalSize = await product.listSize(filter, filterValues)

  if (listTotalSize.count == 0) {
    return
  }

  const pagesCount = Math.ceil(listTotalSize.count / listPageSize)
  const algolia = indexer.algoliaInit()
  let productsData
  let productsBatch

  for (let pageNumber = 1; pageNumber <= pagesCount; pageNumber++) {
    productsBatch = await product.list(pageNumber, listPageSize, filter, filterValues, listPageSize)
    productsData = []

    for (const productData of productsBatch) {
      productData['objectID'] = productData['id']
      productsData.push(productData)
    }

    await algolia.indexData(productsData)
  }
}

async function reindexData() {
  await indexData("last_modified >= NOW() - INTERVAL '24 HOURS'")
}

async function clearData() {
  await indexer.clearData()
}

module.exports = {
  indexData,
  reindexData,
  clearData
}
