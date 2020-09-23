import React from 'react';
import { Link } from "react-router-dom";
import { Button, Divider, Card, Accordion, Icon, Segment, Container, Checkbox, CheckboxProps, Grid } from 'semantic-ui-react';
import { Post, Profile } from '../dappletBus';
import { PostCard } from '../components/PostCard';
import { Conference, getConferences } from '../api';
import { ProfileCard } from '../components/ProfileCard'
import { HoverButton } from '../components/HoverButton';
import { Participants } from '../components/Participants';

interface IProps {
  post?: Post;
  profile?: Profile;
  onPostsClick: (conferenceId: string, username: string) => void;
}

interface IState {
  conferences: Conference[];
  activeIndex: string | null;
  attended: string[];
  invited: string[];
  badgeIndex: string | null;
  detailsIndex: string | null;
}

export class Merged extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      conferences: [],
      activeIndex: null,
      attended: [],
      invited: [],
      badgeIndex: null,
      detailsIndex: null
    }
  }

  componentDidMount() {
    this._loadConferences();
  }


  async _loadConferences() {
    const conferences = await getConferences();
    this.setState({ conferences });
  }

  accordionClickHandler = (e: any, titleProps: any) => {
    const { index } = titleProps
    const { activeIndex } = this.state
    const newIndex = activeIndex === index ? null : index

    this.setState({ activeIndex: newIndex })
  }

  attendButtonClickHandler = (e: any, titleProps: any) => {
    e.stopPropagation();

    const { index } = titleProps;
    const { attended } = this.state;
    let newAttended = [];

    if (attended.indexOf(index) === -1) {
      newAttended = [...attended, index];
    } else {
      newAttended = attended.filter((x) => x !== index);
    }

    this.setState({ attended: newAttended });
  }

  inviteButtonClickHandler = (e: any, titleProps: any) => {
    e.stopPropagation();

    const { index } = titleProps;
    const { invited } = this.state;
    let newInvited = [];

    if (invited.indexOf(index) === -1) {
      newInvited = [...invited, index];
    } else {
      newInvited = invited.filter((x) => x !== index);
    }

    this.setState({ invited: newInvited });
  }

  badgeCheckboxClickHandler = (e: React.FormEvent<HTMLInputElement>, data: CheckboxProps & any) => {
    const { index } = data;
    const oldValue = this.state.badgeIndex;
    const newValue = (oldValue === index) ? null : index;
    this.setState({ badgeIndex: newValue });
  }

  detailsClickHandler = (conferenceId: string) => {
    this.setState({ detailsIndex: conferenceId });
  }

  renderAccordion = (conferences: Conference[]) => {
    const { post } = this.props;
    const { activeIndex } = this.state;

    const isAttended = (c: Conference) => {
      return this.state.attended.indexOf(c.id) !== -1;
    }

    const isInvited = (c: Conference) => {
      return this.state.invited.indexOf(c.id) !== -1;
    }

    return (<Accordion fluid styled>
      {conferences.map(c => <React.Fragment key={c.id}>
        <Accordion.Title active={activeIndex === c.id} index={c.id} onClick={this.accordionClickHandler} style={{ lineHeight: '29px' }}>
          <Icon name='dropdown' />{c.name}
          {post ? <HoverButton color={isInvited(c) ? 'green' : 'blue'} hoverColor={isInvited(c) ? 'red' : 'blue'} hoverText={isInvited(c) ? 'Withdraw' : 'Invite'} index={c.id} floated='right' size='mini' onClick={this.inviteButtonClickHandler}>{isInvited(c) ? 'Invited' : 'Invite'}</HoverButton> : null}
          <Button index={c.id} color={isAttended(c) ? 'green' : 'blue'} floated='right' size='mini' basic={!!this.props.post} onClick={this.attendButtonClickHandler}>{isAttended(c) ? 'Attended' : 'Attend'}</Button>
        </Accordion.Title>
        <Accordion.Content active={activeIndex === c.id}>
          <p>
            {c.location}<br />
            {c.startDate.toLocaleDateString() + ' - ' + c.finishDate.toLocaleDateString()}<br />
            <a href={c.website}>{c.website}</a>
          </p>
          {(isAttended(c)) ? <div style={{ marginBottom: '10px' }}><Checkbox checked={this.state.badgeIndex === c.id} index={c.id} onChange={this.badgeCheckboxClickHandler} label='Make visible as a badge' /></div> : null}
          {this.state.detailsIndex === c.id ? this.renderParticipants(c.id) : <a onClick={() => this.detailsClickHandler(c.id)} style={{ cursor: 'pointer' }}>Show details...</a>}
        </Accordion.Content>
      </React.Fragment>)}
    </Accordion>);
  }

  getCurrentBadge() {
    const { conferences, badgeIndex } = this.state;
    if (!badgeIndex) return undefined;

    return conferences.find(x => x.id === badgeIndex)?.name;
  }

  renderParticipants(conferenceId: string) {

    const data = [{
      fullname: 'Dmitry Palchun',
      username: 'ethernian',
      isWant: true,
      isMatch: true,
      isWantsMe: true
    }, {
      fullname: 'Alexander Sakhaev',
      username: 'alsakhaev',
      isWant: true,
      isMatch: false,
      isWantsMe: false
    }, {
      fullname: 'Petr Petrov',
      username: 'ppetrov',
      isWant: true,
      isMatch: false,
      isWantsMe: false
    }, {
      fullname: 'Sidorov',
      username: 'sidorov',
      isWant: false,
      isMatch: false,
      isWantsMe: true
    }];

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
          <Container text style={{ textAlign: 'center', marginBottom: 5 }}>at conferences HE/SHE visits</Container>
          {this.renderAccordion(this.state.conferences.filter(c => parseInt(c.id) < 2))}

          <Container text style={{ textAlign: 'center', marginTop: 10, marginBottom: 5 }}>at conferences YOU visit</Container>
          {this.renderAccordion(this.state.conferences.filter(c => parseInt(c.id) >= 2 && parseInt(c.id) < 4))}

          <Container text style={{ textAlign: 'center', marginTop: 10, marginBottom: 5 }}>or any other conferences</Container>
          {this.renderAccordion(this.state.conferences.filter(c => parseInt(c.id) >= 4 && parseInt(c.id) < 7))}
        </React.Fragment> : this.renderAccordion(this.state.conferences)}
      </div>
    );
  }
}
