import React from 'react';
import { HashRouter, Switch, Route } from 'react-router-dom';
import loadable from '@loadable/component';
import { NotFoundView } from 'solar-pc';
import Layout from '../layouts';
import Login from '../pages/User/Login';
import HomePageView from '../pages/Home';

const Example = loadable(() => import('../pages/Example/index'));
/* GENERATE-ROUTE-IMPORT*/

export default function ReduxRouter() {
  return (
    <HashRouter>
      <Switch>
        <Route path="/" exact component={HomePageView} />
        <Route path="/login" component={Login} />
        <Route path="/">
          <HashRouter basename="/">
            <Layout>
              <Switch>
                <Route path="/example/:action?/:id?" component={Example} />
                {/* GENERATE-ROUTE*/}
                <Route component={NotFoundView} />
              </Switch>
            </Layout>
          </HashRouter>
        </Route>
      </Switch>
    </HashRouter>
  );
}