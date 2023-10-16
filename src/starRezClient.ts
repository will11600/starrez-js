import { AuthenticationHeader } from "./authentication"
import email from "./email"
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

    public email(subject: string, body: string, ...toAddresses: number[] | string[]) {
        return new email(this, subject, body, toAddresses)
    }

    public async emailRoom(subject: string, body: string, ...roomSpaceIds: number[]) {
        const entryIds = new Array<number>();

        for (const roomSpaceId of roomSpaceIds) {
            const roomEntries = await this.from('Booking')
              .select('EntryID')
              .eq('RoomSpaceID', roomSpaceId)
              .eq('EntryStatusEnum', 5)
              .get<{EntryID: number}>();

            entryIds.push(...roomEntries.map(e => e.EntryID));
        }

        return new email(this, subject, body, entryIds);
    }
}