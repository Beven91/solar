import './index.css';
import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import PropTypes from 'prop-types';

export interface PreloadProps {
  message: string
  loading: boolean
  mask: boolean
}

export default class Preload extends React.PureComponent<PreloadProps, {}> {
  private static timerId: any;

  private static preloadApp:Root;

  /**
   * 显示悬浮的Loading效果
   * @param {String} message loading效果显示的文案 默认为：请稍后...
   * @param {Boolean} mask 是否覆盖背景,使背景不可点击，默认为false
   */
  static showLoading(message: string, mask = false, delay = true) {
    clearTimeout(this.timerId);
    const container = this._getContainer();
    function render() {
      this.preloadApp = createRoot(container);
      this.preloadApp.render(<Preload message={message} mask={mask} />, container);
    }
    delay ? this.timerId = setTimeout(render, 200) : render();
    return this.closeLoading.bind(this);
  }

  /**
   * 关闭loading效果
   */
  static closeLoading() {
    clearTimeout(this.timerId);
    this.preloadApp?.unmount();
  }

  /**
   * 获取loading容器
   */
  static _getContainer() {
    const id = '__preload_container__';
    let preloadContainer = document.getElementById(id);
    if (!preloadContainer) {
      preloadContainer = document.createElement('div');
      preloadContainer.id = id;
      document.body.appendChild(preloadContainer);
    }
    return preloadContainer;
  }

  /**
   * 组件props类型定义
   */
  static propTypes = {
    // 显示的loading消息
    message: PropTypes.string,
    // loading图标类型
    loading: PropTypes.oneOf(['default']),
    // 是否覆盖背景,使背景不可点击，默认为false
    mask: PropTypes.bool,
  };

  /**
   * 组件默认props
   */
  static defaultProps = {
    message: '',
    mask: false,
    loading: 'default',
  };

  // 渲染组件
  render() {
    const { message, loading, mask } = this.props;
    const maskCls = mask ? 'am-toast-mask' : 'no-mask';
    return (
      <div className={`preload ${maskCls}`}>
        <span>
          <div className={'preload-icon ' + loading}>
            <div className="animating"></div>
          </div>
          {
            message ? <div className="preload-text">{message}</div> : ''
          }
        </span>
      </div>
    );
  }
}
