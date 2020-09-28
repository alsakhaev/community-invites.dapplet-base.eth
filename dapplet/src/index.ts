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
        Core.onAction(() => this._openOverlay(this.identityAdapter.getCurrentUser()));

        const wallet = Core.wallet();

        const { statusLine } = viewportAdapter.exports;
        const { label, button } = this.identityAdapter.exports;

        this.identityAdapter.attachConfig({
            POST_USERNAME_LABEL: [
                label({
                    initial: "DEFAULT",
                    "DEFAULT": {
                        text: 'Devcon 2020 (+1)',
                        exec: (post) => this._openOverlay(this.identityAdapter.getCurrentUser(), post),
                        img: ICON
                    }
                })
            ],
            POST_SOUTH: [
                button({
                    initial: "DEFAULT",
                    "DEFAULT": {
                        img: ICON,
                        exec: (post) => this._openOverlay(this.identityAdapter.getCurrentUser(), post)
                    }
                })
            ]
        });
    }

    private async _openOverlay(profile: any, post?: any) {
        if (!this._overlay) {
            const url = await Core.storage.get('overlayUrl');
            this._overlay = Core.overlay({ url, title: 'Community Invite' });
        }

        const serverUrl = await Core.storage.get('serverUrl');
        profile.namespace = 'twitter.com';
        this._overlay.sendAndListen('data', { profile, post, settings: { serverUrl } }, {

        });
    }
}