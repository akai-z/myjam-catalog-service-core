export interface IHttpError extends Error {
  code: number
}

export default class HttpError extends Error implements IHttpError {
  code: number

  constructor(code: number, ...params: string[]) {
    super(...params)

    this.name = this.constructor.name
    this.code = code

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, HttpError)
    }
  }
}
