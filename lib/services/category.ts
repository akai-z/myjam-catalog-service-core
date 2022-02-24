import * as airtable from './integrations/airtable'
import * as product from './product'
import * as proxiedProduct from './proxied-product'
import HttpError from '../error/http'

const tableName = 'categories'

export async function category(slug: string): Promise<Record<string, unknown>> {
  const category = await airtable.findRecordByField(tableName, 'slug', slug, '{status} = "enabled"')

  if (!category) {
    throw new HttpError(404, `Could not find the category "${slug}"`)
  }

  return category
}

export async function list(): Promise<Record<string, unknown>[]> {
  const selectParams = { filter: '{status} = "enabled"' }
  return await airtable.listAllRecords(tableName, selectParams)
}

export async function products(
  categorySlug: string,
  listOffset?: string,
): Promise<Record<string, unknown>[] | Record<string, unknown>> {
  const categoryData = await category(categorySlug)
  const categoryFields = categoryData.fields as Record<string, unknown>

  return 'items' in categoryFields
    ? await product.listByIds(categoryFields.items as string[], listOffset)
    : {}
}

export async function proxiedProducts(
  categorySlug: string,
  pageNumber: number,
  pageSize: string | number = product.defaultListPageSize,
): Promise<Record<string, unknown>[] | Record<string, unknown>> {
  const categoryData = await category(categorySlug)
  const categoryFields = categoryData.fields as Record<string, unknown>

  const products =
    'items' in categoryFields
      ? await proxiedProduct.listByIds(categoryFields.items as string[], pageNumber, pageSize)
      : {}

  return products
}

export async function proxiedProductsSize(categorySlug: string): Promise<Record<string, number>> {
  const categoryData = await category(categorySlug)
  const categoryFields = categoryData.fields as Record<string, unknown>
  const size = 'items' in categoryFields ? (categoryFields.items as string[]).length : 0

  return { count: size }
}
