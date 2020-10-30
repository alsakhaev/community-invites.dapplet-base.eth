import React from 'react';
import './App.css';
import { dappletInstance, Post, Profile, Settings } from '../dappletBus';
import { Segment, Loader, Menu, Input, InputOnChangeData, Label, Icon } from 'semantic-ui-react';
import { Conferences } from './Conferences';
import { Invite } from './Invite';
import { MyDiscussions } from './MyDiscussions';
import { Topics } from '../pages/Topics';
import { Api, UserSettings } from '../api';

interface IProps {
  history?: any;
}

interface IState {
  post?: Post;
  profile?: Profile;
  settings?: Settings;
  activeIndex: number;
  postsDefaultSearch: string;
  key: number;
  userSettings?: UserSettings;
  teamLoading: boolean;
  teamInputVisible: boolean;
}

export class App extends React.Component<IProps, IState> {

  private _api?: Api;

  constructor(props: IProps) {
    super(props);
    this.state = { post: undefined, profile: undefined, settings: undefined, activeIndex: -1, postsDefaultSearch: '', key: 0, userSettings: undefined, teamLoading: false, teamInputVisible: false };

    dappletInstance.onData(async ({ post, profile, settings }) => {
      this._api = new Api(settings.serverUrl);

      if (profile) {
        const userSettings = await this._api.getUserSettings(profile.namespace, profile.username);
        this.setState({ userSettings });
      }

      this.setState({ post, profile, settings, activeIndex: profile ? 0 : 1, key: Math.random() });
    });
  }

  componentDidMount() {
    document.getElementsByClassName('loader-container')?.[0]?.remove();
  }

  postsClickHandler = (conferenceShortName: string, username: string) => {
    this.setState({ activeIndex: 2, postsDefaultSearch: `conference:${conferenceShortName} user:${username}`, key: Math.random() });
  }

  changeTab(activeIndex: number) {
    this.setState({ activeIndex, key: Math.random(), postsDefaultSearch: '' });
  }

  onTeamIdChange = async (event: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => {
    try {
      const s = this.state;
      const teamId = data.value;
      this.setState({ teamLoading: true });
      const team = await this._api!.getTeam(teamId);
      if (team && team.name) {
        await this._api!.setUserSettings(s.profile!.namespace, s.profile!.username, { teamId: teamId });
        const userSettings = await this._api!.getUserSettings(s.profile!.namespace, s.profile!.username);
        this.setState({ userSettings, teamInputVisible: false });
      }
    } catch (err) {
      console.error(err);
    } finally {
      this.setState({ teamLoading: false });
    }
  }

  async removeTeam() {
    try {
      const s = this.state;
      await this._api!.setUserSettings(s.profile!.namespace, s.profile!.username, {});
      const userSettings = await this._api!.getUserSettings(s.profile!.namespace, s.profile!.username);
      this.setState({ userSettings });
    } catch (err) {
      console.error(err);
    } finally {
      this.setState({ teamLoading: false });
    }
  }

  render() {

    const s = this.state;

    if (!s.settings) {
      return (
        <div className="App-container">
          <Segment>
            <Loader active inline='centered'>Context waiting</Loader>
          </Segment>
        </div>
      );
    }

    if (!s.profile) {
      return (<div className="App-container">
        <Segment>
          You are not logged in
      </Segment>
      </div>)
    }

    return (
      <div className="App-container">
        <div style={{ padding: '15px 15px', position: 'fixed', top: '0', left: '0', width: '100%', zIndex: 1000, backgroundColor: '#fff' }}>
          <div>
            <span>Your Team: </span>
            {(s.userSettings?.teamId && s.teamInputVisible === false) ?
              <Label color='blue' as='a' onClick={() => this.setState({ teamInputVisible: true })}>{s.userSettings?.teamName}<Icon loading={s.teamLoading} name='close' onClick={(e: any) => (e.stopPropagation(), this.removeTeam())} /></Label> :
              <Input defaultValue={s.userSettings?.teamId} style={{ width: '25em' }} loading={s.teamLoading} size='mini' placeholder='Team ID' onChange={this.onTeamIdChange} />}
          </div>
          <Menu pointing secondary style={{ margin: '0.5em 0 0 0'}}>
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
              style={{ cursor: 'pointer' }}
              onClick={() => window.open(`https://community-invite-dashboard.herokuapp.com${(s.userSettings?.teamId) ? '#/?teamId=' + s.userSettings?.teamId : ''}`, '_blank')}
            />
          </Menu>
        </div>

        <div style={{ margin: '90px 0 0 0' }}>

          {s.profile ? <div style={{ display: (s.activeIndex === 0) ? 'block' : 'none', paddingBottom: '10px' }}>
            <Invite profile={s.profile} post={s.post} onPostsClick={this.postsClickHandler} settings={s.settings!} key={s.key} />
          </div> : null}

          <div style={{ display: (s.activeIndex === 1) ? 'block' : 'none', paddingBottom: '10px' }}>
            <Conferences profile={s.profile} onPostsClick={this.postsClickHandler} settings={s.settings!} key={s.key} />
          </div>

          <div style={{ display: (s.activeIndex === 2) ? 'block' : 'none', paddingBottom: '10px' }}>
            <MyDiscussions profile={s.profile} defaultSearch={s.postsDefaultSearch} settings={s.settings!} key={s.key} />
          </div>

          <div style={{ display: (s.activeIndex === 3) ? 'block' : 'none', paddingBottom: '10px' }}>
            <Topics profile={s.profile} defaultSearch={s.postsDefaultSearch} settings={s.settings!} key={s.key} userSettings={s.userSettings} />
          </div>

        </div>
      </div>
    );
  }
}