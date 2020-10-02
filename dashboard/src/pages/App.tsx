import React from 'react';
//import './App.css';
import { List, Image, Table, Container, Grid, Segment, Dimmer, Loader, Placeholder } from 'semantic-ui-react';
import { Api, PostStat, UserStat } from '../api';
import { UsersTable } from '../components/UsersTable';
import { TopicTable } from '../components/TopicTable';

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
    this._api = new Api('http://localhost:3003');
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
        <Container fluid>
          <h1>Community Invite: Dashboard</h1>
          <Grid divided='vertically'>
            <Grid.Row columns={2}>
              <Grid.Column>
                <h2>Most Wanted People</h2>
                {loader}

              </Grid.Column>
              <Grid.Column>
                <h2>Most Wanted Topics</h2>
                {loader}
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Container>
      </div>
    }


    return (
      <div style={{ padding: '40px 40px 0 40px' }}>
        <Container fluid>
          <h1>Community Invite: Dashboard</h1>
          <Grid divided='vertically'>
            <Grid.Row columns={2}>
              <Grid.Column>
                <h2>Most Wanted People</h2>
                <UsersTable users={s.users} />

              </Grid.Column>
              <Grid.Column>
                <h2>Most Wanted Topics</h2>
                <TopicTable posts={s.posts} />
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Container>
      </div>
    );
  }
}