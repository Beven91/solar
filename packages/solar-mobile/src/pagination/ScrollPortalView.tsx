/**
 * 名称：ScrollView 转移视图
 * 日期：2018-03-14
 * 描述：用于实现滚动容器自定义
 *      部分情况下需要的滚动容器，不是分页列表本身，而是所处的父级dom
 *      可以使用此组件来实现一个【滚动转移】ScrollView
 * 本组件大部分代码参照antd-mobile ListView官方引用的模块 ScrollView
 * https://github.com/react-component/m-list-view/blob/master/src/ScrollView.js
 */

import React from 'react';

export interface ScrollPortalViewProps {
  // 其他属性来源于ListView组件
  // 自定义滚动容器 返回实际出现滚动条的dom元素 例如: ()=>document.getElementById('ss');
  getScrollContainer?: () => HTMLElement,
  dataSource: any,
  className?: string
  horizontal?: boolean
  onScroll?: (e: any, metrics: any) => void,
  initialListSize?: number
}

export default class ScrollPortalView extends React.Component<ScrollPortalViewProps, {}> {
  public isRemovedScroll: boolean

  /**
   * 获取当前滚动容器
   */
  get scroller() {
    return this.props.getScrollContainer();
  }

  /**
   * 获取当前滚动容器上下文参数
   */
  getMetrics = () => {
    const isVertical = !this.props.horizontal;
    return {
      visibleLength: 0,
      contentLength: this.scroller[isVertical ? 'scrollHeight' : 'scrollWidth'],
      offset: this.scroller[isVertical ? 'scrollTop' : 'scrollLeft'],
    };
  }

  onScroll = (e: any) => {
    const { onScroll } = this.props;
    onScroll(e, this.getMetrics());
  }

  /**
   * 组件创建完毕,这里执行滚动事件绑定
   */
  componentDidMount() {
    setTimeout(() => {
      if (this.scroller) {
        this.scroller.addEventListener('scroll', this.onScroll);
      }
    }, 50);
  }

  /**
   * 组件更新时
   * 来源:https://github.com/react-component/m-list-view/blob/master/src/ScrollView.js
   * 问题情景：用户滚动内容后，改变 dataSource 触发 ListView componentWillReceiveProps
   * 内容变化后 scrollTop 如果改变、会自动触发 scroll 事件，而此事件应该避免被执行
   */
  componentWillUpdate(nextProps: ScrollPortalViewProps) {
    if ((this.props.dataSource !== nextProps.dataSource ||
      this.props.initialListSize !== nextProps.initialListSize) && this.scroller) {
      this.isRemovedScroll = true;
      this.scroller.removeEventListener('scroll', this.onScroll);
    }
  }

  /**
   * 组件更新完毕
   * 重新尝试绑定滚动事件
   */
  componentDidUpdate() {
    if (this.isRemovedScroll) {
      setTimeout(() => {
        this.isRemovedScroll = false;
        this.scroller.addEventListener('scroll', this.onScroll);
      }, 0);
    }
  }

  /**
   * 组件销毁
   * 取消事件绑定
   */
  componentWillUnmount() {
    if (this.scroller) {
      this.scroller.removeEventListener('scroll', this.onScroll);
    }
  }

  /**
   * 渲染组件
   */
  render() {
    const { className, children } = this.props;
    return <div className={className} >{children}</div>;
  }
}
