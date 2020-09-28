import React from 'react';
import { Link } from "react-router-dom";
import { Button, Divider, Card, Accordion, Icon, Segment, Container, Checkbox, CheckboxProps, Grid, Loader } from 'semantic-ui-react';
import { Post, Profile, Settings } from '../dappletBus';
import { PostCard } from '../components/PostCard';
import { Api, Conference, ConferenceWithInvitations, getConferences } from '../api';
import { ProfileCard } from '../components/ProfileCard'
import { HoverButton } from '../components/HoverButton';
import { Participants } from '../components/Participants';

interface IProps {
  post?: Post;
  profile?: Profile;
  settings: Settings;
  onPostsClick: (conferenceId: number, username: string) => void;
}

interface IState {
  data: ConferenceWithInvitations[];
  activeIndex: number | null;
  attended: number[];
  invited: number[];
  badgeIndex: number | null;
  detailsIndex: number | null;
  loading: { [key: string]: boolean };
  profileTo: Profile | null;
}

export class Merged extends React.Component<IProps, IState> {
  private _api: Api;

  constructor(props: IProps) {
    super(props);

    this._api = new Api(this.props.settings.serverUrl);
    this.state = {
      data: [],
      activeIndex: null,
      attended: [],
      invited: [],
      badgeIndex: null,
      detailsIndex: null,
      loading: {
        'list': true
      },
      profileTo: this.props.post ? {
        username: this.props.post!.authorUsername.toLowerCase(),
        fullname: this.props.post!.authorFullname,
        img: this.props.post!.authorImg,
        namespace: 'twitter.com'
      } : null
    }
  }

  async componentDidMount() {
    await this._loadConferences();
    this._setLoading('list', false);
  }


  async _loadConferences() {
    const data = await this._api.getConferencesWithInvitations(this.props.profile!, this.state.profileTo!);
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
    try {
      if (this.state.data.find((d) => d.conference.id === index)!.attendance_from) {
        if (this.state.data.find((d) => d.conference.id === index)!.invitations.find(x => (
          x.from.username === this.props.profile?.username
          && x.from.namespace === this.props.profile?.namespace
          && x.to.username === this.state.profileTo?.username
          && x.to.namespace === this.state.profileTo?.namespace
        ))) {
          await this._api.withdraw(this.props.profile!, this.state.profileTo!, index, this.props.post!);
        }
        await this._api.absend(this.props.profile!, index);
      } else {
        await this._api.attend(this.props.profile!, index);
      }

      await this._loadConferences();
    } catch (err) {
      console.error(err);
    } finally {
      this._setLoading('attend-' + index, false);
    }
  }

