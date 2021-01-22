import React from 'react';
import { Segment, Comment, Input, InputOnChangeData, Loader, Placeholder } from 'semantic-ui-react';
import { Api, MyInvitation, PostWithInvitations } from '../api';
import { Post, Profile, Settings } from '../dappletBus';
import { AggInvitationCard } from '../components/AggInvitationCard';
import { MyDiscussions } from './MyDiscussions';
import { NewInvite } from './NewInvite';

interface IProps {
    defaultSearch: string;
    settings: Settings;
    profile: Profile;
    post?: Post;
}

interface IState {
    isNewInviteOpened: boolean;
    loading: boolean;
    currentTab: Tabs;
    data: (MyInvitation & { loading: boolean })[];
    highlightedPostId: string | null;
    defaultConferenceId: number | null;
    post?: Post;
}

enum Tabs {
    No,
    AllInvites,
    NewInvite,
    EditInvite
}

export class DiscussionTab extends React.Component<IProps, IState> {

    private _api: Api;

    constructor(props: any) {
        super(props);
        this._api = new Api(this.props.settings.serverUrl);
        this.state = {
            isNewInviteOpened: true,
            data: [],
            loading: true,
            currentTab: Tabs.No,
            highlightedPostId: null,
            defaultConferenceId: null,
            post: props.post
        };
    }

    async componentDidMount() {
        try {
            await this.loadData(true);
        } catch (err) {
            if (err.name !== 'AbortError') console.error(err);
        }
    }

    async loadData(firstLoading: boolean = false) {
        const p = this.props;

        this.setState({ loading: true });

        const data = await this._api.getMyInvitations(this.props.profile.namespace, this.props.profile.username);
        this.setState({
            data: data.map(x => ({ ...x, loading: false })),
            loading: false,
            currentTab: (!p.post || p.post.authorUsername === this.props.profile.username || !firstLoading) ? Tabs.AllInvites : Tabs.NewInvite
        });
    }

    async withdraw2(invitationId: number) {
        const data = this.state.data;
        const inv = data.find(x => x.id === invitationId)!;
        inv.loading = true;
        this.setState({ data });

        const profileTo = {
            username: inv.author_username.toLowerCase(),
            fullname: inv.author_fullname,
            img: inv.author_img,
            namespace: 'twitter.com'
        };
        const post: Post = {
            authorFullname: profileTo.fullname,
            authorUsername: profileTo.username,
            authorImg: profileTo.img,
            id: inv.post_id,
            text: inv.post_text
        }
        await this._api.withdraw(this.props.profile!, profileTo, inv.conference_id, post);

        this.setState({ data: this.state.data.filter(x => x !== inv) });
    }

    async onInvitedHandler(highlightedPostId: string | null) {
        this.setState({ currentTab: Tabs.AllInvites, highlightedPostId });
        await this.loadData();
        setTimeout(() => this.setState({ highlightedPostId: null }), 3000);
    }

    _onEdit(post: Post, user: Profile, conferenceId: number) {
        this.setState({
            post: post,
            defaultConferenceId: conferenceId,
            currentTab: Tabs.NewInvite
        })
    }

    render() {
        const p = this.props,
            s = this.state;

        if (s.loading) return <Placeholder>
            <Placeholder.Line />
            <Placeholder.Line />
            <Placeholder.Line />
            <Placeholder.Line />
            <Placeholder.Line />
        </Placeholder>;

        if (s.currentTab === Tabs.AllInvites) {
            return <MyDiscussions highlightedPostId={s.highlightedPostId} profile={p.profile} defaultSearch={p.defaultSearch} settings={p.settings!} onEdit={this._onEdit.bind(this)} />;
        }

        if (s.currentTab === Tabs.NewInvite) {
            return <NewInvite loading={s.loading} defaultConferenceId={s.defaultConferenceId} settings={p.settings} profile={p.profile} post={s.post!} onInvited={() => this.onInvitedHandler(s.post?.id ?? null)} onCancel={() => this.setState({ currentTab: Tabs.AllInvites })} onWithdraw={(x) => this.withdraw2(x)} />;
        }
    }
}
