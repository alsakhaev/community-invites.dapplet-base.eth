import React from 'react';
import { Button, Divider, Accordion, Icon, Container, Grid, Loader, Dropdown } from 'semantic-ui-react';
import { Post, Profile, Settings } from '../dappletBus';
import { PostCard } from '../components/PostCard';
import { Api, Conference, ConferenceWithInvitations } from '../api';
import { ProfileCard } from '../components/ProfileCard'
import { HoverButton } from '../components/HoverButton';
import Linkify from 'react-linkify';

interface IProps {
  post?: Post;
  profile?: Profile;
  settings: Settings;
  onPostsClick: (conferenceShortName: string, username: string) => void;
}

interface IState {
  data: ConferenceWithInvitations[];
  activeIndex: string | null;
  attended: number[];
  invited: number[];
  badgeIndex: number | null;
  //detailsIndex: number | null;
  loading: { [key: string]: boolean };
  profileTo: Profile | undefined;
  selectedConference: number | null;
}

export class Conferences extends React.Component<IProps, IState> {
  private _api: Api;

  constructor(props: IProps) {
    super(props);

    this._api = new Api(this.props.settings.serverUrl);
    this.state = {
      data: [],
      activeIndex: null,
      attended: [],
      invited: [],
      badgeIndex: this.props.profile?.main_conference_id || null,
      //detailsIndex: null,
      loading: {
        'list': true
      },
      profileTo: this.props.post ? {
        username: this.props.post!.authorUsername.toLowerCase(),
        fullname: this.props.post!.authorFullname,
        img: this.props.post!.authorImg,
        namespace: 'twitter.com',
        main_conference_id: null
      } : undefined,
      selectedConference: null
    }
  }

  async componentDidMount() {
    await this._loadConferences();
    this._setLoading('list', false);
  }


  async _loadConferences() {
    const data = await this._api.getConferencesWithInvitations(this.props.profile!, this.state.profileTo);
    this.setState({ data });
  }

  accordionClickHandler = (e: any, titleProps: any) => {
    const { index } = titleProps
    const { activeIndex } = this.state
    const newIndex = activeIndex === index ? null : index

    this.setState({ activeIndex: newIndex })
  }

  attendButtonClickHandler = async (e: any, titleProps: any) => {
    e.stopPropagation();

    const { index } = titleProps;
    this._setLoading('attend-' + index, true);
    this.setState({ selectedConference: index });
    try {
      if (this.state.data.find((d) => d.conference.id === index)!.attendance_from) {

        // ToDo: move to backend?
        if (this.state.data.find((d) => d.conference.id === index)!.invitations.find(x => (
          x.from.username === this.props.profile?.username
          && x.from.namespace === this.props.profile?.namespace
          && x.to.username === this.state.profileTo?.username
          && x.to.namespace === this.state.profileTo?.namespace
          && x.post_id === this.props.post?.id
        ))) {
          await this._api.withdraw(this.props.profile!, this.state.profileTo!, index, this.props.post!);
        }

        // // ToDo: move to backend?
        // if (this.state.badgeIndex === index) {
        //   const { profile } = this.props;
        //   if (profile) {
        //     profile.main_conference_id = null;
        //     const newProfile = await this._api.updateUser(profile);
        //     this.setState({ badgeIndex: newProfile.main_conference_id });
        //   }
        // }

        await this._api.absend(this.props.profile!, index);
      } else {
        await this._api.attend(this.props.profile!, index);
      }

      await this._loadConferences();
    } catch (err) {
      console.error(err);
    } finally {
      this._setLoading('attend-' + index, false);
      setTimeout(() => this.setState({ selectedConference: null }), 2000);
    }
  }

  inviteButtonClickHandler = async (e: any, titleProps: any) => {
    e.stopPropagation();

    const { index } = titleProps;
    this._setLoading('invite-' + index, true);
    this.setState({ selectedConference: index });
    try {
      // ToDo: move to backend?
      if (this.state.data.find((d) => d.conference.id === index)!.invitations.find(x => (
        x.from.username === this.props.profile?.username
        && x.from.namespace === this.props.profile?.namespace
        && x.to.username === this.state.profileTo?.username
        && x.to.namespace === this.state.profileTo?.namespace
        && x.post_id === this.props.post?.id
      ))) {
        await this._api.withdraw(this.props.profile!, this.state.profileTo!, index, this.props.post!);
      } else {
        if (!this.state.data.find((d) => d.conference.id === index)!.attendance_from) {
          await this._api.attend(this.props.profile!, index);
        }
        await this._api.invite(this.props.profile!, this.state.profileTo!, index, this.props.post!);
      }

      await this._loadConferences();
    } catch (err) {
      console.error(err);
    } finally {
      this._setLoading('invite-' + index, false);
      setTimeout(() => this.setState({ selectedConference: null }), 2000);
    }
  }

