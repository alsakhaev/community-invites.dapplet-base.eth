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