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