  // badgeCheckboxClickHandler = async (index: number) => {
  //   const oldValue = this.state.badgeIndex;
  //   const newValue = (oldValue === index) ? null : index;

  //   const { profile } = this.props;
  //   if (profile) {
  //     this._setLoading('badge', true);
  //     profile.main_conference_id = newValue;
  //     const newProfile = await this._api.updateUser(profile);
  //     this.setState({ badgeIndex: newProfile.main_conference_id });
  //     this._setLoading('badge', false);
  //   }
  // }

  // badgeClickHandler = () => {
  //   const { badgeIndex } = this.state;
  //   if (badgeIndex) {
  //     this.setState({ activeIndex: 'my' + badgeIndex });
  //   } else {
  //     const newIndex = this.state.data.find(x => x.attendance_from === true)?.conference.id;
  //     if (newIndex) {
  //       this.setState({ activeIndex: 'my' + newIndex });
  //     }
  //   }
  // }

  // detailsClickHandler = (conferenceId: number) => {
  //   this.setState({ detailsIndex: conferenceId });
  // }

  _setLoading(key: string, value: boolean) {
    const loading = this.state.loading;
    loading[key] = value;
    this.setState({ loading });
  }

  _getLoading(key: string) {
    return this.state.loading[key] || false;
  }

  renderAccordion = (data: ConferenceWithInvitations[], header: any, key: string) => {
    if (data.length === 0) return null;
    const { post, profile } = this.props;
    const { activeIndex } = this.state;

    const isInvited = (c: Conference) => {
      return this.state.data.find((d) => d.conference.id === c.id)!.invitations.find(x => (
        x.from.username === this.props.profile?.username
        && x.from.namespace === this.props.profile?.namespace
        && x.to.username === this.state.profileTo?.username
        && x.to.namespace === this.state.profileTo?.namespace
        && x.post_id === this.props.post?.id
      ))
    }

    const isAttended = (c: Conference) => {
      return this.state.data.find(d => d.conference.id === c.id)!.attendance_from;
    }
    
    return (<React.Fragment>
      {header && data.length > 0 ? header : null}
      <Accordion fluid styled>
        {data.map(d => d.conference).map(c => <React.Fragment key={c.id}>
          <Accordion.Title active={activeIndex === key + c.id} index={key + c.id} onClick={this.accordionClickHandler} style={{ lineHeight: '29px', color: (this.state.selectedConference === c.id) ? '#2185d0' : undefined }} >
            <Icon name='dropdown' />{c.name}

            {(post && post.authorUsername !== profile?.username) ?
              <HoverButton
                style={{ width: '75px', paddingLeft: '0', paddingRight: '0' }}
                loading={this._getLoading('invite-' + c.id)}
                disabled={this._getLoading('invite-' + c.id)}
                color={isInvited(c) ? 'green' : 'blue'}
                hoverColor={isInvited(c) ? 'red' : 'blue'}
                hoverText={isInvited(c) ? 'Withdraw' : 'Invite'}
                index={c.id}
                floated='right'
                size='mini'
                onClick={this.inviteButtonClickHandler}
              >{isInvited(c) ? 'Invited' : 'Invite'}</HoverButton> : null}

            <Button
              index={c.id}
              style={{ width: '75px', paddingLeft: '0', paddingRight: '0' }}
              loading={this._getLoading('attend-' + c.id)}
              disabled={this._getLoading('attend-' + c.id)}
              color={isAttended(c) ? 'green' : 'blue'}
              floated='right'
              size='mini'
              basic={!!this.props.post}
              onClick={this.attendButtonClickHandler}
            >{isAttended(c) ? 'Attending' : 'Attend'}</Button>

          </Accordion.Title>
          <Accordion.Content active={activeIndex === key + c.id}>
            <p>
              <Linkify componentDecorator={(href: string, text: string, key: string) => <a href={href} key={key} target="_blank">{text}</a>}>{c.description}</Linkify><br />
              {c.date_from.toLocaleDateString() + ' - ' + c.date_to.toLocaleDateString()}<br />
              <a href={c.website}>{c.website}</a>
            </p>
            {/* {(isAttended(c)) ? <div style={{ marginBottom: '10px' }}>
              <Checkbox
                disabled={this._getLoading('badge-' + c.id)}
                checked={this.state.badgeIndex === c.id}
                index={c.id}
                onChange={this.badgeCheckboxClickHandler}
                label='Make visible as a badge'
              />
            </div> : null} */}
            {this.renderParticipants(c.id)}
          </Accordion.Content>
        </React.Fragment>)}
      </Accordion>
    </React.Fragment>);
  }

  getCurrentBadge() {
    const { data, badgeIndex } = this.state;
    if (!badgeIndex) return null;

    return data.find(x => x.conference.id === badgeIndex)?.conference.short_name || undefined;
  }

