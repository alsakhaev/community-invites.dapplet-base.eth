export type Post = {
    id: string;
    username: string;
    text: string;
}

export type Conference = {
    id?: number;
    short_name: string;
    name: string;
    description: string;
    date_from: string;
    date_to: string;
}

export type User = {
    namespace: string;
    username: string;
    fullname: string;
    avatar: string;
}

export type Invitation = {
    username_from: string;
    username_to: string;
    conference_id: string;
    post_id: string;
}

export type Attendance = {
    conference_id: string;
    username: string;
}