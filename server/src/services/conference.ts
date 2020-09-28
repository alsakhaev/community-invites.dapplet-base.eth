import { execute } from '../connection';
import { Conference, Post, Profile } from '../types';
import * as userService from './user';
import * as postService from './post';
import bodyParser from 'body-parser';

export async function getConferences(): Promise<Conference[]> {
    return execute(async (client) => {
        const res = await client.query('SELECT * FROM conferences;');
        return res.rows;
    });
}

export async function getConference(id: number): Promise<Conference[]> {
    return execute(async (client) => {
        const res = await client.query('SELECT * FROM conferences WHERE id = $1;', [id]);
        return res.rows[0];
    });
}

export async function createConference(c: Conference): Promise<Conference> {
    return execute(async (client) => {
        const entries = Object.entries(c);
        const values = entries.map(x => x[1]);

        const fields = entries.map(x => x[0]).join(', '); // name, short_name, date_from, date_to
        const variables = entries.map((_, i) => '$' + (i + 1)).join(', '); // $1, $2, $3, $4
        const query = `INSERT INTO conferences(${fields}) VALUES (${variables}) RETURNING *;`;

        const res = await client.query(query, values);
        return res.rows[0];
    });
}

export async function getConferencesWithInvitations(namespace_from: string, username_from: string, namespace_to: string, username_to: string): Promise<{ conference: Conference, invitations: { from: Profile, to: Profile, post_id: string }[], attendance_from: boolean, attendance_to: boolean }[]> {
    return execute(async (client) => {
        const res = await client.query(`
            SELECT
                row_to_json(c.*) as conference,
                COALESCE(json_agg(json_build_object(
                    'from', u_from.*,
                    'to', u_to.*,
                    'post_id', i.post_id
                )) FILTER (WHERE i.post_id IS NOT NULL), '[]') as invitations,
                (CASE WHEN (SELECT TRUE FROM attendance as a where c.id = a.conference_id and a.namespace = $1 and a.username = $2 LIMIT 1) IS NULL THEN FALSE ELSE TRUE END) AS attendance_from,
                (CASE WHEN (SELECT TRUE FROM attendance as a where c.id = a.conference_id and a.namespace = $3 and a.username = $4 LIMIT 1) IS NULL THEN FALSE ELSE TRUE END) AS attendance_to
            FROM conferences as c
            LEFT JOIN invitations as i on c.id = i.conference_id
            LEFT JOIN users as u_from on u_from.namespace = i.namespace_from and u_from.username = i.username_from
            LEFT JOIN users as u_to on u_to.namespace = i.namespace_to and u_to.username = i.username_to
            WHERE (i is NULL or (i.namespace_from = $1 OR i.namespace_to = $1)
                AND (i.username_from = $2 OR i.username_to = $2))
            GROUP BY c.id`, [namespace_from, username_from, namespace_to, username_to]);

        return res.rows;
    });
}


export async function invite(userFrom: Profile, userTo: Profile, conferenceId: number, post: Post): Promise<void> {
    return execute(async (client) => {
        if (!await userService.getUser(userFrom.namespace, userFrom.username)) {
            await userService.createUser(userFrom);
        }

        if (!await userService.getUser(userTo.namespace, userTo.username)) {
            await userService.createUser(userTo);
        }

        if (!await postService.getPost(post.id)) {
            await postService.createPost(post);
        }

        const values = [userFrom.namespace, userTo.namespace, userFrom.username, userTo.username, conferenceId, post.id]
        const query = `INSERT INTO invitations(
            namespace_from, namespace_to, username_from, username_to, conference_id, post_id
        ) VALUES ($1, $2, $3, $4, $5, $6);`;

        await client.query(query, values);
    });
}

export async function withdraw(userFrom: Profile, userTo: Profile, conferenceId: number, post: Post): Promise<void> {
    return execute(async (client) => {
        if (!await userService.getUser(userFrom.namespace, userFrom.username)) {
            await userService.createUser(userFrom);
        }

        if (!await userService.getUser(userTo.namespace, userTo.username)) {
            await userService.createUser(userTo);
        }

        if (!await postService.getPost(post.id)) {
            await postService.createPost(post);
        }

        const values = [userFrom.namespace, userTo.namespace, userFrom.username, userTo.username, conferenceId, post.id]
        const query = `DELETE FROM invitations WHERE 
            namespace_from = $1
            AND namespace_to = $2
            AND username_from = $3
            AND username_to = $4
            AND conference_id = $5
            AND post_id = $6;`;

        await client.query(query, values);
    });
}


export async function attend(user: Profile, conferenceId: number): Promise<void> {
    return execute(async (client) => {
        if (!await userService.getUser(user.namespace, user.username)) {
            await userService.createUser(user);
        }

        const values = [user.namespace, user.username, conferenceId];
        const query = `INSERT INTO attendance(
            namespace, username, conference_id
        ) VALUES ($1, $2, $3);`;

        await client.query(query, values);
    });
}

export async function absend(user: Profile, conferenceId: number): Promise<void> {
    return execute(async (client) => {
        if (!await userService.getUser(user.namespace, user.username)) {
            await userService.createUser(user);
        }

        const values = [user.namespace, user.username, conferenceId];
        const query = `DELETE FROM attendance WHERE 
            namespace = $1
            and username = $2
            and conference_id = $3`;

        await client.query(query, values);
    });
}