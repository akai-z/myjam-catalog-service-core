const algoliasearch = require('algoliasearch')
const Algolia = require('./algolia')

function create(indexName) {
  const client = algoliasearch(
    process.env.NEXT_PUBLIC_ALGOLIA_APP_ID,
    process.env.FUNCTIONS_ALGOLIA_ADMIN_KEY
  )

  return new Algolia(client.initIndex(indexName))
}

module.exports = {
  create
}
