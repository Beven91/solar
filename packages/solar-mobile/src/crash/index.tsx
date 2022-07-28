/**
 * @name 异常处理组件
 * @description 用于显示一个异常视图
 */
import './index.scss';
import React from 'react';
import defaultIcon from './images/error.svg';

export interface CrashProps {
  /**
   * 要显示的消息
   */
  message?: string
  // 标题
  title?: string
  // 按钮标题
  btnText?: string
  // 自定义图片
  icon?: string
  // 自定义样式名
  className?: string
  // 自定义样式
  style?: object;
  // 点击按钮事件
  onClick?: () => void
}

export default class Crash extends React.Component<CrashProps, {}> {
  // 默认属性
  static defaultProps = {
    onClick: () => history.back(),
    className: '',
    btnText: '返回',
    title: '页面竟然崩溃了',
    message: '大侠别急，您可点击以返回试试~',
    icon: defaultIcon,
  }

  // 渲染组件
  render() {
    const { btnText, title, message, className, style, onClick, icon } = this.props;
    return (
      <div style={style} className={`crash-component  ${className}`}>
        <img className="logo" src={icon || ''} />
        < div className="crash-title" > {(title)}</div>
        {
          !message ? null : (
            <div className="crash-description" >
              {message}
            </div>
          )
        }
        { onClick ? <div className="crash-button" onClick={onClick} > {btnText} </div> : null}
        {this.props.children}
      </div>
    );
  }
}
