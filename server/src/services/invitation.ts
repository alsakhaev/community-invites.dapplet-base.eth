import { execute } from '../connection';
import { Conference, Post, Profile } from '../types';
import * as userService from './user';
import * as postService from './post';

type MyInvitation = {
    to_namespace: string;
    to_username: string;
    to_fullname: string;
    to_img: string;
    conference_id: string;
    conference_name: string;
    conference_short_name: string;
    post_id: string;
    post_text: string;
    author_namespace: string;
    author_username: string;
    author_fullname: string;
    author_img: string;
}

export async function getInvitations(namespace: string, username: string): Promise<MyInvitation[]> {
    const query = `
        SELECT DISTINCT
            u_to.namespace as to_namespace,
            u_to.username as to_username,
            u_to.fullname as to_fullname,
            u_to.img as to_img,
            i.conference_id,
            c.name as conference_name,
            c.short_name as conference_short_name,
            p.id as post_id,
            p.text as post_text,
            u_author.namespace as author_namespace,
            u_author.username as author_username,
            u_author.fullname as author_fullname,
            u_author.img as author_img
        FROM invitations as i
        JOIN posts as p ON p.id = i.post_id
        JOIN users as u_to ON u_to.namespace = i.namespace_to AND u_to.username = i.username_to
        JOIN users as u_author ON u_author.namespace = p.namespace AND u_author.username = p.username
        JOIN conferences as c ON c.id = i.conference_id
        WHERE i.namespace_from = $1
            AND i.username_from = $2
            AND c.date_to >= DATE(NOW() - INTERVAL '3 DAY')
    `;
    const params = [namespace, username];
    return execute(c => c.query(query, params).then(x => x.rows));
}