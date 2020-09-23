import React from 'react';
import { Link } from "react-router-dom";
import { Button, Divider, Card, Accordion, Icon, Segment, Container, Checkbox } from 'semantic-ui-react';
import { Post, Profile } from '../dappletBus';
import { PostCard } from '../components/PostCard';
import { Conference, getConferences } from '../api';
import { ProfileCard } from '../components/ProfileCard';
import { Participants } from '../components/Participants';

interface IProps {
  post: Post;
  profile?: Profile;
}

interface IState {
  conferences: Conference[];
  activeIndex: string | null;
}

export class MyMeetups extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      conferences: [],
      activeIndex: '6'
    }
  }

  componentDidMount() {
    this._loadConferences();
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

  markBadge = () => {

  }

  renderAccordion = (conferences: Conference[]) => {
    const { activeIndex } = this.state;

    // const isInvited = (c: Conference) => {
    //   return this.state.invited.indexOf(c.id) !== -1;
    // }

    return (<Accordion fluid styled>
      {conferences.map(c => <React.Fragment key={c.id}>
        <Accordion.Title active={activeIndex === c.id} index={c.id} onClick={this.handleClick} style={{ lineHeight: '29px' }}>
         <Icon name='dropdown' />{c.name} {/*  <Button index={c.id} color={isInvited(c) ? 'green' : 'blue'} floated='right' size='mini' onClick={this.buttonClick}>{isInvited(c) ? 'Invited' : 'Invite'}</Button> */}
        </Accordion.Title>
        <Accordion.Content active={activeIndex === c.id}>
          <p>
            {c.location}<br />
            {c.startDate.toLocaleDateString() + ' - ' + c.finishDate.toLocaleDateString()}<br />
            <a href={c.website}>{c.website}</a>
          </p>
          <Participants/>
        </Accordion.Content>
      </React.Fragment>)}
    </Accordion>);
  }

  render() {
    return (
      <div>
        <Container text style={{ textAlign: 'center' }}>
          ???
        </Container>
        <ProfileCard card profile={this.props.profile as any} badge={'Devcon 6'}/>
        {this.renderAccordion(this.state.conferences)}
      </div>
    );
  }
}
