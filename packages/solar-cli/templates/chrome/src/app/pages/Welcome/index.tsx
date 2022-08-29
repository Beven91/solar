import './index.scss';
import React from 'react';
import logo from '../../../../logo.png';
import reload from './images/reload.png';

export default class App extends React.Component {
  render() {
    return (
      <div className="welcome-container">
        <div className="description">
          <img alt="logo" className="logo" src={logo} />
          <div className="h1">
            Chrome扩展开发服务已启动！
            <div className="tip">
              如果您还没有添加扩展程序到Chrome,可以通过Chrome扩展程序管理加载已解压扩展程序 选择当前工程的
              <span className="dir">dist</span>
              目录
            </div>
          </div>
          <div>当前开发服务支持热更新,改动代码会立即响应。</div>
          <div className="center">
            <div>
              <span className="h2">调试Popup</span>
              (点击浏览器右上角的扩展程序图标即可)
            </div>
            <div>
              <span className="h2">调试Dev-Tools</span>
              (右击页面：审查元素，定位到添加的Tab页)
            </div>
            <div>
              <span className="h2">调试Content-Script</span>
              (当前页面右侧的悬浮面板就是)
            </div>
          </div>
          <div>
            如果您修改了
            <span className="highlight">manifest.json</span>
          </div>
          <div>您需要手动去Chrome扩展程序管理中点击刷新按钮，刷新当前扩展程序。</div>
          <img alt="刷新指示图" src={reload} className="demo" />
        </div>
      </div>
    );
  }
}