  inviteButtonClickHandler = async (e: any, titleProps: any) => {
    e.stopPropagation();

    const { index } = titleProps;
    this._setLoading('invite-' + index, true);
    try {
      if (this.state.data.find((d) => d.conference.id === index)!.invitations.find(x => (
        x.from.username === this.props.profile?.username
        && x.from.namespace === this.props.profile?.namespace
        && x.to.username === this.state.profileTo?.username
        && x.to.namespace === this.state.profileTo?.namespace
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
    }
  }

  badgeCheckboxClickHandler = (e: React.FormEvent<HTMLInputElement>, data: CheckboxProps & any) => {
    const { index } = data;
    const oldValue = this.state.badgeIndex;
    const newValue = (oldValue === index) ? null : index;
    this.setState({ badgeIndex: newValue });
  }

  detailsClickHandler = (conferenceId: number) => {
    this.setState({ detailsIndex: conferenceId });
  }

  _setLoading(key: string, value: boolean) {
    const loading = this.state.loading;
    loading[key] = value;
    this.setState({ loading });
  }

  _getLoading(key: string) {
    return this.state.loading[key] || false;
  }

  renderAccordion = (data: ConferenceWithInvitations[], header?: any) => {
    if (data.length === 0) return null;
    const { post } = this.props;
    const { activeIndex } = this.state;

    const isInvited = (c: Conference) => {
      return this.state.data.find((d) => d.conference.id === c.id)!.invitations.find(x => (
        x.from.username === this.props.profile?.username
        && x.from.namespace === this.props.profile?.namespace
        && x.to.username === this.state.profileTo?.username
        && x.to.namespace === this.state.profileTo?.namespace
      ))
    }

    const isAttended = (c: Conference) => {
      return this.state.data.find(d => d.conference.id === c.id)!.attendance_from;
    }

    return (<React.Fragment>
      {header && data.length > 0 ? header : null}
      <Accordion fluid styled>
        {data.map(d => d.conference).map(c => <React.Fragment key={c.id}>
          <Accordion.Title active={activeIndex === c.id} index={c.id} onClick={this.accordionClickHandler} style={{ lineHeight: '29px' }}>
            <Icon name='dropdown' />{c.name}
            {post ? <HoverButton loading={this._getLoading('invite-' + c.id)} disabled={this._getLoading('invite-' + c.id)} color={isInvited(c) ? 'green' : 'blue'} hoverColor={isInvited(c) ? 'red' : 'blue'} hoverText={isInvited(c) ? 'Withdraw' : 'Invite'} index={c.id} floated='right' size='mini' onClick={this.inviteButtonClickHandler}>{isInvited(c) ? 'Invited' : 'Invite'}</HoverButton> : null}
            <Button index={c.id} loading={this._getLoading('attend-' + c.id)} disabled={this._getLoading('attend-' + c.id)} color={isAttended(c) ? 'green' : 'blue'} floated='right' size='mini' basic={!!this.props.post} onClick={this.attendButtonClickHandler}>{isAttended(c) ? 'Attended' : 'Attend'}</Button>
          </Accordion.Title>
          <Accordion.Content active={activeIndex === c.id}>
            <p>
              {c.description}<br />
              {c.date_from.toLocaleDateString() + ' - ' + c.date_to.toLocaleDateString()}<br />
              <a href={c.website}>{c.website}</a>
            </p>
            {(isAttended(c)) ? <div style={{ marginBottom: '10px' }}><Checkbox checked={this.state.badgeIndex === c.id} index={c.id} onChange={this.badgeCheckboxClickHandler} label='Make visible as a badge' /></div> : null}
            {this.state.detailsIndex === c.id ? this.renderParticipants(c.id) : <a onClick={() => this.detailsClickHandler(c.id)} style={{ cursor: 'pointer' }}>Show details...</a>}
          </Accordion.Content>
        </React.Fragment>)}
      </Accordion>
    </React.Fragment>);
  }

  getCurrentBadge() {
    const { data, badgeIndex } = this.state;
    if (!badgeIndex) return undefined;

    return data.find(x => x.conference.id === badgeIndex)?.conference.short_name;
  }

  renderParticipants(conferenceId: number) {

    const invitations = this.state.data.find(x => x.conference.id === conferenceId)!.invitations;
    const wantsMe = invitations.filter(x => x.to.username === this.props.profile?.username).map(x => ({
      username: x.from.username,
      fullname: x.from.fullname,
      isWant: false,
      isMatch: false,
      isWantsMe: true
    }));
    const isWant = invitations.filter(x => x.from.username === this.props.profile?.username).map(x => ({
      username: x.from.username,
      fullname: x.from.fullname,
      isWant: true,
      isMatch: false,
      isWantsMe: false
    }));

    const data = [...wantsMe, ...isWant];

    return (<div>
      <br />
      <Grid columns='equal'>
        {data.map((r, i) => <Grid.Row style={{ padding: 0 }} key={i}>
          <Grid.Column width={1}>
            {this.getIcon(r)}
          </Grid.Column>
          <Grid.Column >
            {r.fullname} @{r.username} <a style={{ cursor: 'pointer' }} onClick={() => this.props.onPostsClick?.(conferenceId, r.username)}>by 3 topics</a>
          </Grid.Column>
        </Grid.Row>)}
      </Grid>
    </div>);
  }

  getIcon(r: any) {
    if (r.isWant && r.isWantsMe) {
      return <Icon name='handshake outline' />
    } else if (r.isWant) {
      return <Icon name='hand paper outline' rotated='clockwise' style={{ position: 'relative', left: '3px' }} />
    } else if (r.isWantsMe) {
      return <Icon name='hand paper outline' style={{ transform: 'scale(-1, 1) rotate(90deg)', position: 'relative', left: '-1px' }} />
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

    return (
      <div>
        {/* <Container text style={{ textAlign: 'center' }}>
          Your account is visible as
        </Container> */}
        <ProfileCard card profile={this.props.profile} badge={this.getCurrentBadge()} />

        {this.props.post ? <React.Fragment>
          <Divider horizontal>Invites for discussion</Divider>
          {/* <Container text style={{ textAlign: 'center' }}>
            You are about to invite<br /><span style={{ fontWeight: 'bold' }}>@{this.props.post.authorUsername}</span><br />to discuss the following topic
          </Container> */}
          <PostCard post={this.props.post} card />
        </React.Fragment> : null}
        {this.props.post ? <React.Fragment>
          {!this._getLoading('list') ? <React.Fragment>
            {this.renderAccordion(this.state.data.filter(c => c.attendance_to === true), <Container text style={{ textAlign: 'center', marginBottom: 5 }}>at conferences HE/SHE visits</Container>)}

            {this.renderAccordion(this.state.data.filter(c => c.attendance_from === true), <Container text style={{ textAlign: 'center', marginTop: 10, marginBottom: 5 }}>at conferences YOU visit</Container>)}

            {this.renderAccordion(this.state.data.filter(c => c.attendance_from === false && c.attendance_to === false), <Container text style={{ textAlign: 'center', marginTop: 10, marginBottom: 5 }}>or any other conferences</Container>)}
          </React.Fragment> : <Loader active inline='centered'>Loading</Loader>}

        </React.Fragment> : this.renderAccordion(this.state.data)}
      </div>
    );
  }
}
