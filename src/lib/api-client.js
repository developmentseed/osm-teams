const APP_URL = process.env.APP_URL
class ApiClient {
  constructor() {
    this.defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  }

  baseUrl(subpath) {
    return `${APP_URL}/api${subpath}`
  }

  async fetch(method, path, data, config = {}) {
    const url = this.baseUrl(path)

    const defaultConfig = {
      format: 'json',
    }
    const requestConfig = {
      ...defaultConfig,
      ...config,
    }

    const { format, headers } = requestConfig
    var requestHeaders = this.defaultOptions.headers
    for (const key in headers) {
      requestHeaders[key] = headers[key]
    }

    const options = {
      ...this.defaultOptions,
      method,
      format,
      headers: requestHeaders,
    }

    if (data) {
      options.body = JSON.stringify(data)
    }

    // Fetch data and let errors to be handle by the caller
    // Fetch data and let errors to be handle by the caller
    const res = await fetchJSON(url, options)
    return res.body
  }

  get(path, config) {
    return this.fetch('GET', path, null, config)
  }

  post(path, data, config) {
    return this.fetch('POST', path, data, config)
  }

  patch(path, data, config) {
    return this.fetch('PATCH', path, data, config)
  }

  delete(path, config) {
    return this.fetch('DELETE', path, config)
  }
}

export default ApiClient

/**
 * Performs a request to the given url returning the response in json format
 * or throwing an error.
 *
 * @param {string} url Url to query
 * @param {object} options Options for fetch
 */
export async function fetchJSON(url, options) {
  let response
  options = options || {}
  const format = options.format || 'json'
  let data
  try {
    response = await fetch(url, options)
    if (format === 'json') {
      data = await response.json()
    } else if (format === 'binary') {
      data = await response.arrayBuffer()
    } else {
      data = await response.text()
    }

    if (response.status >= 400) {
      const err = new Error(data.message)
      err.statusCode = response.status
      err.data = data
      throw err
    }

    return { body: data, headers: response.headers }
  } catch (error) {
    error.statusCode = response ? response.status || null : null
    throw error
  }
}
