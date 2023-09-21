import { AuthenticationHeader } from "./authentication"
import httpClient from "./httpClient"
import starRezTable from "./starRezTable"

export default class starRezClient {
    private client: httpClient

    public constructor(domain: string, credentials: AuthenticationHeader) {
        this.client = new httpClient(`https://${domain}/StarRezREST/services/`, {
            'Authorization': credentials.getAuthHeader()
        })
    }

    public from(table: string) {
        return new starRezTable(this.client, table)
    }

    public async getAttachment(id: number) {
        const response = await this.client.get(`attachment/${id}`, {
            Accept: 'application/octet-stream'
        })
        return response.blob()
    }

    public async execute(sql: string) {
        const response = await this.client.post('query', sql, {
            'Content-Type': 'text/plain',
            'Accept': 'application/json'
        })
        return response.json()
    }
}