import { execute } from '../connection';
import { Post } from '../types';

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

type PostWithInvitations = {
    post: {
        id: string;
        namespace: string;
        username: string;
        fullname: string;
        img: string;
        text: string;
    };
    conferences: {
        id: number;
        name: string;
        short_name: string;
        users: {
            namespace: string;
            username: string;
            fullname: string;
        }[];
    }[];
}

type PostWithTags = {
    id: string;
    namespace: string;
    username: string;
    fullname: string;
    img: string;
    text: string;
    tags: { id: string, name: string, value: boolean }[];
}

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
            JOIN conferences as c on c.id = i.conference_id
            WHERE i.post_id = p.id
                AND (c.date_to >= DATE(NOW() - INTERVAL '3 DAY'))
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
        WHERE c.date_to >= DATE(NOW() - INTERVAL '3 DAY')
            AND ((i.namespace_from = $1 AND i.username_from = $2)
            OR (i.namespace_to = $1 AND i.username_to = $2))
    `;

    return execute(c => c.query(query, params).then(r => r.rows));
}

export async function getStat(filters?: { username?: string, limit?: number }): Promise<any[]> {

    const query = {
        text: `
            SELECT *
            FROM (
                SELECT
                    p.*,
                    u.fullname,
                    u.img,

                    (
                        SELECT COUNT(*) 
                        FROM invitations AS i 
                        JOIN conferences AS c on c.id = i.conference_id 
                        WHERE i.post_id = p.id 
                            AND c.date_to >= DATE(NOW() - INTERVAL '3 DAY')
                    ) AS invitations_count,

                    (
                        SELECT COUNT(*) 
                        FROM (
                            SELECT conference_id 
                            FROM invitations AS i 
                            JOIN conferences AS c ON c.id = i.conference_id
                            WHERE i.post_id = p.id
                                AND c.date_to >= DATE(NOW() - INTERVAL '3 DAY')
                            GROUP BY i.conference_id
                        ) AS x
                    ) AS conferences_count

                FROM posts AS p
                LEFT JOIN users AS u ON u.namespace = p.namespace
                    AND u.username = p.username
                WHERE p.id IN (
                    select i.post_id
                    from invitations as i
                    join conferences as c on c.id = i.conference_id
                    where c.date_to >= DATE(NOW() - INTERVAL '3 DAY')
                )
                ${filters?.username ? 'AND p.username = $2' : ''}
            ) AS main
            ORDER BY main.invitations_count DESC
            LIMIT $1
        `,
        values: filters?.username ? [filters?.limit ?? 100, filters.username] : [filters?.limit ?? 100]
    };


    const data = await execute(c => c.query(query).then(r => r.rows));

    data.forEach(d => {
        d.invitations_count = parseInt(d.invitations_count);
        d.conferences_count = parseInt(d.conferences_count);
    });

    return data;
}

export async function getPostsWithInvitations(namespace: string, username: string): Promise<PostWithInvitations[]> {
    if (!namespace || !username) throw new Error('namespace and username are required');

    const params = [namespace, username];
    const query = `
        select 
            json_build_object(
                'id', p.id,
                'namespace', p.namespace,
                'username', p.username,
                'fullname', u.fullname,
                'img', u.img,
                'text', p.text
            ) as post,
            (
                select json_agg(json_build_object(
                    'id', c.id,
                    'name', c.name,
                    'short_name', c.short_name,
                    'users', (              
                        select json_agg(distinct iiii.*) 
                        from (
                            (
                                select 
                                    ii.namespace_from as namespace, 
                                    ii.username_from as username,
                                    uu.fullname as fullname
                                from invitations as ii 
                                join users as uu on uu.namespace = ii.namespace_from and uu.username = ii.username_from
                                join conferences as cc on cc.id = ii.conference_id
                                WHERE cc.date_to >= DATE(NOW() - INTERVAL '3 DAY')
                                    and ii.post_id = p.id
                                    and ((ii.namespace_from = $1 and ii.username_from = $2)
                                        or (ii.namespace_to = $1 and ii.username_to = $2))
                            )
                            UNION ALL
                            (
                                select 
                                    iii.namespace_to as namespace, 
                                    iii.username_to as username,
                                    uuu.fullname as fullname
                                from invitations as iii
                                join users as uuu on uuu.namespace = iii.namespace_to and uuu.username = iii.username_to
                                join conferences as ccc on ccc.id = iii.conference_id
                                WHERE ccc.date_to >= DATE(NOW() - INTERVAL '3 DAY')
                                    and iii.post_id = p.id
                                    and ((iii.namespace_from = $1 and iii.username_from = $2)
                                        or (iii.namespace_to = $1 and iii.username_to = $2))
                            )
                        ) as iiii
                    )
                ))
                from conferences as c 
                where c.id in (
                    select i.conference_id 
                    from invitations as i 
                    where i.post_id = p.id
                ) and c.date_to >= DATE(NOW() - INTERVAL '3 DAY')
            ) as conferences
        from posts as p
        join users as u on u.namespace = p.namespace and u.username = p.username
        where p.id in (
            select iiiii.post_id
            from invitations as iiiii
            join conferences as ccccc on ccccc.id = iiiii.conference_id
            where ccccc.date_to >= DATE(NOW() - INTERVAL '3 DAY')
                and ((iiiii.namespace_from = $1 and iiiii.username_from = $2)
                or (iiiii.namespace_to = $1 and iiiii.username_to = $2))
        )
    `;

    return execute(c => c.query(query, params).then(r => r.rows));
}

export async function getAllWithMyTags(namespace: string, username: string): Promise<PostWithTags[]> {

    const params = [namespace, username];
    const query = `
        SELECT
            p.id,
            p.text,
            u.namespace,
            u.username,
            u.fullname,
            u.img,
            COALESCE(json_agg(json_build_object(
            	'id', t.id,
              	'name', t.name,
              	'value', it.value
            )) FILTER (WHERE t.id IS NOT NULL), '[]') as tags
        FROM posts as p 
        JOIN users as u 
            on u.namespace = p.namespace
                and u.username = p.username
        LEFT JOIN itemtags as it 
            on it.item_id = p.id 
                and it.value = true 
                and it.namespace = $1 
                and it.username = $2
        LEFT JOIN tags as t on t.id = it.tag_id
        WHERE (
            SELECT COUNT(*)
            FROM invitations as i 
            JOIN conferences as c on c.id = i.conference_id
            WHERE i.post_id = p.id
                AND (c.date_to >= DATE(NOW() - INTERVAL '3 DAY'))
        ) <> 0
        GROUP BY p.id, u.namespace, u.username;
    `;

    return execute(c => c.query(query, params).then(r => r.rows));
}