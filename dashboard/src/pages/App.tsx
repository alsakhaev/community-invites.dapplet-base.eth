import React from 'react';
//import './App.css';
import { List, Image, Table, Container, Grid, Segment, Dimmer, Loader, Placeholder, Message } from 'semantic-ui-react';
import { Api, PostStat, UserStat } from '../api';
import { People } from '../components/People';
import { Topics } from '../components/Topics';
import { Filter } from '../components/Filter';

interface IProps {
  history?: any;
}

interface IState {
  posts: PostStat[];
  users: UserStat[];
  isLoading: boolean;
  selectedUser: UserStat | null;
  postFilter: { [id: string]: boolean };
}

export class App extends React.Component<IProps, IState> {

  private _api: Api;

  constructor(props: IProps) {
    super(props);
    this._api = new Api('http://localhost:3003');
    this.state = {
      posts: [],
      users: [],
      isLoading: true,
      selectedUser: null,
      postFilter: {}
    };
  }

  async componentDidMount() {
    const [posts, users] = await Promise.all([
      this._api.getPostStat(),
      this._api.getUserStat()
    ]);

    this.setState({ posts, users, isLoading: false });
  }

  onUserSelectHandler = async (user: UserStat | null) => {
    this.setState({ selectedUser: user });

    const posts = await this._api.getPostStat((user) ? { username: user.username } : undefined);
    this.setState({ posts });
  }

  onPostCheckHandler = async (post: PostStat, checked: boolean) => {
    const { postFilter } = this.state;
    postFilter[post.id] = checked;
    this.setState({ postFilter });

    const excludePosts = Object.entries(postFilter).filter(x => x[1] === false).map(x => x[0]); // SELECT postid FROM postFilter WHERE checked = false
    const users = await this._api.getUserStat({ excludePosts });
    this.setState({ users });
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
                <Message warning style={{ textAlign: 'center' }}>Invite most wanted people to your conference</Message>
                <People users={s.users} onUserSelect={this.onUserSelectHandler} />

              </Grid.Column>
              <Grid.Column>
                <h2 style={{ textAlign: 'center' }}>Topics</h2>
                <div style={{ marginBottom: '1em' }}><Filter /></div>
                <Message warning style={{ textAlign: 'center' }}>Select topics relevant for your conference</Message>
                <Topics posts={s.posts} onPostCheck={this.onPostCheckHandler} />
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Container>
      </div>
    );
  }
}