import React from 'react';
import { Link } from "react-router-dom";
import { Button, Divider, Card, Accordion, Icon, Segment, Container } from 'semantic-ui-react';
import { Post, Profile } from '../dappletBus';
import { PostCard } from '../components/PostCard';
import { HoverButton } from '../components/HoverButton';
import { Conference, getConferences } from '../api';

interface IProps {
  post?: Post;
  profile?: Profile;
}

interface IState {
  conferences: Conference[];
  activeIndex: string | null;
  invited: string[];
}

export class Invite extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      conferences: [],
      activeIndex: null,
      invited: []
    }
  }

  async componentDidMount() {
    await this._loadConferences();
  }

  async _loadConferences() {
    const conferences = await getConferences();
    this.setState({ conferences });
  }

  handleClick = (e: any, titleProps: any) => {
    const { index } = titleProps
    const { activeIndex } = this.state
    const newIndex = activeIndex === index ? null : index

    this.setState({ activeIndex: newIndex })
  }

  buttonClick = (e: any, titleProps: any) => {
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

  renderAccordion = (conferences: Conference[]) => {
    const { activeIndex } = this.state;

    const isInvited = (c: Conference) => {
      return this.state.invited.indexOf(c.id) !== -1;
    }

    return (<Accordion fluid styled>
      {conferences.map(c => <React.Fragment key={c.id}>
        <Accordion.Title active={activeIndex === c.id} index={c.id} onClick={this.handleClick} style={{ lineHeight: '29px' }}>
          <Icon name='dropdown' />{c.name}
          <HoverButton color={isInvited(c) ? 'green' : 'blue'} hoverColor={isInvited(c) ? 'red' : 'blue'} hoverText={isInvited(c) ? 'Withdraw' : 'Invite'} index={c.id} floated='right' size='mini' onClick={this.buttonClick}>{isInvited(c) ? 'Invited' : 'Invite'}</HoverButton>
        </Accordion.Title>
        <Accordion.Content active={activeIndex === c.id}>
          <p>
            {c.location}<br />
            {c.startDate.toLocaleDateString() + ' - ' + c.finishDate.toLocaleDateString()}<br />
            <a href={c.website}>{c.website}</a>
          </p>
        </Accordion.Content>
      </React.Fragment>)}
    </Accordion>);
  }

  render() {
    const { activeIndex } = this.state;

    if (!this.props.post) return (
      <Container text style={{ textAlign: 'center' }}>
        Select a post to invite an author for discussion
      </Container>
    );

    return (
      <div>
        <Container text style={{ textAlign: 'center' }}>
          You are about to invite<br /><span style={{ fontWeight: 'bold' }}>@{this.props.post.authorUsername}</span><br />to discuss the following topic
        </Container>

        <PostCard post={this.props.post} card />

        <Container text style={{ textAlign: 'center', marginBottom: 5 }}>at conferences HE/SHE visits</Container>
        {this.renderAccordion(this.state.conferences.filter(c => parseInt(c.id) < 2))}

        <Container text style={{ textAlign: 'center', marginTop: 10, marginBottom: 5 }}>at conferences YOU visit</Container>
        {this.renderAccordion(this.state.conferences.filter(c => parseInt(c.id) >= 2 && parseInt(c.id) < 4))}

        <Container text style={{ textAlign: 'center', marginTop: 10, marginBottom: 5 }}>or any other conferences</Container>
        {this.renderAccordion(this.state.conferences.filter(c => parseInt(c.id) >= 4 && parseInt(c.id) < 7))}
      </div>
    );
  }
}
