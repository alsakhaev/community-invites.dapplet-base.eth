import { } from '@dapplets/dapplet-extension';
import ICON from './icons/icon.png';

@Injectable
export default class Feature {
    private _overlay;

    constructor(
        @Inject("identity-adapter.dapplet-base.eth")
        public identityAdapter: any, // ITwitterAdapter;

        @Inject("common-adapter.dapplet-base.eth")
        public viewportAdapter: any
    ) {
        const wallet = Core.wallet();
        Core.storage.get('overlayUrl').then(url => this._overlay = Core.overlay({ url, title: 'Community Invite' }));

        const { statusLine } = viewportAdapter.exports;
        const { label, button } = this.identityAdapter.exports;

        this.identityAdapter.attachConfig({
            POST_USERNAME_LABEL: [
                label({
                    initial: "DEFAULT",
                    "DEFAULT": {
                        text: 'Devcon 2020 (+1)',
                        exec: async (ctx) => {
                            const contractAddress = await Core.storage.get('contractAddress');
                            const oracleAddress = await Core.storage.get('oracleAddress');
                            this._overlay.sendAndListen('profile_select', { ...ctx, contractAddress, oracleAddress }, { 

                            });
                        },
                        img: ICON
                    }
                })
            ]
        })
    }
}