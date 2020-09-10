import React from 'react';
import { HashRouter, Route, Switch } from "react-router-dom";
import './App.css';
import { Home } from './Home';
import { dappletInstance, Post, Settings } from '../dappletBus';
import { Segment, Loader } from 'semantic-ui-react';

interface IProps {
}

interface IState {
  post: Post & Settings | null;
}

export class App extends React.Component<IProps, IState> {

  constructor(props: IProps) {
    super(props);
    this.state = { post: null };
    dappletInstance.onProfileSelect((post) => this.setState({ post }));
  }

  componentDidMount() {
    document.getElementsByClassName('loader-container')?.[0]?.remove();
  }

  render() {

    if (!this.state.post) {
      return (
        <Segment>
          <Loader active inline='centered'>Context waiting</Loader>
        </Segment>
      );
    }

    return (
      <div className="App-container">
        <HashRouter>
          <Switch>
            <Route exact path="/">
              <Home post={this.state.post} />
            </Route>
          </Switch>
        </HashRouter>
      </div>
    );
  }
}
