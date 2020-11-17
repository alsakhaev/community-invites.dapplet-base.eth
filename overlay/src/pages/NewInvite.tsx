import React from 'react';
import { Button, Divider, Icon, Dropdown, Segment, Checkbox, Placeholder, Popup, Message, Label } from 'semantic-ui-react';
import { Post, Profile, Settings } from '../dappletBus';
import { PostCard } from '../components/PostCard';
import { Api, ConferenceWithInvitations } from '../api';
import { ProfileCard } from '../components/ProfileCard'
import Linkify from 'react-linkify';
import { ConferencesDropdown } from '../components/ConferencesDropdown';

interface IProps {
    post: Post;
    profile: Profile;
    settings: Settings;
    onInvited: (id: number) => void;
    loading: boolean;
    onCancel: () => void;
    onWithdraw: (id: number) => Promise<void>;
}

interface IState {
    data: ConferenceWithInvitations[];
    profileTo: Profile;
    selectedConferenceId: number;
    loading: boolean;
    isInvitingLoading: boolean;
    isPrivate: boolean;
    error: string | null;
    isModified: boolean;
}

export class NewInvite extends React.Component<IProps, IState> {
    private _api: Api;

    constructor(props: IProps) {
        super(props);

        const { settings, post } = this.props;

        this._api = new Api(settings.serverUrl);
        this.state = {
            data: [],
            profileTo: {
                username: post.authorUsername.toLowerCase(),
                fullname: post.authorFullname,
                img: post.authorImg,
                namespace: 'twitter.com'
            },
            selectedConferenceId: -1,
            loading: true,
            isInvitingLoading: false,
            isPrivate: false,
            error: null,
            isModified: false
        }
    }

    setState<K extends keyof IState>(
        state: ((prevState: Readonly<IState>, props: Readonly<IProps>) => (Pick<IState, K> | IState | null)) | (Pick<IState, K> | IState | null),
        callback?: () => void
    ): void {
        if ((state as IState).error === undefined) (state as IState).error = null;
        super.setState(state, callback);
    }

    async componentDidMount() {
        try {
            await this.loadConferences();
            this.setState({ loading: false });
        } catch (err) {
            if (err.name !== 'AbortError') console.error(err);
        }
    }

    async componentWillUnmount() {
        this._api.controller.abort();
    }

    async loadConferences() {
        const data = await this._api.getConferencesWithInvitations(this.props.profile!, this.state.profileTo);
        const filteredByPosts: ConferenceWithInvitations[] = data.map(x => ({
            conference: x.conference,
            attendance_from: x.attendance_from,
            attendance_to: x.attendance_to,
            invitations: x.invitations,
            attendies: x.attendies
        }))
        this.setState({ data: filteredByPosts });
        this.changeConference(data[0]?.conference.id ?? -1);
    }

    async invite() {
        const s = this.state;
        const conferenceId = s.data.find(x => x.conference.id === s.selectedConferenceId)?.conference.id;
        if (!conferenceId) return;

        this.setState({ isInvitingLoading: true });

        try {
            const { id } = await this._api.invite(this.props.profile, this.state.profileTo, conferenceId, this.props.post, this.state.isPrivate);
            this.props.onInvited(id);
            this.setState({ isInvitingLoading: false });
        } catch (err) {
            this.setState({ error: err.message, isInvitingLoading: false });
        }
    }

    async withdraw(id: number) {
        try {
            this.setState({ loading: true });
            await this.props.onWithdraw(id);
            await this.loadConferences();
            this.setState({ loading: false });
        } catch (err) {
            if (err.name !== 'AbortError') console.error(err);
        }
    }

    changeConference(selectedConferenceId: number) {
        const s = this.state;
        const p = this.props;
        this.setState({ selectedConferenceId });
        const selectedConference = s.data.find(x => x.conference.id === selectedConferenceId);
        const currentInvitation = selectedConference?.invitations.find(x => x.from.namespace === p.profile.namespace && x.from.username === p.profile.username && x.to.namespace === s.profileTo.namespace && x.to.username === s.profileTo.username && x.post_id === p.post.id);
        this.setState({ isPrivate: currentInvitation?.is_private ?? false, isModified: false });
    }

