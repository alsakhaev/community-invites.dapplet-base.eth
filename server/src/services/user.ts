import { execute } from '../connection';
import { Profile } from '../types';

export async function getUsers(): Promise<Profile[]> {
    return execute(async (client) => {
        const res = await client.query('SELECT * FROM users;');
        return res.rows;
    });
}

export async function getUser(namespace: string, username: string): Promise<Profile[]> {
    return execute(async (client) => {
        const res = await client.query('SELECT * FROM users WHERE namespace = $1 and username = $2;', [namespace, username]);
        return res.rows[0];
    });
}

export async function createUser(u: Profile): Promise<Profile> {
    if (!u.namespace || !u.username) throw new Error('namespace and username are required!');
    
    return execute(async (client) => {
        const entries = Object.entries(u);
        const values = entries.map(x => x[1]);

        const fields = entries.map(x => x[0]).join(', '); // name, short_name, date_from, date_to
        const variables = entries.map((_, i) => '$' + (i + 1)).join(', '); // $1, $2, $3, $4
        const query = `INSERT INTO users(${fields}) VALUES (${variables}) RETURNING *;`;

        const res = await client.query(query, values);
        return res.rows[0];
    });
}

export async function updateUser(u: Profile): Promise<Profile> {
    if (!u.namespace || !u.username) throw new Error('namespace and username are required!');

    return execute(async (client) => {
        const query = `UPDATE users 
            SET fullname = $3,
                img = $4,
                main_conference_id = $5
            WHERE namespace = $1
                AND username = $2
            RETURNING *;`;

        const values = [u.namespace, u.username, u.fullname, u.img, u.main_conference_id];

        const res = await client.query(query, values);
        return res.rows[0];
    });
}

export async function getBadge(namespace: string, username: string): Promise<{ id: number, short_name: string } | null> {
    const query = `
        SELECT
            c.id,
            c.short_name
        FROM users as u 
        LEFT JOIN conferences as c on c.id = u.main_conference_id
        WHERE u.namespace = $1 AND u.username = $2;
    `;
    const params = [namespace, username];

    const badge = await execute(c => c.query(query, params).then(r => r.rows[0]));

    if (!badge || !badge.id) return null;

    return badge;
}