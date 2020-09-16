import React from 'react';
import { Link } from "react-router-dom";
import { Button, Divider, Card, Accordion, Icon, Segment, Container } from 'semantic-ui-react';
import { Post } from '../dappletBus';
import { TweetCard } from '../components/TweetCard';

type Conference = {
  id: string;
  name: string;
  startDate: Date;
  finishDate: Date;
  location: string;
  locationUrl: string;
  website: string;
}

interface IProps {
  post: Post;
}

interface IState {
  conferences: Conference[];
  activeIndex: string | null;
  invited: string[];
}

export class Home extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      conferences: [],
      activeIndex: null,
      invited: []
    }
  }

  componentDidMount() {
    this._loadConferences();
  }

  _loadConferences() {
    this.setState({
      conferences: [{
        id: '6',
        name: 'Devcon 6',
        startDate: new Date('2021-04-21T10:00:00Z'),
        finishDate: new Date('2021-04-28T20:00:00Z'),
        location: 'Bogota, Colombia',
        locationUrl: 'https://www.openstreetmap.org/search?whereami=1&query=4.7012%2C-74.1484#map=13/4.7012/-74.1484',
        website: 'https://archive.devcon.org/'
      }, {
        id: '5',
        name: 'Devcon 5',
        startDate: new Date('2019-10-08T10:00:00Z'),
        finishDate: new Date('2019-10-11T20:00:00Z'),
        location: 'Osaka, Japan',
        locationUrl: 'https://www.openstreetmap.org/search?whereami=1&query=4.7012%2C-74.1484#map=13/4.7012/-74.1484',
        website: 'https://archive.devcon.org/devcon-5/details'
      }, {
        id: '4',
        name: 'Devcon 4',
        startDate: new Date('2018-10-30T10:00:00Z'),
        finishDate: new Date('2018-11-02T20:00:00Z'),
        location: 'Prague, Czech Republic',
        locationUrl: 'https://www.openstreetmap.org/search?whereami=1&query=4.7012%2C-74.1484#map=13/4.7012/-74.1484',
        website: 'https://archive.devcon.org/devcon-4/details'
      }, {
        id: '3',
        name: 'Devcon 3',
        startDate: new Date('2017-11-01T10:00:00Z'),
        finishDate: new Date('2017-11-04T20:00:00Z'),
        location: 'Cancun, Mexico',
        locationUrl: 'https://www.openstreetmap.org/search?whereami=1&query=4.7012%2C-74.1484#map=13/4.7012/-74.1484',
        website: 'https://archive.devcon.org/devcon-3/details'
      }, {
        id: '2',
        name: 'Devcon 2',
        startDate: new Date('2016-09-19T10:00:00Z'),
        finishDate: new Date('2016-09-21T20:00:00Z'),
        location: 'Shanghai, China',
        locationUrl: 'https://www.openstreetmap.org/search?whereami=1&query=4.7012%2C-74.1484#map=13/4.7012/-74.1484',
        website: 'https://archive.devcon.org/devcon-3/details'
      }, {
        id: '1',
        name: 'Devcon 1',
        startDate: new Date('2015-11-09T10:00:00Z'),
        finishDate: new Date('2015-11-13T20:00:00Z'),
        location: 'London, United Kingdom',
        locationUrl: 'https://www.openstreetmap.org/search?whereami=1&query=4.7012%2C-74.1484#map=13/4.7012/-74.1484',
        website: 'https://archive.devcon.org/devcon-3/details'
      }, {
        id: '0',
        name: 'Devcon 0',
        startDate: new Date('2014-11-24T10:00:00Z'),
        finishDate: new Date('2014-11-28T20:00:00Z'),
        location: 'Kreuzberg, Berlin',
        locationUrl: 'https://www.openstreetmap.org/search?whereami=1&query=4.7012%2C-74.1484#map=13/4.7012/-74.1484',
        website: 'https://archive.devcon.org/devcon-3/details'
      }]
    })
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
          <Icon name='dropdown' />{c.name} <Button index={c.id} color={isInvited(c) ? 'green' : 'blue'} floated='right' size='mini' onClick={this.buttonClick}>{isInvited(c) ? 'Invited' : 'Invite'}</Button>
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

    return (
      <div>
        <Container text style={{ textAlign: 'center' }}>
          You are about to invite<br /><span style={{ fontWeight: 'bold'}}>@{this.props.post.authorUsername}</span><br />to discuss the following topic
        </Container>

        <TweetCard post={this.props.post} card />

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
