import React from 'react';
//import { HashRouter, Route, Switch, Redirect, NavLink, useHistory, withRouter } from "react-router-dom";
import './App.css';
import { dappletInstance, Post, Profile, Settings } from '../dappletBus';
import { Segment, Loader, Tab, Menu, Container, Icon } from 'semantic-ui-react';
import { Conferences } from './Conferences';
import { Invite } from './Invite';
import { MyDiscussions } from './MyDiscussions';
import { Api } from '../api';
import { Topics } from '../pages/Topics';

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
  myInvitesKey: number;
}

export class App extends React.Component<IProps, IState> {

  private _api?: Api;

  constructor(props: IProps) {
    super(props);
    this.state = { post: undefined, profile: undefined, settings: undefined, activeIndex: -1, postsDefaultSearch: '', myDiscussionsKey: 0, myInvitesKey: 0 };

    dappletInstance.onData(async ({ post, profile, settings }) => {
      this._api = new Api(settings.serverUrl);
      this.setState({ post, profile, settings, activeIndex: profile ? 0 : 1, myInvitesKey: Math.random() });
    });
  }

  componentDidMount() {
    document.getElementsByClassName('loader-container')?.[0]?.remove();
  }

  postsClickHandler = (conferenceShortName: string, username: string) => {
    this.setState({ activeIndex: 2, postsDefaultSearch: `conference:${conferenceShortName} user:${username}`, myDiscussionsKey: Math.random() });
  }

  changeTab(activeIndex: number) {
    if (activeIndex === 2 || activeIndex === 3) {
      this.setState({ postsDefaultSearch: '', myDiscussionsKey: Math.random() });
    }

    this.setState({ activeIndex });
  }

  render() {

    const s = this.state;

    if (!s.settings) {
      return (
        <Segment style={{ margin: '15px' }}>
          <Loader active inline='centered'>Context waiting</Loader>
        </Segment>
      );
    }

    return (
      <div className="App-container">
        {/* <div style={{ textAlign: 'end'}}>
          <a href='#' onClick={() => window.open('https://community-invite-dashboard.herokuapp.com', '_blank')}><Icon name='external'/>Dashboard</a>
        </div> */}
        <React.Fragment>
          <div style={{ padding: '15px', position: 'fixed', top: '0', left: '0', width: '100%', zIndex: 1000, backgroundColor: '#fff' }}>
            <Menu pointing secondary>
              {s.profile ? <Menu.Item
                name='Invite'
                active={s.activeIndex === 0}
                onClick={() => this.changeTab(0)}
              /> : null}
              <Menu.Item
                name='Conferences'
                active={s.activeIndex === 1}
                onClick={() => this.changeTab(1)}
              />
              <Menu.Item
                name='Discussions'
                active={s.activeIndex === 2}
                onClick={() => this.changeTab(2)}
              />
              <Menu.Item
                name='Topics'
                active={s.activeIndex === 3}
                onClick={() => this.changeTab(3)}
              />
              <Menu.Item
                icon='dashboard'
                title='Open Dashboard in new tab'
                style={{ cursor: 'pointer'}}
                onClick={() => window.open('https://community-invite-dashboard.herokuapp.com', '_blank')}
              />
            </Menu>
          </div>

          <div style={{ margin: '4em 0' }}>

            {s.profile ? <div style={{ display: (s.activeIndex === 0) ? 'block' : 'none', paddingBottom: '10px' }}>
              <Invite profile={s.profile} post={s.post} onPostsClick={this.postsClickHandler} settings={s.settings!} key={s.myInvitesKey} />
            </div> : null}

            <div style={{ display: (s.activeIndex === 1) ? 'block' : 'none', paddingBottom: '10px' }}>
              <Conferences profile={s.profile}  onPostsClick={this.postsClickHandler} settings={s.settings!} />
            </div>

            <div style={{ display: (s.activeIndex === 2) ? 'block' : 'none', paddingBottom: '10px' }}>
              <MyDiscussions profile={s.profile} defaultSearch={s.postsDefaultSearch} settings={s.settings!} key={s.myDiscussionsKey} />
            </div>

            <div style={{ display: (s.activeIndex === 3) ? 'block' : 'none', paddingBottom: '10px' }}>
              <Topics profile={s.profile} defaultSearch={s.postsDefaultSearch} settings={s.settings!} key={s.myDiscussionsKey} />
            </div>
          </div>

        </React.Fragment>
      </div>
    );
  }
}