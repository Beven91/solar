import React from 'react';
import { HashRouter, Switch, Route } from 'react-router-dom';
import loadable from '@loadable/component';
import { NotFoundView } from 'solar-pc';

const Example = loadable(() => import('../pages/Example/index'));
/* GENERATE-ROUTE-IMPORT*/

export default class ReduxRouter extends React.Component {
  render() {
    return (
      <HashRouter>
        <Switch>
          <Route path="/$projectName$">
            <HashRouter basename="/$projectName$">
              <Switch>
                <Route path="/example/:action?/:id?" component={Example} />
                {/* GENERATE-ROUTE*/}
                <Route component={NotFoundView} />
              </Switch>
            </HashRouter>
          </Route>
        </Switch>
      </HashRouter>
    );
  }
}