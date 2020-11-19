import React from 'react';
//import './App.css';
import { Container, Grid, Placeholder, Input, Select, Label, Button, Modal, Header, Icon, Dropdown } from 'semantic-ui-react';
import { Api, PostStat, UserStat } from '../api';
import { People } from '../components/People';
import { Topics } from '../components/Topics';
import SearchString from 'search-string';
import { TeamForm } from '../components/TeamForm';
import { ConferenceForm } from '../components/ConferenceForm';
import { ExportToCsv } from '../helpers/exportToCsv';
import JSZip from 'jszip';
import { saveBlob } from '../helpers/fileSaver';
import { exportToJson } from '../helpers/exportToJson';


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
  createTeamModal: boolean;
  createConferenceModal: boolean;
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
  key: 'top-team-rating',
  text: 'Top Team Rating',
  value: 'top:100 -teamrating:0 sort:teamrating-desc'
}, {
  key: 'top-team-discussions',
  text: 'Top Discussions',
  value: 'top:100 -teamrating:0 sort:discussedby-desc'
}, {
  key: 'top-discussions',
  text: 'Top Discussions',
  value: 'top:100 sort:discussedby-desc'
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
      topicsFilter: (teamId) ? topicsFilterOptions[1].value : topicsFilterOptions[0].value,
      isTopicsLoading: true,
      isPeopleLoading: true,
      teamId: teamId,
      teamName: null,
      createTeamModal: false,
      createConferenceModal: false
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

    if (query.exclude?.teamrating?.[0]) {
      try {
        const value = parseInt(query.exclude.teamrating[0]);
        posts = posts.filter(x => x.team_rating !== value);
      } catch (_) { }
    }

    if (query?.teamrating?.[0]) {
      try {
        const value = parseInt(query.teamrating[0]);
        posts = posts.filter(x => x.team_rating === value);
      } catch (_) { }
    }

    if (query.sort) posts = posts.sort((a, b) => {
      if (query.sort[0] === 'teamrating-asc') return (a.team_rating === b.team_rating || a.team_rating === undefined || b.team_rating === undefined) ? 0 : a.team_rating > b.team_rating ? 1 : -1;
      if (query.sort[0] === 'teamrating-desc') return (a.team_rating === b.team_rating || a.team_rating === undefined || b.team_rating === undefined) ? 0 : a.team_rating < b.team_rating ? 1 : -1;
      if (query.sort[0] === 'discussedby-asc') return a.discussed_by > b.discussed_by ? 1 : -1;
      if (query.sort[0] === 'discussedby-desc') return a.discussed_by < b.discussed_by ? 1 : -1;
      return 0;
    })

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

  async exportData() {

    const people = this.state.users.map(x => ({
      namespace: x.namespace,
      username: x.username,
      fullname: x.fullname,
      img: x.img,
      rating: x.agg_invitations_to_count,
      wanted_by: x.users_to_count
    }));

    const topics = this.state.posts.map(x => ({
      namespace: x.namespace,
      username: x.username,
      fullname: x.fullname,
      img: x.img,
      text: x.text,
      team_rating: (x.team_rating !== undefined) ? x.team_rating : '',
      discussed_by: x.discussed_by
    }));

    const options = {
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalSeparator: '.',
      showLabels: true,
      useTextFile: false,
      useBom: true,
      useKeysAsHeaders: true
    };
    const csvExporter = new ExportToCsv(options);

    const zip = new JSZip();

    const peopleCsv = csvExporter.generateBlob(people);
    const topicsCsv = csvExporter.generateBlob(topics);
    const peopleJson = exportToJson(people);
    const topicsJson = exportToJson(topics);

    zip.file('people.csv', peopleCsv);
    zip.file('topics.csv', topicsCsv);
    zip.file('people.json', peopleJson);
    zip.file('topics.json', topicsJson);

    const zipBlob = await zip.generateAsync({ type: "blob" });
    const prefix = this.state.teamName?.trim()?.split(' ')?.join('_')?.toLowerCase() ?? 'global';
    const name = `${prefix}-data.zip`;
    saveBlob(zipBlob, name);
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

          <div style={{ display: 'flex' }}>
            <h1 style={{ textAlign: 'center', flex: 'auto' }}>Most Wanted</h1>
            <div>
              <Dropdown
                icon='bars'
                button
                className='icon'
                basic
                direction='left'
              >
                <Dropdown.Menu>
                  <Dropdown.Header content='Advanced' />
                  <Dropdown.Item content='Export Data' onClick={() => this.exportData()} />
                  <Dropdown.Divider />
                  <Dropdown.Header content='For organizers' />
                  <TeamForm
                    open={s.createTeamModal}
                    onOpen={() => this.setState({ createTeamModal: true })}
                    onClose={() => this.setState({ createTeamModal: false })}
                  />
                  <ConferenceForm
                    open={s.createConferenceModal}
                    onOpen={() => this.setState({ createConferenceModal: true })}
                    onClose={() => this.setState({ createConferenceModal: false })}
                  />
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </div>

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
                    label={
                      <Select
                        style={{ width: '11em' }}
                        compact
                        options={peopleFilterOptions}
                        defaultValue={peopleFilterOptions[0].value}
                        onChange={(e, d) => this.setPeopleFilter(d.value as string)}
                      />}
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
                    label={
                      <Select
                        style={{ width: '11em' }}
                        compact
                        options={s.teamId ? topicsFilterOptions.filter((_, i) => i !== 3) : topicsFilterOptions.filter((_, i) => i === 0 || i === 3)}
                        defaultValue={s.teamId ? topicsFilterOptions[1].value : topicsFilterOptions[0].value}
                        onChange={(e, d) => this.setTopicsFilter(d.value as string)}
                      />}
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