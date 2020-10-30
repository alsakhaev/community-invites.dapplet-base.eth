import React from 'react';
//import './App.css';
import { Container, Grid, Placeholder, Input, Select, Label } from 'semantic-ui-react';
import { Api, PostStat, UserStat } from '../api';
import { People } from '../components/People';
import { Topics } from '../components/Topics';
import SearchString from 'search-string';


interface IProps {
  history?: any;
}

interface IState {
  posts: (PostStat & { checked?: boolean })[];
  users: UserStat[];
  isLoading: boolean;
  selectedUser: UserStat | null;
  postFilter: { [id: string]: boolean };
  peopleFilter: string;
  topicsFilter: string;
  isTopicsLoading: boolean;
  isPeopleLoading: boolean;
  teamId: string | null;
  teamName: string | null;
}

const peopleFilterOptions = [{
  key: 'all',
  text: 'All',
  value: 'top:10'
}, {
  key: 'top-followers',
  text: 'Top Followers',
  value: 'top:10 sort:followers-desc'
}, {
  key: 'top-rating',
  text: 'Top Rating',
  value: 'top:10 sort:rating-desc'
}];

const topicsFilterOptions = [{
  key: 'all',
  text: 'All',
  value: 'top:100'
}, {
  key: 'last-changed',
  text: 'Last Changed',
  value: 'top:100 -checked:undefined'
}, {
  key: 'ignored',
  text: 'Ignored',
  value: 'top:100 checked:false'
}];

export class App extends React.Component<IProps, IState> {

  private _api: Api;

  constructor(props: IProps) {
    super(props);
    this._api = new Api(process.env.REACT_APP_API_URL as string);
    const url = new URL(window.location.href);
    const teamId = (url.hash.indexOf('#') !== -1) ? new URLSearchParams(url.hash.substr(url.hash.indexOf('#') + 2)).get('teamId') : null;
    this.state = {
      posts: [],
      users: [],
      isLoading: true,
      selectedUser: null,
      postFilter: {},
      peopleFilter: topicsFilterOptions[0].value,
      topicsFilter: topicsFilterOptions[0].value,
      isTopicsLoading: true,
      isPeopleLoading: true,
      teamId: teamId,
      teamName: null
    };
  }

  async componentDidMount() {
    await this.refreshData();
    this.setState({ isLoading: false });
  }

  async refreshData() {
    await Promise.all([
      this.refreshTopics(),
      this.refreshPeople(),
      this.refreshTeam()
    ]);
  }

  async refreshTopics(topicsFilter: string = this.state.topicsFilter) {
    this.setState({ isTopicsLoading: true });

    const query = SearchString.parse(topicsFilter).getParsedQuery();
    const filters: any = {};
    if (this.state.teamId) filters.teamId = this.state.teamId;

    if (query.top) try { filters.limit = parseInt(query.top); } catch (_) { }
    if (query.author) filters.username = Array.isArray(query.author) ? query.author[0] : query.author;

    let posts: (PostStat & { checked?: boolean })[] = await this._api.getPostStat(filters);
    posts = posts.map(x => ({ ...x, checked: this.state.postFilter[x.id] }));

    if (query.exclude?.checked?.[0]) posts = posts.filter(x => {
      const mapping: any = { 'undefined': undefined, 'true': true, 'false': false };
      const value = mapping[query.exclude.checked[0]];
      return x.checked !== value;
    });

    if (query.checked?.[0]) posts = posts.filter(x => {
      const mapping: any = { 'undefined': undefined, 'true': true, 'false': false };
      const value = mapping[query.checked[0]];
      return x.checked === value;
    });

    this.setState({ posts, isTopicsLoading: false });
  }

  async refreshPeople(peopleFilter: string = this.state.peopleFilter) {
    this.setState({ isPeopleLoading: true });

    const query = SearchString.parse(peopleFilter).getParsedQuery();
    const filters: any = {};
    if (this.state.teamId) filters.teamId = this.state.teamId;

    if (query.top) try { filters.limit = parseInt(query.top); } catch (_) { }
    if (query.exclude.posts) filters.excludePosts = query.exclude.posts;

    let users = await this._api.getUserStat(filters);

    if (query.sort) users = users.sort((a, b) => {
      if (query.sort[0] === 'rating-asc') return a.agg_invitations_to_count > b.agg_invitations_to_count ? 1 : -1;
      if (query.sort[0] === 'rating-desc') return a.agg_invitations_to_count < b.agg_invitations_to_count ? 1 : -1;
      if (query.sort[0] === 'followers-asc') return a.users_to_count > b.users_to_count ? 1 : -1;
      if (query.sort[0] === 'followers-desc') return a.users_to_count < b.users_to_count ? 1 : -1;
      return 0;
    })

    this.setState({ users, isPeopleLoading: false });
  }

