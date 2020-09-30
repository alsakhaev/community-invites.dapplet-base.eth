import { execute } from '../connection';
import { Post } from '../types';

export async function getPosts(namespace?: string, username?: string): Promise<Post[]> {
    if (!namespace !== !username) throw new Error('namespace and username are required');

    const isFilter = namespace && username;
    const params = (isFilter) ? [namespace, username] : undefined;
    const query = `
        SELECT
            p.id,
            p.text,
            u.namespace,
            u.username,
            u.fullname,
            u.img,
            u.main_conference_id
        FROM posts as p 
        JOIN users as u on u.namespace = p.namespace
            AND u.username = p.username
        ${isFilter ? `WHERE (
            SELECT COUNT(*)
            FROM invitations as i 
            WHERE i.post_id = p.id
                AND ((i.namespace_from = $1 AND i.username_from = $2)
                    OR (i.namespace_to = $1 AND i.username_to = $2))
        ) <> 0`: ''}
    `;

    return execute(c => c.query(query, params).then(r => r.rows));
}

export async function getPost(id: string): Promise<Post[]> {
    return execute(async (client) => {
        const res = await client.query('SELECT * FROM posts WHERE id = $1;', [id]);
        return res.rows[0];
    });
}

export async function createPost(u: Post): Promise<Post> {
    return execute(async (client) => {
        const entries = Object.entries(u);
        const values = entries.map(x => x[1]);

        const fields = entries.map(x => x[0]).join(', '); // name, short_name, date_from, date_to
        const variables = entries.map((_, i) => '$' + (i + 1)).join(', '); // $1, $2, $3, $4
        const query = `INSERT INTO posts(${fields}) VALUES (${variables}) RETURNING *;`;

        const res = await client.query(query, values);
        return res.rows[0];
    });
}

type DetailedPost = {
    id: string;
    text: string;
    author_namespace: string;
    author_username: string;
    author_img: string;
    conference_id: number;
    conference_name: string;
    conference_short_name: string;
    user_from_namespace: string;
    user_from_username: string;
    user_from_fullname: string;
    user_to_namespace: string;
    user_to_username: string;
    user_to_fullname: string;
}

export async function getMyDetailedPosts(namespace: string, username: string): Promise<DetailedPost[]> {
    if (!namespace || !username) throw new Error('namespace and username are required');

    const params = [namespace, username];
    const query = `
        SELECT
            p.id,
            p.text,
            u_author.namespace AS author_namespace,
            u_author.username AS author_username,
            u_author.fullname AS author_fullname,
            u_author.img AS author_img,
            c.id AS conference_id,
            c.name AS conference_name,
            c.short_name AS conference_short_name,
            u_from.namespace AS user_from_namespace,
            u_from.username AS user_from_username,
            u_from.fullname AS user_from_fullname,
            u_to.namespace AS user_to_namespace,
            u_to.username AS user_to_username,
            u_to.fullname AS user_to_fullname
        FROM invitations AS i
        LEFT JOIN posts AS p ON p.id = i.post_id
        LEFT JOIN conferences AS c ON c.id = i.conference_id
        LEFT JOIN users AS u_author ON u_author.namespace = p.namespace AND u_author.username = p.username
        LEFT JOIN users AS u_from ON u_from.namespace = i.namespace_from AND u_from.username = i.username_from
        LEFT JOIN users AS u_to ON u_to.namespace = i.namespace_to AND u_to.username = i.username_to
        WHERE (i.namespace_from = $1 AND i.username_from = $2)
            OR (i.namespace_to = $1 AND i.username_to = $2)
    `;

    return execute(c => c.query(query, params).then(r => r.rows));
}