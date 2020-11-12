export type PostStat = {
    id: string;
    namespace: string;
    username: string;
    text: string;
    fullname: string;
    img: string;
    invitations_count: number;
    conferences_count: number;
    discussed_by: number;
    team_rating: number | undefined;
}

export type UserStat = {
    namespace: string;
    username: string;
    fullname: string;
    img: string;
    main_conference_id?: number;
    invitations_to_count: number;
    agg_invitations_to_count: number;
    invitations_from_count: number;
    attendance_count: number;
    users_to_count: number;
    confrences_to_count: number;
    posts_to_count: number;
}

export type Team = {
    id: string;
    name: string;
}

export type Conference = {
    id?: number;
    short_name: string;
    name: string;
    description: string;
    date_from: string;
    date_to: string;
}

export class Api {
    constructor(private _url: string) { }

    async getPostStat(filters?: { username?: string, limit?: number, teamId?: string }): Promise<PostStat[]> {
        return this._sendRequest(`/posts/stat`, 'POST', filters);
    }

    async getUserStat(filters?: { excludePosts?: string[], limit?: number, teamId?: string }): Promise<UserStat[]> {
        return this._sendRequest(`/users/stat`, 'POST', filters);
    }

    async getTeam(teamId: string): Promise<Team> {
        return this._sendRequest(`/users/teams?id=${teamId}`);
    }

    async createTeam(data: { name: string, tags: { name: string }[] }): Promise<Team> {
        return this._sendRequest(`/teams/create`, 'POST', data);
    }

    async createConference(c: Conference): Promise<Conference> {
        return this._sendRequest(`/conferences`, 'POST', c);
    }

    private async _sendRequest(query: string, method: 'POST' | 'GET' | 'PUT' = 'GET', body?: any): Promise<any> {
        const init = body ? { body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' }, method } : { method };
        const resp = await fetch(this._url + query, init);
        const json = await resp.json();
        if (!json.success) throw Error(json.message);
        return json.data;
    }
}