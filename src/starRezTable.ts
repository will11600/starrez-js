import httpClient from "./httpClient";
import queryBuilder from "./queryBuilder";

export default class starRezTable {
    private client: httpClient
    private tableName: string

    public constructor(client: httpClient, tableName: string) {
        this.client = client
        this.tableName = tableName
    }

    public async getPhoto(id: number, maxSize: number = -1) {
        let url = `photo/${this.tableName}/${id}`
        if (maxSize > 0) {
            url += `/${maxSize}`
        }
        const response = await this.client.get(url, {
            Accept: 'image/jpeg'
        })
        return response.blob()
    }

    public async setPhoto(id: number, photo: Blob) {
        if (photo.type !== 'image/jpeg') {
            throw new Error('Photo must be a JPEG')
        }
        await this.client.post(`setphoto/${this.tableName}/${id}`, photo)
    }

    public async at(id: number) {
        const response = await this.client.get(`select/${this.tableName}/${id}`, {
            Accept: 'application/json'
        })
        return response.json()
    }

    public async select(...fields: string[]) {
        return new queryBuilder(this.client, this.tableName, fields)
    }

    public async function(id: number, functionName: string) {
        const response = await this.client.get(`function/${this.tableName}/${id}/${functionName}`, {
            Accept: 'application/json'
        })
        return response.json()
    }

    public async createDefault() {
        const response = await this.client.get(`createdefault/${this.tableName}`, {
            Accept: 'application/json'
        })
        return response.json()
    }

    public async create(data: any) {
        const response = await this.client.post(`create/${this.tableName}`, JSON.stringify(data), {
            'Content-Type': 'application/json',
            Accept: 'application/json'
        })
        return response.json()
    }

    public async update(id: number, data: any) {
        const response = await this.client.post(`update/${this.tableName}/${id}`, JSON.stringify(data), {
            'Content-Type': 'application/json',
            Accept: 'application/json'
        })
        return response.json()
    }

    public async delete(id: number) {
        await this.client.delete(`delete/${this.tableName}/${id}`)
    }
}