  renderParticipants(conferenceId: number) {
    const conference = this.state.data.find(x => x.conference.id === conferenceId)!.conference;
    const invitations = this.state.data.find(x => x.conference.id === conferenceId)!.invitations;
    const wantsMe = invitations.filter(x => x.to.username === this.props.profile?.username).map(x => ({
      username: x.from.username,
      fullname: x.from.fullname,
      isWant: false,
      isWantsMe: true
    }));
    const isWant = invitations.filter(x => x.from.username === this.props.profile?.username).map(x => ({
      username: x.to.username,
      fullname: x.to.fullname,
      isWant: true,
      isWantsMe: false
    }));

    const data: any[] = [];

    for (const row of [...wantsMe, ...isWant]) {
      const found = data.find(x => x.username.toLowerCase() === row.username.toLowerCase());
      if (found) {
        found.count = found.count + 1;
        found.isWant = found.isWant || row.isWant;
        found.isWantsMe = found.isWantsMe || row.isWantsMe;
      } else {
        data.push({ ...row, count: 1 });
      }
    }

    return (<div>
      <br />
      <Grid columns='equal'>
        {data.map((r, i) => <Grid.Row style={{ padding: 0 }} key={i}>
          <Grid.Column width={1}>
            {this.getIcon(r)}
          </Grid.Column>
          <Grid.Column >
            {r.fullname} @{r.username} <a style={{ cursor: 'pointer' }} onClick={() => this.props.onPostsClick?.(conference.short_name, r.username)}>by {r.count} topic(s)</a>
          </Grid.Column>
        </Grid.Row>)}
      </Grid>
    </div>);
  }

  getIcon(r: any) {
    if (r.isWant && r.isWantsMe) {
      return <Icon name='handshake outline' title={`You and ${r.fullname} are invited each other`} />
    } else if (r.isWant) {
      return <Icon name='hand paper outline' title={`You invited ${r.fullname}`} rotated='clockwise' style={{ position: 'relative', left: '3px' }} />
    } else if (r.isWantsMe) {
      return <Icon name='hand paper outline' title={`${r.fullname} invited you`} style={{ transform: 'scale(-1, 1) rotate(90deg)', position: 'relative', left: '-1px' }} />
    } else {
      return null;
    }
  }

  render() {
    if (!this.props.profile) {
      return <Container text style={{ textAlign: 'center' }}>
        You are not logged in
      </Container>;
    }

    const badgeOptions = [
      { key: null, value: null, text: 'No label' },
      ...this.state.data.filter(d => d.attendance_from === true).map(d => ({ key: d.conference.id, value: d.conference.id, text: d.conference.short_name }))
    ];

    return (
      <div>
        {/* <Container text style={{ textAlign: 'center' }}>
          Your account is visible as
        </Container> */}
        <ProfileCard
          card
          profile={this.props.profile}
        // badge={this.getCurrentBadge()} 
        // onBadgeClick={this.badgeClickHandler}
        // badge={(this.state.loading.list) ? null :
        //   <Dropdown
        //     text={this.getCurrentBadge() ?? 'No label'}
        //     className='ui blue button mini'
        //     style={{ cursor: 'pointer', position: 'relative', top: '-3px', marginLeft: '4px', padding: '6px 8px' }}
        //     onChange={(e, { value }) => this.badgeCheckboxClickHandler(value as number)}
        //     options={badgeOptions as any}
        //     value={this.state.badgeIndex as any}
        //     loading={this._getLoading('badge')}
        //   />
        // }
        />

        {(this.props.post && this.props.post.authorUsername !== this.props.profile.username) ? <React.Fragment>
          <Divider horizontal>Invites for discussion</Divider>
          {/* <Container text style={{ textAlign: 'center' }}>
            You are about to invite<br /><span style={{ fontWeight: 'bold' }}>@{this.props.post.authorUsername}</span><br />to discuss the following topic
          </Container> */}
          <PostCard post={this.props.post} card />
        </React.Fragment> : null}
        {(this.props.post && this.props.post.authorUsername !== this.props.profile.username) ? <React.Fragment>
          {!this._getLoading('list') ? <React.Fragment>
            {this.renderAccordion(this.state.data.filter(c => c.attendance_to === true), <Container text style={{ textAlign: 'center', marginBottom: 5 }}>at conferences HE/SHE visits</Container>, 'heshe')}

            {this.renderAccordion(this.state.data.filter(c => c.attendance_from === true), <Container text style={{ textAlign: 'center', marginTop: 10, marginBottom: 5 }}>at conferences YOU visit</Container>, 'my')}

            {this.renderAccordion(this.state.data.filter(c => c.attendance_from === false && c.attendance_to === false), <Container text style={{ textAlign: 'center', marginTop: 10, marginBottom: 5 }}>or any other conferences</Container>, 'other')}
          </React.Fragment> : <Loader active inline='centered'>Loading</Loader>}

        </React.Fragment> : (!this._getLoading('list') ? this.renderAccordion(this.state.data, null, 'all') : <Loader active inline='centered'>Loading</Loader>)}
      </div>
    );
  }
}
