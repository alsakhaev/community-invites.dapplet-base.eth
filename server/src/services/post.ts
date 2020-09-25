import { execute } from '../connection';
import { Post } from '../types';

export async function getPosts(): Promise<Post[]> {
    return execute(async (client) => {
        const res = await client.query('SELECT * FROM posts;');
        return res.rows;
    });
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