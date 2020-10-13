export type PostStat = {
    id: string;
    namespace: string;
    username: string;
    text: string;
    fullname: string;
    img: string;
    invitations_count: number;
    conferences_count: number;
}

export type UserStat = {
    namespace: string;
    username: string;
    fullname: string;
    img: string;
    main_conference_id?: number;
    invitations_to_count: number;
    invitations_from_count: number;
    attendance_count: number;
    users_to_count: number;
    confrences_to_count: number;
    posts_to_count: number;
}

export class Api {
    constructor(private _url: string) { }

    async getPostStat(filters?: { username?: string }): Promise<PostStat[]> {
        return this._sendRequest(`/posts/stat`, 'POST', filters);
    }

    async getUserStat(filters?: { excludePosts?: string[] }): Promise<UserStat[]> {
        return this._sendRequest(`/users/stat`, 'POST', filters);
    }

    private async _sendRequest(query: string, method: 'POST' | 'GET' | 'PUT' = 'GET', body?: any): Promise<any> {
        const init = body ? { body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' }, method } : { method };
        const resp = await fetch(this._url + query, init);
        const json = await resp.json();
        if (!json.success) throw Error(json.message);
        return json.data;
    }
}