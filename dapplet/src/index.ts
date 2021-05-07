import { } from '@dapplets/dapplet-extension';
import ICON from './icons/icon.png';

type BadgeInfo = {
    short_name: string | null;
};

@Injectable
export default class Feature {
    private _overlay;
    private _queue = new Map<string, Promise<BadgeInfo[]>>();

    constructor(
        @Inject("identity-adapter.dapplet-base.eth")
        public identityAdapter: any, // ITwitterAdapter;

        @Inject("common-adapter.dapplet-base.eth")
        public viewportAdapter: any
    ) {
        Core.onAction(() => this._openOverlay(this.identityAdapter.getCurrentUser()));
        Core.onHome(() => window.open('https://community-invite-dashboard.herokuapp.com', '_blank'));
 
        const { button, caption } = this.identityAdapter.exports;

        this.identityAdapter.attachConfig({
            POST_SOUTH: [
                button({
                    initial: "DEFAULT",
                    "DEFAULT": {
                        img: ICON,
                        exec: (post) => this._openOverlay(this.identityAdapter.getCurrentUser(), post)
                    }
                })
            ],
            POST_SOCIAL_CONTEXT: [
                caption({
                    initial: "DEFAULT",
                    "DEFAULT": {
                        hidden: true,
                        init: async (ctx, me) => {
                            const confs = await this._getUserAttendance('twitter.com', ctx.authorUsername);
                            if (confs && confs.length > 0) {
                                me.setState("LABEL");

                                if (confs.length === 1) {
                                    me.text = `Attends ${confs[0].short_name}`;
                                } else if (confs.length === 2) {
                                    me.text = `Attends ${confs[0].short_name} and ${confs[1].short_name}`;
                                } else if (confs.length === 3) {
                                    me.text = `Attends ${confs[0].short_name}, ${confs[1].short_name}, and 1 other event`;
                                } else if (confs.length > 3) {
                                    me.text = `Attends ${confs[0].short_name}, ${confs[1].short_name}, and ${confs.length - 2} others events`;
                                }
                            }
                        }
                    },
                    "LABEL": {
                        text: '',
                        exec: (post) => this._openOverlay(this.identityAdapter.getCurrentUser(), post),
                        img: ICON
                    }
                })
            ]
        });
    }

    private async _openOverlay(profile: any, post?: any) {
        if (!this._overlay) {
            this._overlay = Core.overlay({ name: 'community-invite-overlay', title: 'Community Invite' });
        }

        const serverUrl = await Core.storage.get('serverUrl');
        if (profile) profile.namespace = 'twitter.com';
        this._overlay.sendAndListen('data', { profile, post, settings: { serverUrl } }, {

        });
    }

    private async _getUserAttendance(namespace: string, username: string): Promise<BadgeInfo[]> {
        const key = `${namespace}/${username}`;

        if (!this._queue.has(key)) {
            this._queue.set(key, this._fetchBadge(namespace, username));
        }

        return this._queue.get(key);
    }

    private async _fetchBadge(namespace: string, username: string): Promise<BadgeInfo[]> {
        const serverUrl = await Core.storage.get('serverUrl');
        const json = await fetch(`${serverUrl}/users/attendance/${namespace}/${username}`).then(x => x.json());
        
        if (!json.success) {
            console.error(json.message);
            return null;
        }

        return json.data;
    }
}