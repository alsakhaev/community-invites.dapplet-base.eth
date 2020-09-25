import { Client } from 'pg';

export async function getTables(): Promise<any> {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });

    client.connect();

    const res = await client.query('SELECT * FROM users;');
    
    client.end();

    return res.rows;
}