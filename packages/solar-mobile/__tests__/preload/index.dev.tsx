/**
 * @name Preload 测试
 * @date 2018-04-03
 */
import React from 'react';
import './index.css';
import Preload from '../../src/preload';

export default class ViewApp extends React.Component {
  render() {
    return (
      <div>
        <div className="button open" onClick={()=>Preload.showLoading('请稍后...')}>打开</div>
        <div className="button close" onClick={()=>Preload.closeLoading()}>关闭</div>
      </div>
    );
  }
}
