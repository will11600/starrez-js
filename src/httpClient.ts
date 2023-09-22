export default class httpClient {
    public baseUrl: string
    public baseHeaders: { [key: string]: string }

    constructor(baseUrl?: string, baseHeaders?: { [key: string]: string }) {
        if (baseUrl) {
            this.baseUrl = baseUrl
        } else {
            this.baseUrl = ''
        }
        if (baseHeaders) {
            this.baseHeaders = baseHeaders
        } else {
            this.baseHeaders = {}
        }
    }

    private async sendRequest(method: string, url: string, body: any, headers?: { [key: string]: string }): Promise<Response> {
        const requestHeaders = this.mergeHeaders(headers)
        const response = await fetch(this.baseUrl + url, {
            method,
            headers: requestHeaders,
            body
        })
        if (!response.ok) {
            try {
                const error = await response.json()
                throw new Error(error[0].description)
            } catch (e) {
                throw new Error(`The HTTP response code did not indicate success: ${response.status} - ${response.statusText}`)
            }
        }
        return response
    }

    private mergeHeaders(headers?: { [key: string]: string }): { [key: string]: string } {
        const mergedHeaders = { ...this.baseHeaders }
        if (headers) {
            for (const key in headers) {
                if (headers.hasOwnProperty(key)) {
                    mergedHeaders[key] = headers[key]
                }
            }
        }
        return mergedHeaders
    }

    public async get(url: string, headers?: { [key: string]: string }): Promise<Response> {
        return this.sendRequest('GET', url, null, headers)
    }

    public async post(url: string, body: any, headers?: { [key: string]: string }): Promise<Response> {
        return this.sendRequest('POST', url, body, headers)
    }

    public async put(url: string, body: any, headers?: { [key: string]: string }): Promise<Response> {
        return this.sendRequest('PUT', url, body, headers)
    }

    public async delete(url: string, headers?: { [key: string]: string }): Promise<Response> {
        return this.sendRequest('DELETE', url, null, headers)
    }

    public async patch(url: string, body: any, headers?: { [key: string]: string }): Promise<Response> {
        return this.sendRequest('PATCH', url, body, headers)
    }
}