import httpClient from "./httpClient";

export default class QueryBuilder {
    private client: httpClient
    private table: string
    private fields: string[] = []
    private filters: string[] = []
    private joins: string[] = []
    private order: string | null = null
    private limit: number = -1
    private isCount: boolean = false

    public constructor(client: httpClient, table: string, fields: string[]) {
        this.client = client
        this.table = table
        this.fields = fields
    }

    public top (limit: number) {
        this.limit = limit
        return this
    }

    public count (count: boolean = true) {
        this.isCount = count
        return this
    }

    public eq (field: string, value: string | number) {
        let filter = `${field} = `
        if (typeof value === 'number') {
            filter += value
        } else {
            filter += `'${value}'`
        }
        this.filters.push(filter)
        return this
    }

    public gt (field: string, value: number) {
        this.filters.push(`${field} > ${value}`)
        return this
    }

    public lt (field: string, value: number) {
        this.filters.push(`${field} < ${value}`)
        return this
    }

    public gte (field: string, value: number) {
        this.filters.push(`${field} >= ${value}`)
        return this
    }

    public lte (field: string, value: number) {
        this.filters.push(`${field} <= ${value}`)
        return this
    }

    public leftJoin (table: string, field: string, value: string) {
        this.joins.push(`LEFT JOIN ${table} ON ${this.table}.${field} = ${table}.${value}`)
        return this
    }

    public innerJoin (table: string, field: string, value: string) {
        this.joins.push(`INNER JOIN ${table} ON ${this.table}.${field} = ${table}.${value}`)
        return this
    }

    public orderBy(field: string, direction: 'ASC' | 'DESC' = 'ASC') {
        this.order = `${field} ${direction}`
        return this
    }

    private buildQuery() {
        const fields = this.fields.join(', ')

        let query = 'SELECT '
        if (this.isCount) {
            query += `COUNT (${fields})`
        } else {
            query += fields
        }
        query += ` FROM ${this.table}`

        if (this.limit > 0) {
            query += ` LIMIT ${this.limit}`
        }

        if (this.joins.length > 0) {
            query += ` ${this.joins.join(' ')}`
        }

        if (this.filters.length > 0) {
            query += ` WHERE ${this.filters.join(' AND ')}`
        }

        if (this.order) {
            query += ` ORDER BY ${this.order}`
        }
        
        return query
    }

    public async get(): Promise<any[]> {
        const query = this.buildQuery()
        const response = await this.client.post('query', query, {
            'Content-Type': 'text/plain',
            'Accept': 'application/json'
        })
        return response.json()
    }

    public async single() {
        const response = await this.get()
        if (response.length !== 1) {
            throw new Error(`Expected 1 result, got ${response.length}`)
        }
        return response[0]
    }
}