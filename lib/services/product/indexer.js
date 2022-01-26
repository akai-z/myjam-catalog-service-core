const algoliaFactory = require('../integrations/algolia-factory')
const product = require('../product')

async function indexData(filter = null) {
  const products = await product.listAll(filter)
  if (!products.length) {
    return
  }

  const productsData = []
  for (const product of products) {
    product.fields['objectID'] = product['id']
    productsData.push(product.fields)
  }

  const algolia = algoliaInit()
  await algolia.indexData(productsData)
}

async function reindexData() {
  await indexData('LAST_MODIFIED_TIME() >= TODAY()')
}

async function clearData() {
  const algolia = algoliaInit()
  await algolia.clearData()
}

function algoliaInit() {
  return algoliaFactory.create(process.env.CATALOG_ALGOLIA_PRODUCTS_INDEX)
}

module.exports = {
  indexData,
  reindexData,
  clearData,
  algoliaInit
}
