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
    private offset: number

    public constructor(client: httpClient, table: string, fields: string[]) {
        this.client = client
        this.table = table
        this.fields = fields

        this.offset = 0
    }

    public top (limit: number) {
        this.limit = limit
        return this
    }

    public range (offset: number, limit: number) {
        this.offset = offset
        this.limit = limit
        return this
    }

    public skip(offset: number) {
        this.offset = offset
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

    public leftJoin (table: string, field: string, value: string, onTable: string = this.table) {
        this.joins.push(`LEFT JOIN ${table} ON ${onTable}.${field} = ${table}.${value}`)
        return this
    }

    public innerJoin (table: string, field: string, value: string, onTable: string = this.table) {
        this.joins.push(`INNER JOIN ${table} ON ${onTable}.${field} = ${table}.${value}`)
        return this
    }

    public orderBy(field: string, direction: 'ASC' | 'DESC' = 'ASC') {
        this.order = `${field} ${direction}`
        return this
    }

    public in(field:string, query: QueryBuilder, not = false) {
        this.filters.push(`${field} ${not ? 'NOT' : ''} IN (${query.buildQuery()})`)
        return this
    }

    public search(value: string, ...fields: string[]) {
        if (fields.length < 1) { return this }
        const search = fields.map(field => `${field} CONTAINS '${value}'`)
        this.filters.push(`(${search.join(' OR ')})`)
        return this
    }

    private buildQuery() {
        const fields = this.fields.join(', ')

        let query = 'SELECT '

        if (this.limit > 0) {
            query += `TOP ${this.limit} `
        }

        if (this.offset > 0) {
            query += `START AT ${this.offset} `
        }

        if (this.isCount) {
            query += `COUNT (${fields})`
        } else {
            query += fields
        }
        query += ` FROM ${this.table}`

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

    public async get(): Promise<object[]> {
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