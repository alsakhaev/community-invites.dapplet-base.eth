import { } from '@dapplets/dapplet-extension';
import ICON from './icons/eye.svg';

@Injectable
export default class Feature {

    constructor(
        @Inject("identity-adapter.dapplet-base.eth")
        public identityAdapter: any
    ) {
        const { button } = this.identityAdapter.exports;

        this.identityAdapter.attachConfig({
            POST: () => [
                button({
                    initial: "DEFAULT",
                    "DEFAULT": {
                        img: ICON,
                        init: async (ctx, me) => {
                            await this._registerContext(ctx);
                            await this._getViewsByContextId(ctx.id).then(x => me.label = x);
                        }
                    }
                })
            ]
        });
    }

    private async _getViewsByContextId(contextId: string): Promise<number> {
        const serverUrl = await Core.storage.get('serverUrl');
        const json = await fetch(`${serverUrl}/contexts/${contextId}`).then(x => x.json());
        
        if (!json.success || !json.data) {
            return 0;
        } else {
            return json.data.views;
        }
    }

    private async _registerContext(ctx: any): Promise<void> {
        const serverUrl = await Core.storage.get('serverUrl');
        const body = JSON.stringify(ctx);
        const json = await fetch(`${serverUrl}/contexts/create`, { method: 'POST', body }).then(x => x.json());
        
    }
}