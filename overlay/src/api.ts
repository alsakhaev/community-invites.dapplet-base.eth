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
            is_private: boolean;
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

export type MyInvitation = {
    id: number;
    is_private: boolean;
    created: Date;
    modified: Date;
    to_namespace: string;
    to_username: string;
    to_fullname: string;
    to_img: string;
    conference_id: number;
    conference_name: string;
    conference_short_name: string;
    post_id: string;
    post_text: string;
    author_namespace: string;
    author_username: string;
    author_fullname: string;
    author_img: string;
}

export type PostWithTags = {
    id: string;
    namespace: string;
    username: string;
    fullname: string;
    img: string;
    text: string;
    tags: { id: string, name: string, value: boolean }[];
}

export type Tag = {
    id: string;
    name: string;
}

export type UserSettings = {
    teamId?: string;
    teamName?: string;
}

export type Team = {
    id: string;
    name: string;
}

export class Api {
    public readonly controller = new AbortController();

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

    async invite(userFrom: Profile, userTo: Profile, conferenceId: number, post: Post, is_private: boolean) {
        const postDto = {
            id: post.id,
            namespace: 'twitter.com',
            username: post.authorUsername,
            text: post.text
        }
        return this._sendRequest('/invitations/invite', 'POST', { userFrom, userTo, conferenceId, post: postDto, is_private });
    }

    async withdraw(userFrom: Profile, userTo: Profile, conferenceId: number, post: Post) {
        return this._sendRequest('/invitations/withdraw', 'POST', { userFrom, userTo, conferenceId, post });
    }

    async setPrivate(id: number, is_private: boolean) {
        return this._sendRequest('/invitations/set-private', 'POST', { id, is_private });
    }

    async attend(user: Profile, conferenceId: number) {
        return this._sendRequest('/conferences/attend', 'POST', { user, conferenceId });
    }

    async absend(user: Profile, conferenceId: number) {
        return this._sendRequest('/conferences/absend', 'POST', { user, conferenceId });
    }

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

    async getMyInvitations(namespace: string, username: string): Promise<MyInvitation[]> {
        return this._sendRequest(`/invitations?namespace=${namespace}&username=${username}`);
    }

    async getAllTopicsWithMyTags(namespace: string, username: string, teamId?: string): Promise<PostWithTags[]> {
        return this._sendRequest((teamId) ? `/posts/my-tags?namespace=${namespace}&username=${username}&teamId=${teamId}` : `/posts/my-tags?namespace=${namespace}&username=${username}`);
    }

    async tag(item_id: string, tag_id: string, user: Profile, teamId?: string) {
        return this._sendRequest((teamId) ? `/tags/tag?teamId=${teamId}` : '/tags/tag', 'POST', { item_id, tag_id, user });
    }

    async untag(item_id: string, tag_id: string, user: Profile, teamId?: string) {
        return this._sendRequest((teamId) ? `/tags/untag?teamId=${teamId}` : '/tags/tag', 'POST', { item_id, tag_id, user });
    }

    async getTags(teamId?: string): Promise<Tag[]> {
        return this._sendRequest((teamId) ? `/tags?teamId=${teamId}` : '/tags');
    }

    async getUserSettings(namespace: string, username: string): Promise<UserSettings> {
        return this._sendRequest(`/users/settings?namespace=${namespace}&username=${username}`);
    }

    async setUserSettings(namespace: string, username: string, settings: UserSettings) {
        return this._sendRequest(`/users/settings?namespace=${namespace}&username=${username}`, 'POST', settings);
    }

    async getTeam(teamId: string): Promise<Team> {
        return this._sendRequest(`/users/teams?id=${teamId}`);
    }

    private async _sendRequest(query: string, method: 'POST' | 'GET' | 'PUT' = 'GET', body?: any): Promise<any> {
        const init = body ? { body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' }, method, signal: this.controller.signal } : { method, signal: this.controller.signal };
        const resp = await fetch(this._url + query, init);
        const json = await resp.json();
        if (!json.success) throw Error(json.message);
        return json.data;
    }
}