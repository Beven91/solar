import './index.scss';
import React from 'react';
import { HashRouter, Route, Switch } from 'react-router-dom';
import Localhost from './domains/localhost';

export default class App extends React.Component {
  /**
   * 定义域名匹配location
   */
  get location() {
    const location = window.location;
    return {
      state: {},
      pathname: location.hostname + location.pathname,
      search: location.search,
      hash: '',
    };
  }

  render() {
    return (
      <HashRouter>
        <Switch location={this.location}>
          <Route path="localhost/" exact component={Localhost} />
        </Switch>
      </HashRouter>
    );
  }
}
