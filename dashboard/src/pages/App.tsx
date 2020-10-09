import React from 'react';
//import './App.css';
import { List, Image, Table, Container, Grid, Segment, Dimmer, Loader, Placeholder, Message } from 'semantic-ui-react';
import { Api, PostStat, UserStat } from '../api';
import { UsersTableMini } from '../components/UsersTableMini';
import { TopicTable2 } from '../components/TopicTable2';
import { Filter } from '../components/Filter';

interface IProps {
  history?: any;
}

interface IState {
  posts: PostStat[];
  users: UserStat[];
  isLoading: boolean;
}

export class App extends React.Component<IProps, IState> {

  private _api: Api;

  constructor(props: IProps) {
    super(props);
    this._api = new Api('https://community-invite.herokuapp.com');
    this.state = {
      posts: [],
      users: [],
      isLoading: true
    };
  }

  async componentDidMount() {
    const [posts, users] = await Promise.all([
      this._api.getPostStat(),
      this._api.getUserStat()
    ]);

    this.setState({ posts, users, isLoading: false });
  }

  render() {
    const s = this.state;

    if (s.isLoading) {
      const loader = <Placeholder fluid>
        <Placeholder.Header image>
          <Placeholder.Line />
          <Placeholder.Line />
        </Placeholder.Header>
        <Placeholder.Paragraph>
          <Placeholder.Line />
          <Placeholder.Line />
          <Placeholder.Line />
        </Placeholder.Paragraph>
      </Placeholder>;

      return <div style={{ padding: '40px 40px 0 40px' }}>
        <Container>
          <h1 style={{ textAlign: 'center' }}>Most Wanted</h1>
          <Grid divided='vertically'>
            <Grid.Row columns={2}>
              <Grid.Column>
                <h2 style={{ textAlign: 'center' }}>People</h2>
                {loader}

              </Grid.Column>
              <Grid.Column>
                <h2 style={{ textAlign: 'center' }}>Topics</h2>
                {loader}
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Container>
      </div>
    }


    return (
      <div style={{ padding: '40px 40px 0 40px' }}>
        <Container >
          <h1 style={{ textAlign: 'center' }}>Most Wanted</h1>
          <Grid divided='vertically' stackable >
            <Grid.Row columns={2} >
              <Grid.Column >
                <h2 style={{ textAlign: 'center' }}>People</h2>
                <div style={{ marginBottom: '1em' }}><Filter /></div>
                <Message info>Invite most wanted people to your conference</Message>
                <UsersTableMini users={s.users} />

              </Grid.Column>
              <Grid.Column>
                <h2 style={{ textAlign: 'center' }}>Topics</h2>
                <div style={{ marginBottom: '1em' }}><Filter /></div>
                <Message info>Select topics relevant for your conference</Message>
                <TopicTable2 posts={s.posts} />
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Container>
      </div>
    );
  }
}