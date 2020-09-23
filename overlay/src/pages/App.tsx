import React from 'react';
import { HashRouter, Route, Switch, Redirect, NavLink, useHistory, withRouter } from "react-router-dom";
import './App.css';
import { Invite } from './Invite';
import { dappletInstance, Post, Profile, Settings } from '../dappletBus';
import { Segment, Loader, Tab, Menu } from 'semantic-ui-react';
import { Conferences } from './Conferences';
import { MyMeetups } from './MyMeetups';
import { Merged } from './Merged';
import { Posts } from './Posts';

interface IProps {
  history?: any;
}

interface IState {
  post?: Post;
  profile?: Profile;
  settings?: Settings;
  activeIndex: number;
  postsDefaultSearch: string;
}

export class App extends React.Component<IProps, IState> {

  constructor(props: IProps) {
    super(props);
    this.state = { post: undefined, profile: undefined, settings: undefined, activeIndex: 0, postsDefaultSearch: '' };
    dappletInstance.onData(({ post, profile, settings }) => this.setState({ post, profile, settings }));
  }

  componentDidMount() {
    document.getElementsByClassName('loader-container')?.[0]?.remove();
  }

  postsClickHandler = (conferenceId: string, username: string) => {
    this.setState({ activeIndex: 1, postsDefaultSearch: `conferenceId:${conferenceId} username:${username}` });
  }

  handleTabChange = (e: any, { activeIndex }: any) => this.setState({ activeIndex });

  render() {

    if (!this.state.settings) {
      return (
        <Segment>
          <Loader active inline='centered'>Context waiting</Loader>
        </Segment>
      );
    }

    const panes = [
      // {
      //   menuItem: "Community Invite",
      //   render: () => <Tab.Pane as={() => <Invite profile={this.state.profile} post={this.state.post as any} />} />,
      // }, {
      //   menuItem: "Confs",
      //   render: () => <Tab.Pane as={() => <Conferences profile={this.state.profile} post={this.state.post as Post} />} />,
      // }, {
      //   menuItem: "My Meetups",
      //   render: () => <Tab.Pane as={() => <MyMeetups profile={this.state.profile} post={this.state.post as Post} />} />,
      // }, 
      {
        menuItem: "Conferences",
        render: () => <Tab.Pane as={() => <Merged profile={this.state.profile} post={this.state.post as Post} onPostsClick={this.postsClickHandler} />} />,
      }, {
        menuItem: "Posts",
        render: () => <Tab.Pane as={() => <Posts defaultSearch={this.state.postsDefaultSearch}/>} />,
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
              />
            </React.Fragment>
          </Switch>
        </HashRouter>
      </div>
    );
  }
}