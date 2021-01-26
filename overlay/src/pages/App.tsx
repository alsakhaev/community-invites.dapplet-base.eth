import React from 'react';
import './App.css';
import { dappletInstance, Post, Profile, Settings } from '../dappletBus';
import { Segment, Loader, Menu, Input, InputOnChangeData, Label, Icon } from 'semantic-ui-react';
import { Conferences } from './Conferences';
import { DiscussionTab } from './DiscussionTab';
// import { Topics } from '../pages/Topics';
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
  teamInputError: boolean;
}

export class App extends React.Component<IProps, IState> {

  private _api?: Api;
  private _teamIdInputRef: any;

  constructor(props: IProps) {
    super(props);
    this.state = { post: undefined, profile: undefined, settings: undefined, activeIndex: -1, postsDefaultSearch: '', key: 0, userSettings: undefined, teamLoading: false, teamInputVisible: false, teamInputError: false };

    dappletInstance.onData(async ({ post, profile, settings }) => {
      this._api = new Api(settings.serverUrl);

      if (profile) {
        const userSettings = await this._api.getUserSettings(profile.namespace, profile.username);
        this.setState({ userSettings });
      }

      this.setState({ post, profile, settings, activeIndex: profile ? 2 : 1, key: Math.random() });
    });

    this._teamIdInputRef = React.createRef();
  }

  componentDidMount() {
    document.getElementsByClassName('loader-container')?.[0]?.remove();
  }

  postsClickHandler = (conferenceShortName: string, username: string) => {
    this.setState({ activeIndex: 2, postsDefaultSearch: `conference:${conferenceShortName} user:${username}`, key: Math.random() });
  }

  changeTab(activeIndex: number) {
    this.setState({ activeIndex, key: Math.random(), postsDefaultSearch: '' });
    if (activeIndex === 1 || activeIndex === 2 || activeIndex === 3) {
      this.setState({ post: undefined });
    }
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
        this.setState({ userSettings, teamInputVisible: false, key: Math.random() });
      }
    } catch (err) {
      console.error(err);
      this.setState({ teamInputError: true })
    } finally {
      this.setState({ teamLoading: false });
    }
  }

  async removeTeam() {
    try {
      const s = this.state;
      await this._api!.setUserSettings(s.profile!.namespace, s.profile!.username, {});
      const userSettings = await this._api!.getUserSettings(s.profile!.namespace, s.profile!.username);
      this.setState({ userSettings, activeIndex: (this.state.activeIndex === 3) ? 1 : this.state.activeIndex, key: Math.random() });
    } catch (err) {
      console.error(err);
    } finally {
      this.setState({ teamLoading: false });
    }
  }

  onKeyDownHandler(e: any) {
    if (e.keyCode === 13) {
      this.onTeamIdChange(e, { value: e.target.value });
    }
  }

  onEnterClickHandler() {
    const value = this._teamIdInputRef.current.inputRef.current.value;
    const _: any = null;
    this.onTeamIdChange(_, { value });
  }

  // onEdit(post: Post, profile: Profile, conferenceId: number) {
  //   this.setState({ post, activeIndex: 0, key: Math.random() });
  // }

  render() {

    const s = this.state;

    if (!s.settings) {
      return (
        <div className="App-container" style={{ padding: '15px' }}>
          <Segment>
            <Loader active inline='centered'>Context waiting</Loader>
          </Segment>
        </div>
      );
    }

    if (!s.profile) {
      return (<div className="App-container" style={{ padding: '15px' }}>
        <Segment>
          Please login to Twitter to continue
        </Segment>
      </div>)
    }

    return (
      <div className="App-container">
        <div style={{ padding: '15px 15px 0 15px' }}>
          <div>
            <span>Your Team: </span>
            {(s.userSettings?.teamId && s.teamInputVisible === false) ?
              <Label color='blue' as='a' onClick={() => this.setState({ teamInputVisible: true })}>{s.userSettings?.teamName}<Icon loading={s.teamLoading} name='close' onClick={(e: any) => (e.stopPropagation(), this.removeTeam())} /></Label> :
              <Input
                defaultValue={s.userSettings?.teamId}
                style={{ width: '25em' }}
                loading={s.teamLoading}
                size='mini'
                placeholder='Team ID'
                onChange={() => this.setState({ teamInputError: false })}
                onKeyDown={this.onKeyDownHandler.bind(this)}
                ref={this._teamIdInputRef}
                error={this.state.teamInputError}
                action={{
                  icon: {
                    name: 'level down',
                    rotated: 'clockwise',
                    size: 'small'
                  },
                  onClick: () => this.onEnterClickHandler()
                }}
              />}
          </div>
          <Menu pointing secondary style={{ margin: '0.5em 0 0 0' }}>
            {/* {s.profile ? <Menu.Item
              name='Invite'
              active={s.activeIndex === 0}
              onClick={() => this.changeTab(0)}
            /> : null} */}
            <Menu.Item
              name='Discussions'
              active={s.activeIndex === 2}
              onClick={() => this.changeTab(2)}
            />
            <Menu.Item
              name='Conferences'
              active={s.activeIndex === 1}
              onClick={() => this.changeTab(1)}
            />
            {/* {(s.userSettings?.teamId) ? <Menu.Item
              name='Topics'
              active={s.activeIndex === 3}
              onClick={() => this.changeTab(3)}
            /> : null} */}
            <Menu.Item
              content={<>
                Dashboard
                <Icon name='external' style={{ marginLeft: '8px' }} />
              </>}
              title='Open Dashboard in new tab'
              style={{ cursor: 'pointer' }}
              onClick={() => window.open(`https://community-invite-dashboard.herokuapp.com/${(s.userSettings?.teamId) ? '#/?teamId=' + s.userSettings?.teamId : ''}`, '_blank')}
            />
          </Menu>
        </div>

        <div style={{ flex: '1', overflow: 'auto', padding: '15px' }}>

          {/* {(s.activeIndex === 0) ? <Invite profile={s.profile} post={s.post} onPostsClick={this.postsClickHandler} settings={s.settings!} key={s.key} /> : null} */}
          {(s.activeIndex === 1) ? <Conferences profile={s.profile} onPostsClick={this.postsClickHandler} settings={s.settings!} key={s.key} /> : null}
          {(s.activeIndex === 2) ? <DiscussionTab post={s.post} profile={s.profile} defaultSearch={s.postsDefaultSearch} settings={s.settings!} key={s.key} userSettings={s.userSettings} /> : null}
          {/* {(s.activeIndex === 3) ? <Topics profile={s.profile} defaultSearch={s.postsDefaultSearch} settings={s.settings!} key={s.key} userSettings={s.userSettings} /> : null} */}

        </div>
      </div>
    );
  }
}