import starRezClient from "./starRezClient";
import { EmailOutbox, EntryCorrespondence } from "./types";

export default class email {
    private _client: starRezClient;

    public subject: string;
    public body: string;
    public to: number[] | string[];

    public constructor(client: starRezClient, subject: string, body: string, to: number[] | string[]) {
        this._client = client;

        this.subject = subject;
        this.body = body;
        this.to = to;
    }

    private async getFromAddressAsync(entryId: number) {
        const { RoomLocation } = await this._client.from('Booking')
          .select('RoomLocation.RoomLocation')
          .innerJoin('RoomSpace', 'RoomSpaceID', 'RoomSpaceID')
          .innerJoin('RoomBase', 'RoomBaseID', 'RoomBaseID', 'RoomSpace')
          .innerJoin('RoomLocation', 'RoomLocationID', 'RoomLocationID', 'RoomBase')
          .eq('EntryID', entryId)
          .orderBy('ContractStartDate', 'DESC')
          .top(1)
          .single<{RoomLocation: string}>();
        
        const { FromAddress } = await this._client.from('EmailFromAddress')
          .select('FromAddress')
          .eq('FromName', RoomLocation)
          .single<{FromAddress: string}>();
        
        return { email: FromAddress, name: RoomLocation };
    }

    private async getDefaultFromAddressAsync() {
        const { FromAddress, FromName } = await this._client.from('EmailFromAddress')
          .select('FromAddress', 'FromName')
          .eq('EmailFromAddressID', 0)
          .single<{FromAddress: string, FromName: string}>();
        
        return { email: FromAddress, name: FromName };
    }

    private async getToAddressesAsync(entryId: number) {
        const emailAddresses = await this._client.from('EntryAddress')
          .select('Email')
          .eq('EntryID', entryId)
          .eqOr('AddressTypeID', 4, 5)
          .get<{Email: string}>();

        return emailAddresses.map(e => e.Email);
    }

    private async createCorrespondenceRecordAsync(entryId: number, outboxItem: EmailOutbox) {
        const correspondenceItem = await this._client.from('EntryCorrespondence').createDefault<EntryCorrespondence>();

        correspondenceItem.EntryID = entryId;
        correspondenceItem.CorrespondenceSourceID = 1;
        correspondenceItem.Description = `Email: ${outboxItem.Subject}`;
        correspondenceItem.Comments = `To: ${outboxItem.AddressTo}\r\nFrom: ${outboxItem.FromAddress} (${outboxItem.FromName})\r\nAttachments: \r\nBody: ${outboxItem.Body}`;
        correspondenceItem.FromEmail = outboxItem.FromAddress;

        await this._client.from('EntryCorrespondence').create(correspondenceItem);
    }

    public async send() {
        for (const recipient of this.to) {
            let outboxItem = await this._client.from('EmailOutbox').createDefault<EmailOutbox>();

            outboxItem.Subject = this.subject;
            outboxItem.Body = this.body;

            if (typeof(recipient) === 'number') {
                const toAddresses = await this.getToAddressesAsync(recipient);
                outboxItem.AddressTo = toAddresses.join(';');

                const fromAddress = await this.getFromAddressAsync(recipient);
                outboxItem.FromAddress = fromAddress.email;
                outboxItem.FromName = fromAddress.name;

                await this.createCorrespondenceRecordAsync(recipient, outboxItem);
            } else {
                outboxItem.AddressTo = recipient;

                const fromAddress = await this.getDefaultFromAddressAsync();
                outboxItem.FromAddress = fromAddress.email;
                outboxItem.FromName = fromAddress.name;
            }

            await this._client.from('EmailOutbox').create(outboxItem);
        }
    }
}