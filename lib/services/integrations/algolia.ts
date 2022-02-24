import { SearchIndex } from '@algolia/client-search'
import HttpError from '../../error/http'

export default class Algolia {
  private index: SearchIndex

  constructor(index: SearchIndex) {
    this.index = index
  }

  async indexData(data: Record<string, unknown>[]): Promise<void> {
    try {
      await this.index.saveObjects(data)
    } catch (err) {
      console.log(err)
      throw new HttpError(500, 'Data Indexing Failed')
    }
  }

  async clearData(): Promise<void> {
    try {
      await this.index.clearObjects()
    } catch (err) {
      console.log(err)
      throw new HttpError(500, 'Index data clear request failed')
    }
  }
}
