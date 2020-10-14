import React from 'react';
import { HashRouter, Route, Switch, Redirect, NavLink, useHistory, withRouter } from "react-router-dom";
import './App.css';
import { dappletInstance, Post, Profile, Settings } from '../dappletBus';
import { Segment, Loader, Tab, Menu } from 'semantic-ui-react';
import { Conferences } from './Conferences';
import { MyDiscussions } from './MyDiscussions';
import { Api } from '../api';

interface IProps {
  history?: any;
}

interface IState {
  post?: Post;
  profile?: Profile;
  settings?: Settings;
  activeIndex: number;
  postsDefaultSearch: string;
  myDiscussionsKey: number;
}

export class App extends React.Component<IProps, IState> {

  private _api?: Api;

  constructor(props: IProps) {
    super(props);
    this.state = { post: undefined, profile: undefined, settings: undefined, activeIndex: 0, postsDefaultSearch: '', myDiscussionsKey: 0 };

    dappletInstance.onData(async ({ post, profile, settings }) => {

      this._api = new Api(settings.serverUrl);

      if (profile) {
        let user = await this._api.getUser(profile.namespace, profile.username);
        if (!user) {
          user = await this._api.createUser(profile);
        }
        this.setState({ profile: user });
      }

      this.setState({ post, settings, activeIndex: 0 });
    });
  }

  componentDidMount() {
    document.getElementsByClassName('loader-container')?.[0]?.remove();
  }

  postsClickHandler = (conferenceShortName: string, username: string) => {
    this.setState({ activeIndex: 1, postsDefaultSearch: `conference:${conferenceShortName} user:${username}`, myDiscussionsKey: Math.random() });
  }

  handleTabChange = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, { activeIndex }: any) => {
    if (activeIndex === 2) {
      e.preventDefault();
      e.stopPropagation();
      window.open('https://community-invite-dashboard.herokuapp.com/', '_blank');
      return;
    };

    if (activeIndex === 1) {
      this.setState({ postsDefaultSearch: '', myDiscussionsKey: Math.random() });
    }

    this.setState({ activeIndex });
  };

  render() {

    if (!this.state.settings) {
      return (
        <Segment style={{ margin: '15px' }}>
          <Loader active inline='centered'>Context waiting</Loader>
        </Segment>
      );
    }

    const panes = [
      {
        menuItem: "Conferences",
        pane: <Tab.Pane key='conferences' style={{ padding: '0', border: 'none' }}>
          <Conferences profile={this.state.profile} post={this.state.post} onPostsClick={this.postsClickHandler} settings={this.state.settings!} />
        </Tab.Pane>,
      }, {
        menuItem: "My Discussions",
        pane: <Tab.Pane key='my-discussions' style={{ padding: '0', border: 'none' }}>
          <MyDiscussions profile={this.state.profile} defaultSearch={this.state.postsDefaultSearch} settings={this.state.settings!} key={this.state.myDiscussionsKey} />
        </Tab.Pane>
      }, {
        menuItem: "Dashboard",
        loading: true
      }
    ];

    return (
      <div className="App-container">
        <HashRouter>
          <Switch>
            <React.Fragment>
              <Tab
                menu={{ secondary: true, pointing: true }}
                panes={panes}
                activeIndex={this.state.activeIndex}
                onTabChange={this.handleTabChange}
                renderActiveOnly={false}
              />
            </React.Fragment>
          </Switch>
        </HashRouter>
      </div>
    );
  }
}