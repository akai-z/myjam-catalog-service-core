const HttpError = require('../../error/http')

class Algolia {
  constructor(index) {
    this.index = index
  }

  async indexData(data) {
    try {
      await this.index.saveObjects(data)
    } catch (err) {
      console.log(err)
      throw new HttpError(500, 'Data Indexing Failed')
    }
  }

  async clearData() {
    try {
      await this.index.clearObjects()
    } catch (err) {
      console.log(err)
      throw new HttpError(500, 'Index data clear request failed')
    }
  }
}

module.exports = Algolia
