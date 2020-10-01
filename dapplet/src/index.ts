import { } from '@dapplets/dapplet-extension';
import ICON from './icons/icon.png';

type BadgeInfo = { 
    id: string, 
    short_name: string 
} | null;

@Injectable
export default class Feature {
    private _overlay;
    private _queue = new Map<string, Promise<BadgeInfo>>();

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
                        hidden: true,
                        init: async (ctx, me) => {
                            const info = await this._getBadge('twitter.com', ctx.authorUsername);
                            if (info) {
                                me.setState("BADGE");
                                me.text = info.short_name;
                            }
                        }
                    },
                    "BADGE": {
                        text: '',
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

    private async _getBadge(namespace: string, username: string): Promise<BadgeInfo> {
        const key = `${namespace}/${username}`;

        if (!this._queue.has(key)) {
            this._queue.set(key, this._fetchBadge(namespace, username));
        }

        return this._queue.get(key);
    }

    private async _fetchBadge(namespace: string, username: string): Promise<BadgeInfo> {
        const serverUrl = await Core.storage.get('serverUrl');
        const json = await fetch(`${serverUrl}/users/badge/${namespace}/${username}`).then(x => x.json());
        
        if (!json.success) {
            console.error(json.message);
            return null;
        }

        return json.data;
    }
}