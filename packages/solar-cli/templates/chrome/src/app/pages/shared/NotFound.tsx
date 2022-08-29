import './index.scss';
import { Empty } from 'antd';
import React from 'react';

export default class Notfound extends React.Component {
  render() {
    return (
      <div className="not-found">
        <Empty description="我想，您肯定是迷路了...." />
      </div>
    );
  }
}
