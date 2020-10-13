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

export async function getBadge(namespace: string, username: string): Promise<{ namespace: string, username: string, main_conference_id: number | null, main_conference_short_name: string | null, conferences_count: number } | null> {
    const query = `
        SELECT
            u.namespace,
            u.username,
            c.id as main_conference_id,
            c.short_name as main_conference_short_name,
            (select count(*) from (select a.conference_id from attendance as a where a.namespace = $1 and a.username = $2 group by a.conference_id) as x) as conferences_count
        FROM users as u 
        LEFT JOIN conferences as c on c.id = u.main_conference_id
        WHERE u.namespace = $1 AND u.username = $2;
    `;
    const params = [namespace, username];

    const badge = await execute(c => c.query(query, params).then(r => r.rows[0]));

    if (!badge) return null;

    badge.conferences_count = parseInt(badge.conferences_count);

    return badge;
}

export async function getStat(filters?: { excludePosts?: string[] }): Promise<any[]> {
    const isFilter = filters?.excludePosts && filters?.excludePosts.length > 0;

    const params = isFilter ? [filters!.excludePosts] : undefined;

    const data = await execute(async (client) => {
        const res = await client.query(`
            SELECT
                u.*,
                
                (SELECT COUNT(*) 
                FROM invitations AS i 
                WHERE i.namespace_to = u.namespace
                    AND i.username_to = u.username
                    ${isFilter ? 'AND NOT (i.post_id = ANY ($1))' : ''}
                ) AS invitations_to_count,
                    
                (SELECT COUNT(*) 
                FROM invitations AS i 
                WHERE i.namespace_from = u.namespace
                    AND i.username_from = u.username
                    ${isFilter ? 'AND NOT (i.post_id = ANY ($1))' : ''}
                ) AS invitations_from_count,
                    
                (SELECT COUNT(*)
                FROM attendance AS a
                WHERE a.namespace = u.namespace
                    AND a.username = u.username) AS attendance_count,
                    
                (SELECT COUNT(*)
                FROM (
                    SELECT i.namespace_from, i.username_from
                    FROM invitations AS i
                    WHERE i.namespace_to = u.namespace
                        AND i.username_to = u.username
                        ${isFilter ? 'AND NOT (i.post_id = ANY ($1))' : ''}
                    GROUP BY i.namespace_from, i.username_from
                ) AS x) AS users_to_count,
                    
                (SELECT COUNT(*)
                FROM (
                    SELECT i.conference_id
                    FROM invitations AS i
                    WHERE i.namespace_to = u.namespace
                        AND i.username_to = u.username
                        ${isFilter ? 'AND NOT (i.post_id = ANY ($1))' : ''}
                    GROUP BY i.conference_id
                ) AS x) AS confrences_to_count,
                    
                (SELECT COUNT(*)
                FROM (
                    SELECT i.post_id
                    FROM invitations AS i
                    WHERE i.namespace_to = u.namespace
                        AND i.username_to = u.username
                        ${isFilter ? 'AND NOT (i.post_id = ANY ($1))' : ''}
                    GROUP BY i.post_id
                ) AS x) AS posts_to_count
            
            FROM users AS u
        `, params);
        return res.rows;
    });

    data.forEach(d => {
        d.invitations_to_count = parseInt(d.invitations_to_count);
        d.invitations_from_count = parseInt(d.invitations_from_count);
        d.attendance_count = parseInt(d.attendance_count);
        d.users_to_count = parseInt(d.users_to_count);
        d.confrences_to_count = parseInt(d.confrences_to_count);
        d.posts_to_count = parseInt(d.posts_to_count);
    });

    return data;
}
