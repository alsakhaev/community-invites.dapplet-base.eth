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
        const profile = {
            username: 'alsakhaev',
            fullname: 'Alexander Sakhaev',
            img: 'https://abs.twimg.com/sticky/default_profile_images/default_profile_200x200.png'
        };

        Core.onAction(() => this._openOverlay(profile));

        const wallet = Core.wallet();

        const { statusLine } = viewportAdapter.exports;
        const { label, button } = this.identityAdapter.exports;

        this.identityAdapter.attachConfig({
            POST_USERNAME_LABEL: [
                label({
                    initial: "DEFAULT",
                    "DEFAULT": {
                        text: 'Devcon 2020 (+1)',
                        exec: (post) => this._openOverlay(profile, post),
                        img: ICON
                    }
                })
            ]
        })
    }

    private async _openOverlay(profile: any, post?: any) {
        if (!this._overlay) {
            const url = await Core.storage.get('overlayUrl');
            this._overlay = Core.overlay({ url, title: 'Community Invite' });
        }

        const contractAddress = await Core.storage.get('contractAddress');
        const oracleAddress = await Core.storage.get('oracleAddress');
        this._overlay.sendAndListen('data', { profile, post, settings: { contractAddress, oracleAddress } }, {

        });
    }
}