  async refreshTeam() {
    try {
      const s = this.state;
      if (s.teamId) {
        const team = await this._api.getTeam(s.teamId);
        this.setState({ teamName: team.name });
      }
    } catch (err) {
      console.error(err);
      this.setState({ teamId: null });
    }
  }

  onUserSelectHandler = async (user: UserStat | null) => {
    this.setState({ selectedUser: user });
    const { topicsFilter } = this.state;
    const searchString = SearchString.parse(topicsFilter);

    searchString.removeKeyword('author', false);

    if (user) {
      searchString.addEntry('author', user?.username, false);
    }
    this.setTopicsFilter(searchString.toString());
  }

  onPostCheckHandler = async (post: PostStat, checked: boolean) => {
    const { postFilter } = this.state;
    postFilter[post.id] = checked;
    this.setState({ postFilter });

    const { peopleFilter } = this.state;
    const query = SearchString.parse(peopleFilter);
    if (checked) {
      query.removeEntry('posts', post.id, true);
    } else {
      query.addEntry('posts', post.id, true);
    }
    this.setPeopleFilter(query.toString());

    //const excludePosts = Object.entries(postFilter).filter(x => x[1] === false).map(x => x[0]); // SELECT postid FROM postFilter WHERE checked = false
    //const users = await this._api.getUserStat({ excludePosts, limit: 10 });
    //this.setState({ users });
  }

  setPeopleFilter(peopleFilter: string) {
    this.setState({ peopleFilter });
    this.refreshPeople(peopleFilter);
  }

  setTopicsFilter(topicsFilter: string) {
    this.setState({ topicsFilter });
    this.refreshTopics(topicsFilter);
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

          {(s.teamId) ? <div style={{ textAlign: 'center', fontSize: '1.2em' }}>
            {(s.teamName) ? <React.Fragment>Customized for <Label color='blue'>{s.teamName}</Label></React.Fragment> : 'Loading team...'}
          </div> : null}

          <Grid divided='vertically' stackable >
            <Grid.Row columns={2} >
              <Grid.Column >
                <h2 style={{ textAlign: 'center' }}>People</h2>
                <div style={{ marginBottom: '1em' }}>
                  <Input
                    fluid
                    placeholder='Search...'
                    value={this.state.peopleFilter}
                    style={{ marginBottom: '0.5em' }}
                    label={<Select style={{ width: '10em' }} compact options={peopleFilterOptions} defaultValue={peopleFilterOptions[0].value} onChange={(e, d) => this.setPeopleFilter(d.value as string)} />}
                    labelPosition='left'
                    onChange={(e, d) => this.setPeopleFilter(d.value as string)}
                  />
                </div>
                {/* <Message warning style={{ textAlign: 'center' }}>Invite most wanted people to your conference</Message> */}
                <People users={s.users} onUserSelect={this.onUserSelectHandler} loading={this.state.isPeopleLoading} />

              </Grid.Column>
              <Grid.Column>
                <h2 style={{ textAlign: 'center' }}>Topics</h2>
                <div style={{ marginBottom: '1em' }}>
                  <Input
                    fluid
                    placeholder='Search...'
                    value={this.state.topicsFilter}
                    style={{ marginBottom: '0.5em' }}
                    label={<Select style={{ width: '10em' }} compact options={topicsFilterOptions} defaultValue={topicsFilterOptions[0].value} onChange={(e, d) => this.setTopicsFilter(d.value as string)} />}
                    labelPosition='left'
                    onChange={(e, d) => this.setTopicsFilter(d.value as string)}
                  />
                </div>
                {/* <Message warning style={{ textAlign: 'center' }}>Select topics relevant for your conference</Message> */}
                <Topics posts={s.posts} onPostCheck={this.onPostCheckHandler} loading={this.state.isTopicsLoading} />
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Container>
      </div>
    );
  }
}