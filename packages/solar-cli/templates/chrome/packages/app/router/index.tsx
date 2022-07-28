import React from 'react';
import { HashRouter, Route, Switch } from 'react-router-dom';
import Notfound from '../pages/shared/Notfound';
import Content from '../pages/Content/index';
import Popup from '../pages/Popup/index';
import Background from '../pages/Background/index';
import DevTools from '../pages/DevTools/index';
import DevToolsTab from '../pages/DevToolsTab/index';
import Options from '../pages/Options/index';
import Welcome from '../pages/Welcome';

export default class Router extends React.Component {
  render() {
    if (window.chrome.env === 'content-script') {
      return <Content />;
    }
    return (
      <HashRouter>
        <Switch>
          {/* 开发引导页 */}
          <Route path="/welcome" exact component={Welcome} />
          {/* chrome扩展 BrowerAction 的弹屏内容 */}
          <Route path="/popup" component={Popup} />
          {/* chrome扩展 Background  要展示的内容 */}
          <Route path="/background" component={Background} />
          {/* chrome扩展 dev-tools_page 要展示的内容 */}
          <Route path="/dev-tools" component={DevTools} />
          {/* chrome扩展 dev-tools_page 的落地页面板 */}
          <Route path="/dev-tools-tab" component={DevToolsTab} />
          {/* chrome扩展 option_page 页面视图 */}
          <Route path="/options" component={Options} />
          <Route component={Notfound} />
        </Switch>
      </HashRouter>
    );
  }
}
