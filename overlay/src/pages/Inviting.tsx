import React from 'react';
import { Button, Divider, Accordion, Icon, Container, Grid, Loader, Dropdown, Segment, Checkbox, Placeholder, Popup } from 'semantic-ui-react';
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
    onInvited: () => void;
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
}

export class Inviting extends React.Component<IProps, IState> {
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
            isPrivate: false
        }
    }

    async componentDidMount() {
        await this.loadConferences();
        this.setState({ loading: false });
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
            if (!this.state.data.find((d) => d.conference.id === conferenceId)!.attendance_from) {
                await this._api.attend(this.props.profile, conferenceId);
            }
            await this._api.invite(this.props.profile, this.state.profileTo, conferenceId, this.props.post, this.state.isPrivate);
            this.props.onInvited();
        } catch (err) {
            console.error(err);
        } finally {
            this.setState({ isInvitingLoading: false });
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

                <p style={{ margin: '10px 4px', textAlign: 'end' }}>
                    <Popup
                        trigger={<Icon name='info circle' />}
                        content='While public invites may result into group conversation, a private invite is a request for strictly separate and private one'
                    />
                    Don't make invite private for no reason
                </p>

                <div style={{ textAlign: 'end' }}>
                    <Checkbox style={{ margin: '0 20px 0 0' }} label='Private' disabled={s.isInvitingLoading} checked={s.isPrivate} onChange={(e, d) => this.setState({ isPrivate: d.checked as boolean })} />
                    <Button primary onClick={() => this.invite()} loading={s.isInvitingLoading} disabled={s.isInvitingLoading}>Invite</Button>
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
