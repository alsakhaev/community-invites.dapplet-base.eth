import { Profile } from "./dappletBus";

export type Conference = {
    id: number;
    name: string;
    date_from: Date;
    date_to: Date;
    location: string;
    locationUrl: string;
    website: string;
    description: string;
    short_name: string;
}

export type Post = {
    authorFullname: string;
    authorUsername: string;
    authorImg: string;
    id: string;
    text: string;
}

export type PostWithInvitations = {
    post: {
        id: string;
        namespace: string;
        username: string;
        fullname: string;
        img: string;
        text: string;
    };
    conferences: {
        id: number;
        name: string;
        short_name: string;
        users: {
            namespace: string;
            username: string;
            fullname: string;
        }[];
    }[];
}

export type ConferenceWithInvitations = { conference: Conference, invitations: { from: Profile, to: Profile, post_id: string }[], attendance_from: boolean, attendance_to?: boolean };

export type DetailedPost = Post & {
    conference_id: number;
    conference_short_name: string;
    conference_name: string;
    user_from_namespace: string;
    user_from_username: string;
    user_from_fullname: string;
    user_to_namespace: string;
    user_to_username: string;
    user_to_fullname: string;
}

export class Api {
    constructor(private _url: string) { }

    async getConferencesWithInvitations(from: Profile, to?: Profile): Promise<ConferenceWithInvitations[]> {
        const data = await this._sendRequest(`/conferences/invitations?namespace_from=${from.namespace}&username_from=${from.username}` + ((to) ? `&namespace_to=${to.namespace}&username_to=${to.username}` : ''));

        data.forEach((d: any) => d.conference.date_from = new Date(d.conference.date_from));
        data.forEach((d: any) => d.conference.date_to = new Date(d.conference.date_to));

        return data;
    }

    async getConference(id: number): Promise<Conference> {

        const conf = await this._sendRequest(`/conferences/${id}`);

        conf.date_from = new Date(conf.date_from);
        conf.date_to = new Date(conf.date_to);

        return conf;
    }

    async invite(userFrom: Profile, userTo: Profile, conferenceId: number, post: Post) {
        const postDto = {
            id: post.id,
            namespace: 'twitter.com',
            username: post.authorUsername,
            text: post.text
        }
        return await this._sendRequest('/conferences/invite', 'POST', { userFrom, userTo, conferenceId, post: postDto });
    }

    async withdraw(userFrom: Profile, userTo: Profile, conferenceId: number, post: Post) {
        await this._sendRequest('/conferences/withdraw', 'POST', { userFrom, userTo, conferenceId, post });
    }

    async attend(user: Profile, conferenceId: number) {
        return await this._sendRequest('/conferences/attend', 'POST', { user, conferenceId });
    }

    async absend(user: Profile, conferenceId: number) {
        await this._sendRequest('/conferences/absend', 'POST', { user, conferenceId });
    }

    // async getUser(namespace: string, username: string): Promise<Profile> {
    //     return await this._sendRequest(`/users/${namespace}/${username}`);
    // }

    // async updateUser(user: Profile): Promise<Profile> {
    //     return await this._sendRequest(`/users`, 'PUT', user);
    // }

    // async createUser(user: Profile): Promise<Profile> {
    //     return await this._sendRequest(`/users`, 'POST', user);
    // }

    // async getPosts(namespace: string, username: string): Promise<Post[]> {
    //     const data = await this._sendRequest(`/posts?namespace=${namespace}&username=${username}`);

    //     return data.map((x: any) => ({
    //         id: x.id,
    //         text: x.text,
    //         authorNamespace: x.namespace,
    //         authorUsername: x.username,
    //         authorFullname: x.fullname,
    //         authorImg: x.img
    //      }));
    // }

    async getMyDetailedPosts(namespace: string, username: string): Promise<DetailedPost[]> {
        const data = await this._sendRequest(`/posts/details?namespace=${namespace}&username=${username}`);
        return data.map((x: any) => ({
            id: x.id,
            text: x.text,
            authorNamespace: x.author_namespace,
            authorUsername: x.author_username,
            authorFullname: x.author_fullname,
            authorImg: x.author_img,
            ...x
        }));
    }

    async getInvitationPosts(namespace: string, username: string): Promise<PostWithInvitations[]> {
        return this._sendRequest(`/posts/invitations?namespace=${namespace}&username=${username}`);
    }

    private async _sendRequest(query: string, method: 'POST' | 'GET' | 'PUT' = 'GET', body?: any): Promise<any> {
        const init = body ? { body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' }, method } : { method };
        const resp = await fetch(this._url + query, init);
        const json = await resp.json();
        if (!json.success) throw Error(json.message);
        return json.data;
    }
}