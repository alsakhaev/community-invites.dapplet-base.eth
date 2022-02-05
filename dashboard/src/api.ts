export type ContextVariant = {
    id: string;
    context_id: string;
    json: string;
    views: number;
    parsed: any;
}

export class Api {
    constructor(private _url: string) { }

    async getContextVariants(): Promise<ContextVariant[]> {
        const data = await this._sendRequest(`/variants`, 'GET');
        return data.map((x: any) => ({
            ...x,
            parsed: JSON.parse(x.json)
        }));
    }

    private async _sendRequest(query: string, method: 'POST' | 'GET' | 'PUT' = 'GET', body?: any): Promise<any> {
        const init = body ? { body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' }, method } : { method };
        const resp = await fetch(this._url + query, init);
        const json = await resp.json();
        if (!json.success) throw Error(json.message);
        return json.data;
    }
}