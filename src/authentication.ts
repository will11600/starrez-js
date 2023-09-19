export interface AuthenticationHeader {
    getAuthHeader: () => string
}

export class bearerToken implements AuthenticationHeader {
    public token: string

    public getAuthHeader() {
        return `Bearer ${this.token}`
    }

    public constructor(token: string) {
        this.token = token
    }
}

export class basicAuthentication implements AuthenticationHeader {
    public username: string
    public password: string

    public getAuthHeader() {
        const usernamePassword = `${this.username}:${this.password}`
        return `Basic ${btoa(usernamePassword)}`
    }

    public constructor(username: string, password: string) {
        this.username = username
        this.password = password
    }
}