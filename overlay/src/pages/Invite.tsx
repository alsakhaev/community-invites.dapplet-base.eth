import React from 'react';
import { Placeholder, Breadcrumb } from 'semantic-ui-react';
import { Post, Profile, Settings } from '../dappletBus';
import { Api, MyInvitation } from '../api';
import { AllInvites } from './AllInvites';
import { NewInvite } from './NewInvite';

enum Tabs {
  No,
  AllInvites,
  NewInvite,
  EditInvite
}

interface IProps {
  post?: Post;
  profile: Profile;
  settings: Settings;
  onPostsClick: (conferenceShortName: string, username: string) => void;
}

interface IState {
  isNewInviteOpened: boolean;
  invited: boolean;
  data: (MyInvitation & { loading: boolean })[];
  loading: boolean;
  currentTab: Tabs;
  highlightedInvitationId: number;
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
      loading: true,
      currentTab: Tabs.No,
      highlightedInvitationId: -1
    }
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

  async componentWillUnmount() {
    this._api.controller.abort();
  }

  async setInvited() {
    this.setState({ invited: true });
    await this.loadData();
  }

  async withdraw(invitation: MyInvitation) {
    const data = this.state.data;
    data.find(x => x === invitation)!.loading = true;
    this.setState({ data });

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

    this.setState({ data: this.state.data.filter(x => x !== invitation) });
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

  async onInvitedHandler(invId: number) {
    this.setState({ currentTab: Tabs.AllInvites, highlightedInvitationId: invId });
    await this.loadData();
    setTimeout(() => this.setState({ highlightedInvitationId: -1 }), 3000);
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

    return <React.Fragment>

      {/* <Breadcrumb size='large'>
        <Breadcrumb.Section
          active={s.currentTab === Tabs.AllInvites}
          onClick={(s.currentTab !== Tabs.AllInvites) ? () => this.setState({ currentTab: Tabs.AllInvites }) : undefined}
        >All Invites</Breadcrumb.Section>

        {(s.currentTab !== Tabs.AllInvites) ? <React.Fragment>
          <Breadcrumb.Divider />
          <Breadcrumb.Section active>Edit/Add Invite</Breadcrumb.Section>
        </React.Fragment> : null}

      </Breadcrumb> */}

      {(s.currentTab === Tabs.AllInvites) ? <AllInvites highlightedInvitationId={s.highlightedInvitationId} loading={s.loading} settings={p.settings} profile={p.profile} data={s.data} onWithdraw={(x) => this.withdraw(x)} /> : null}
      {(s.currentTab === Tabs.NewInvite) ? <NewInvite loading={s.loading} settings={p.settings} profile={p.profile} post={p.post!} onInvited={(invId) => this.onInvitedHandler(invId)} onCancel={() => this.setState({ currentTab: Tabs.AllInvites })} onWithdraw={(x) => this.withdraw2(x)} /> : null}

    </React.Fragment>
  }
}
