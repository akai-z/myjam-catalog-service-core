const airtable = require('airtable')
import got, { RequestError } from 'got'
import HttpError from '../../error/http'

const apiBaseUrl = 'https://api.airtable.com/v0/'
const defaultView = 'Grid view'

export async function findRecordByField(
  table: string,
  fieldName: string,
  fieldValue: string,
  additionalFilters?: string,
): Promise<Record<string, unknown> | null> {
  const selectParams = {
    filter: `{${fieldName}} = "${fieldValue}"`,
    maxRecords: 1,
  }

  if (additionalFilters) {
    selectParams.filter = `AND(${selectParams.filter}, ${additionalFilters})`
  }

  const record = await listAllRecords(table, selectParams)

  return record.length ? { id: record[0].id, fields: record[0].fields } : null
}

export async function listAllRecords(
  table: string,
  selectParams?: Record<string, unknown>,
): Promise<Record<string, unknown>[]> {
  const list = await tableSelect(table, selectParams).all()
  const processedList: Record<string, unknown>[] = []

  if (list) {
    for (const item of list) {
      processedList.push({ id: item.id, fields: item.fields })
    }
  }

  return processedList
}

export async function listRecords(
  table: string,
  params?: Record<string, unknown>,
): Promise<Record<string, unknown>[]> {
  const headers = { 'Content-Type': 'application/json; charset=UTF-8' }
  const response = await apiRequest('GET', table, params, headers)

  return !Array.isArray(response) ? [response] : response
}

async function apiRequest(
  httpMethod: string,
  table: string,
  params?: Record<string, unknown>,
  headers?: Record<string, string>,
  body?: Record<string, unknown>,
): Promise<Record<string, unknown> | Record<string, unknown>[]> {
  const config: Record<string, unknown> = {
    method: httpMethod,
    headers: { Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}` },
    prefixUrl: apiUrl(),
    searchParams: selectParams(params),
  }

  if (headers !== null) {
    config.headers = {
      ...(config.headers as Record<string, string>),
      ...headers,
    }
  }

  if (body !== null) {
    config.body = body
  }

  try {
    return await got(table, config).json()
  } catch (err) {
    if (typeof err !== 'object' || !(err instanceof RequestError)) {
      throw new HttpError(500, 'DB Error')
    }

    const error: RequestError = err

    if ('statusCode' in error.response && 'body' in error.response) {
      console.log({
        statusCode: error.response.statusCode,
        body: error.response.body,
      })
    }

    throw new HttpError(
      'statusCode' in error.response ? error.response.statusCode : 500,
      'DB Error',
    )
  }
}

function apiUrl(): string {
  return apiBaseUrl + process.env.CATALOG_AIRTABLE_BASE_ID
}

function base(table: string) {
  return airtable.base(process.env.CATALOG_AIRTABLE_BASE_ID)(table)
}

function tableSelect(table: string, params?: Record<string, unknown>) {
  return base(table).select(selectParams(params))
}

function selectParams(params?: Record<string, unknown>): Record<string, unknown> {
  const resolvedParams: Record<string, unknown> = { view: defaultView }

  if (!params) {
    return resolvedParams
  }

  if (params.view) {
    resolvedParams.view = params.view
  }

  if (params.fields) {
    resolvedParams.fields = params.fields
  }

  if (params.filter) {
    resolvedParams.filterByFormula = params.filter
  }

  if (params.maxRecords) {
    resolvedParams.maxRecords = params.maxRecords
  }

  if (params.pageSize) {
    resolvedParams.pageSize = params.pageSize
  }

  if (params.offset) {
    resolvedParams.offset = params.offset
  }

  return resolvedParams
}
