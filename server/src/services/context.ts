import { execute } from '../connection';
import { Context, ContextVariant } from '../types';
import * as ethers from 'ethers';

export async function getContexts(): Promise<Context[]> {
    const query = `
        select * from contexts order by views desc limit 100
    `;

    return execute(c => c.query(query).then(r => r.rows));
}

export async function getContext(id: string): Promise<Context> {
    return execute(async (client) => {
        const res = await client.query('SELECT * FROM contexts WHERE id = $1;', [id]);
        return res.rows[0];
    });
}

export async function getContextVariantsByContextId(contextId: string): Promise<ContextVariant[]> {
    return execute(async (client) => {
        const res = await client.query('SELECT * FROM context_variants WHERE context_id = $1;', [contextId]);
        return res.rows;
    });
}

export async function getContextVariant(id: string): Promise<ContextVariant> {
    return execute(async (client) => {
        const res = await client.query('SELECT * FROM context_variants WHERE id = $1;', [id]);
        return res.rows[0];
    });
}

export async function createContext(u: Context): Promise<Context> {
    return execute(async (client) => {
        const entries = Object.entries(u);
        const values = entries.map(x => x[1]);

        const fields = entries.map(x => x[0]).join(', '); // name, short_name, date_from, date_to
        const variables = entries.map((_, i) => '$' + (i + 1)).join(', '); // $1, $2, $3, $4
        const query = `INSERT INTO contexts(${fields}) VALUES (${variables}) RETURNING *;`;

        const res = await client.query(query, values);
        return res.rows[0];
    });
}

export async function createContextVariant(u: ContextVariant): Promise<ContextVariant> {
    return execute(async (client) => {
        const entries = Object.entries(u);
        const values = entries.map(x => x[1]);

        const fields = entries.map(x => x[0]).join(', '); // name, short_name, date_from, date_to
        const variables = entries.map((_, i) => '$' + (i + 1)).join(', '); // $1, $2, $3, $4
        const query = `INSERT INTO context_variants(${fields}) VALUES (${variables}) RETURNING *;`;

        const res = await client.query(query, values);
        return res.rows[0];
    });
}

export async function incrementContextViews(id: string): Promise<Context> {
    return execute(async (client) => {
        const query = `UPDATE contexts 
            SET views = views + 1
            WHERE id = $1
            RETURNING *;`;

        const values = [id];

        const res = await client.query(query, values);
        return res.rows[0];
    });
}

export async function incrementContextVariantViews(id: string): Promise<ContextVariant> {
    return execute(async (client) => {
        const query = `UPDATE context_variants
            SET views = views + 1
            WHERE id = $1
            RETURNING *;`;

        const values = [id];

        const res = await client.query(query, values);
        return res.rows[0];
    });
}

export async function registerContext(json: string): Promise<void> {
    const parsedContext = JSON.parse(json);
    const contextId = parsedContext.id;
    if (!contextId) throw new Error('No context id.');

    const contextVariantId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(json)).substring(2);

    if (!await getContext(contextId)) {
        await createContext({ id: contextId, views: 1 });
        await createContextVariant({ id: contextVariantId, context_id: contextId, json, views: 1 });
    } else if (!await getContextVariant(contextVariantId)) {
        await incrementContextViews(contextId);
        await createContextVariant({ id: contextVariantId, context_id: contextId, json, views: 1 });
    } else {
        await incrementContextViews(contextId);
        await incrementContextVariantViews(contextVariantId);
    }
}

export async function getContextVariants(): Promise<ContextVariant[]> {
    const query = `
        select * from context_variants order by views desc limit 100
    `;

    return execute(c => c.query(query).then(r => r.rows));
}