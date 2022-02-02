module.exports = {
  category: require('./services/category'),
  product: require('./services/product'),
  proxiedProduct: require('./services/proxied-product'),
  productOption: require('./services/product/option'),
  productIndexer: require('./services/product/indexer'),
  productProxyIndexer: require('./services/product/proxy-indexer'),
  config: require('./services/config')
}
