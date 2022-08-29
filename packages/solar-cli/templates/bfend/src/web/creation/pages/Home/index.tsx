/**
 * @module HomePageView
 * @description 首页
 */
import './index.scss';
import React from 'react';

export default class HomePageView extends React.Component {
  render() {
    return (
      <div className="page-home-view">
        <p>
            一，惟初太始，道立于一，造分天地，化成万物。
        </p>
        <a
          style={{ marginTop: 20 }}
          href="#/example/list"
        >
            前往演练场{'>>'}
        </a>
      </div>
    );
  }
}