    render() {
        const s = this.state,
            p = this.props;

        const selectedConference = s.data.find(x => x.conference.id === s.selectedConferenceId);

        const invitesTotal = selectedConference?.invitations.filter(x => x.from.namespace === this.props.profile.namespace && x.from.username === this.props.profile.username).length ?? 0;
        const invitesAuthorTotal = selectedConference?.invitations.filter(x => x.from.namespace === this.props.profile.namespace && x.from.username === this.props.profile.username).filter(x => x.to.namespace === this.state.profileTo.namespace && x.to.username === this.state.profileTo.username).length ?? 0;

        const currentInvitation = selectedConference?.invitations.find(x => x.from.namespace === p.profile.namespace && x.from.username === p.profile.username && x.to.namespace === s.profileTo.namespace && x.to.username === s.profileTo.username && x.post_id === p.post.id);

        return <React.Fragment>

            {/* {(currentInvitation) ? <h4>Edit invite</h4> : <h4>New invite</h4>} */}

            {(currentInvitation) ? <Divider horizontal>You invited</Divider> : <Divider horizontal>You invite</Divider>}
            <ProfileCard card profile={s.profileTo} />

            <Divider horizontal>To discuss the topic</Divider>
            <PostCard post={p.post} card style={{ boxShadow: '0 1px 2px 0 #2185d05e', border: '1px solid #2185d0' }} />

            {(!s.loading && !p.loading) ? <React.Fragment>
                <Divider horizontal>At conference</Divider>

                {(currentInvitation) ? <Message warning>
                    <div style={{ display: 'flex' }}>
                        <div style={{ flex: 'auto', lineHeight: '28px', marginRight: '1.5em', textAlign: 'center' }}>
                            @{s.profileTo.username} is already invited
                        </div>
                        <div>
                            <Button size='mini' primary onClick={() => this.withdraw(currentInvitation.id)}>Withdraw</Button>
                        </div>
                    </div>
                </Message> : null}

                <ConferencesDropdown
                    data={s.data}
                    onChange={(value) => this.changeConference(value as number)}
                    selectedConferenceId={s.selectedConferenceId}
                    profileTo={s.profileTo}
                />

                {selectedConference ? <Segment style={{ boxShadow: 'none', borderRadius: '0 0 .28571429rem .28571429rem', borderTop: 'none', marginTop: '0' }}>
                    <p>
                        {selectedConference.conference.description ? <Linkify componentDecorator={(href: string, text: string, key: string) => <a href={href} key={key} target="_blank" rel="noopener noreferrer">{text}</a>}>{selectedConference.conference.description}<br /></Linkify> : null}
                        {selectedConference.conference.date_from.toLocaleDateString() + ' - ' + selectedConference.conference.date_to.toLocaleDateString()}
                    </p>

                    <p>
                        {selectedConference.attendies} people are ready for discussions
                    </p>

                    {(invitesTotal > 0) ?
                        ((invitesAuthorTotal > 0) ?
                            <p>You have sent {invitesTotal} invite{(invitesTotal > 1) ? 's' : ''}, including {invitesAuthorTotal} invite{(invitesAuthorTotal > 1) ? 's' : ''} with @{this.state.profileTo.username} to the conference</p>
                            : <p>You have sent {invitesTotal} invite{(invitesTotal > 1) ? 's' : ''} to the conference</p>)
                        : <p>You have not sent any invites to the conference</p>}

                </Segment> : null}

                {!selectedConference!.attendance_from ? <Message warning>
                    Your invite implies your attendance at the conference
                </Message> : null}

                <p style={{ margin: '10px 4px', textAlign: 'end' }}>
                    Don't make private invite without good reason.
                    <Popup
                        trigger={<a style={{ cursor: 'default', marginLeft: '4px' }}>Why? <Icon name='info circle' color='blue' /></a>}
                        content='While public invites usually lead to single group conversation, a private one requires an extra time slot, which maybe not available.'
                    />
                </p>

                {s.error ? <div style={{ textAlign: 'end', marginBottom: '10px' }}><Label basic color='red'>{s.error}</Label></div> : null}

                <div style={{ textAlign: 'end' }}>
                    <Checkbox style={{ margin: '0 20px 0 0' }} label='Private' disabled={s.isInvitingLoading} checked={s.isPrivate} onChange={(e, d) => this.setState({ isPrivate: d.checked as boolean, isModified: true })} />

                    {(!currentInvitation) ? ((!selectedConference!.attendance_from) ?
                        <Button primary onClick={() => this.invite()} loading={s.isInvitingLoading} disabled={s.isInvitingLoading}>{'Attend & Invite'}</Button>
                        : <Button primary onClick={() => this.invite()} loading={s.isInvitingLoading} disabled={s.isInvitingLoading}>Invite</Button>)
                        : <Button primary onClick={() => this.invite()} loading={s.isInvitingLoading} disabled={s.isInvitingLoading || !s.isModified}>Save</Button>}

                    <Button onClick={() => this.props.onCancel()} disabled={s.isInvitingLoading}>Cancel</Button>
                </div>

            </React.Fragment> : <Placeholder>
                    <Placeholder.Line />
                    <Placeholder.Line />
                    <Placeholder.Line />
                    <Placeholder.Line />
                    <Placeholder.Line />
                    <Placeholder.Line />
                    <Placeholder.Line />
                    <Placeholder.Line />
                    <Placeholder.Line />
                    <Placeholder.Line />
                </Placeholder>}

        </React.Fragment>
    }
}
