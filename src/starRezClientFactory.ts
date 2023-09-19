import { AuthenticationHeader, basicAuthentication, bearerToken } from "./authentication";
import starRezClient from "./starRezClient";

export default class StarRezClientFactory {
    private domain: string
    private credentials: AuthenticationHeader | null = null

    public constructor(domain?: string) {
        this.domain = domain ?? ''
    }

    public addBasicAuthentication(username: string, password: string) {
        this.credentials = new basicAuthentication(username, password)
        return this
    }

    public addBearerToken(token: string) {
        this.credentials = new bearerToken(token)
        return this
    }

    public setDomain(domain: string) {
        this.domain = domain
        return this
    }

    public build() {
        if (!this.credentials) {
            throw new Error('No authentication credentials provided')
        }
        return new starRezClient(this.domain, this.credentials)
    }
}