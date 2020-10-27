import React from 'react';
import { Button, Divider, Accordion, Icon, Container, Grid, Loader, Dropdown, Segment, Checkbox, Placeholder, Popup, Message, Label } from 'semantic-ui-react';
import { Post, Profile, Settings } from '../dappletBus';
import { PostCard } from '../components/PostCard';
import { Api, Conference, ConferenceWithInvitations } from '../api';
import { ProfileCard } from '../components/ProfileCard'
import { HoverButton } from '../components/HoverButton';
import Linkify from 'react-linkify';

interface IProps {
    post: Post;
    profile: Profile;
    settings: Settings;
    onInvited: (id: number) => void;
    loading: boolean;
    onCancel: () => void;
}

interface IState {
    data: ConferenceWithInvitations[];
    profileTo: Profile;
    selectedConferenceId: number;
    loading: boolean;
    isInvitingLoading: boolean;
    isPrivate: boolean;
    error: string | null;
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
            error: null
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
        this.setState({ data, selectedConferenceId: data[0]?.conference.id ?? -1 });
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

    render() {
        const s = this.state,
            p = this.props;

        const selectedConference = s.data.find(x => x.conference.id === s.selectedConferenceId);

        return <React.Fragment>

            <ProfileCard card profile={p.profile} />
            <Divider horizontal>Invites for discussion</Divider>
            <PostCard post={p.post} card />

            {(!s.loading && !p.loading) ? <React.Fragment>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>On Conference</label>
                <Dropdown
                    placeholder='Select Conference'
                    fluid
                    search
                    selection
                    options={s.data.map(x => ({ text: x.conference.name, value: x.conference.id }))}
                    onChange={(e, d) => this.setState({ selectedConferenceId: d.value as number })}
                    value={s.selectedConferenceId}
                />

                {selectedConference ? <Segment>
                    <p>
                        {selectedConference.conference.description ? <Linkify componentDecorator={(href: string, text: string, key: string) => <a href={href} key={key} target="_blank">{text}</a>}>{selectedConference.conference.description}<br /></Linkify> : null}
                        {selectedConference.conference.date_from.toLocaleDateString() + ' - ' + selectedConference.conference.date_to.toLocaleDateString()}
                    </p>
                </Segment> : null}

                {!selectedConference!.attendance_from ? <Message warning>
                    You will automatically participate in {selectedConference!.conference.name} when you invite a person there.
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
                    <Checkbox style={{ margin: '0 20px 0 0' }} label='Private' disabled={s.isInvitingLoading} checked={s.isPrivate} onChange={(e, d) => this.setState({ isPrivate: d.checked as boolean })} />
                    <Button primary onClick={() => this.invite()} loading={s.isInvitingLoading} disabled={s.isInvitingLoading}>{(!selectedConference!.attendance_from) ? 'Attend & Invite' : 'Invite'}</Button>
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
