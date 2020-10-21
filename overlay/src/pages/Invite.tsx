import React from 'react';
import { Button, Divider, Accordion, Icon, Container, Grid, Loader, Dropdown, Segment, Checkbox, Placeholder } from 'semantic-ui-react';
import { Post, Profile, Settings } from '../dappletBus';
import { PostCard } from '../components/PostCard';
import { Api, Conference, ConferenceWithInvitations, MyInvitation } from '../api';
import { ProfileCard } from '../components/ProfileCard'
import { HoverButton } from '../components/HoverButton';
import Linkify from 'react-linkify';
import { AllInvites } from './AllInvites';
import { Inviting } from './Inviting';

interface IProps {
  post?: Post;
  profile: Profile;
  settings: Settings;
  onPostsClick: (conferenceShortName: string, username: string) => void;
}

interface IState {
  isNewInviteOpened: boolean;
  invited: boolean;
  data: MyInvitation[];
  loading: boolean;
}

export class Invite extends React.Component<IProps, IState> {
  private _api: Api;

  constructor(props: IProps) {
    super(props);
    this._api = new Api(this.props.settings.serverUrl);
    this.state = {
      isNewInviteOpened: true,
      invited: false,
      data: [],
      loading: true
    }
  }

  async componentDidMount() {
    await this.loadData();
  }

  async loadData() {
    this.setState({ loading: true });
    const data = await this._api.getMyInvitations(this.props.profile.namespace, this.props.profile.username);
    this.setState({ data });
    this.setState({ loading: false });
  }

  async setInvited() {
    this.setState({ invited: true });
    await this.loadData();
  }

  async withdraw(invitation: MyInvitation) {
    this.setState({ data: this.state.data.filter(x => x !== invitation) });
    const profileTo = {
      username: invitation.author_username.toLowerCase(),
      fullname: invitation.author_fullname,
      img: invitation.author_img,
      namespace: 'twitter.com'
    };
    const post: Post = {
      authorFullname: profileTo.fullname,
      authorUsername: profileTo.username,
      authorImg: profileTo.img,
      id: invitation.post_id,
      text: invitation.post_text
    }
    await this._api.withdraw(this.props.profile!, profileTo, invitation.conference_id, post);
  }

  render() {
    const p = this.props,
      s = this.state;

    if (p.post) {
      return <React.Fragment>
        {(!s.invited) ?
          <Accordion>
            <Accordion.Title active={s.isNewInviteOpened} onClick={() => this.setState({ isNewInviteOpened: !s.isNewInviteOpened })}>
              <Icon name='dropdown' />
              <h3 style={{ display: 'inline' }}>New Invite</h3>
            </Accordion.Title>
            <Accordion.Content active={s.isNewInviteOpened}>
              <Inviting settings={p.settings} profile={p.profile} post={p.post} onInvited={() => this.setInvited()} />
            </Accordion.Content>
          </Accordion> : null}

          {/* <Divider /> */}

        {/* <h3>All Invites</h3>
        {s.loading ? <Placeholder>
          <Placeholder.Line />
          <Placeholder.Line />
          <Placeholder.Line />
          <Placeholder.Line />
          <Placeholder.Line />
        </Placeholder> :
          <AllInvites settings={p.settings} profile={p.profile} data={s.data} onWithdraw={(x) => this.withdraw(x)} />} */}
      </React.Fragment>;
    } else {
      return <React.Fragment>
        <h3>All Invites</h3>
        {s.loading ? <Placeholder>
          <Placeholder.Line />
          <Placeholder.Line />
          <Placeholder.Line />
          <Placeholder.Line />
          <Placeholder.Line />
        </Placeholder> :
          <AllInvites settings={p.settings} profile={p.profile} data={s.data} onWithdraw={(x) => this.withdraw(x)} />}
      </React.Fragment>
    }
  }
}
