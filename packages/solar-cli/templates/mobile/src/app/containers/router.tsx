import React from 'react';
import { HashRouter, Route, Switch } from 'react-router-dom';
import Notfound from 'solar-mobile/src/shared/Notfound';
import Error from 'solar-mobile/src/shared/Error';
import Home from '../pages/Home/index';

export default class Router extends React.Component {
  render() {
    return (
      <HashRouter>
        <Switch>
          <Route path="/" exact component={Home} />
          <Route path="/error" component={Error} />
          <Route component={Notfound} />
        </Switch>
      </HashRouter>
    );
  }
}
