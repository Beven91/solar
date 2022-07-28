/**
 * @name ScrollView
 */
import './index.scss';
import React from 'react';
// import ResizeObserver from '../polyfill/ResizeObserver';
import Scroll, { Options } from '@better-scroll/core';
import ObserveDOM from '@better-scroll/observe-dom';
import NestedScroll from '@better-scroll/nested-scroll';

Scroll.use(NestedScroll);
Scroll.use(ObserveDOM);

const runtime = {
  groupId: 0,
};

export interface VScroll extends Scroll {
  scrollTop: number
  scrollLeft: number
  scrollHeight: number
  scrollWidth: number
  addEventListener: (name: string, handler: (e: Event) => void) => void
  removeEventListener: (name: string, handler: any) => void
}

export interface ScrollViewProps extends Options {
  // 样式名
  className?: string
  // 行内样式
  style?: React.CSSProperties
  // 滚动事件
  onScroll?: (e: any) => void,
  // 滚动到底部事件
  onEndReached?: (e: any) => void,
  // 距离底部多少距离触发onEndReached
  distanceY?: number,
  // 滚动条方向
  direction?: 'horizon' | 'vertical',
  // 是否监听滚动容器子内容高度变化
  observe?: boolean
  // 是否支持嵌套滚动
  nested?: boolean
}

export interface ScrollViewContext {
  direction: string,
  groupId: string,
  scroller: VScroll,
}

const { Consumer, Provider } = React.createContext<ScrollViewContext>({
  direction: '',
  groupId: '',
  scroller: null,
});

export default class ScrollView extends React.Component<ScrollViewProps> {
  // 默认属性值
  static defaultProps: ScrollViewProps = {
    direction: 'vertical',
    distanceY: 20,
    nested: true,
  };

  constructor(props: ScrollViewProps) {
    super(props);
    this.groupId = `scroll-view-${++runtime.groupId}`;
  }

  get nestedOptions() {
    if (this.parentGroupId) {
      return {
        groupId: this.parentGroupId,
      };
    } else if (this.props.nested) {
      return {
        groupId: this.groupId,
      };
    }
  }

  // 滚动容器配置
  get scrollOptions() {
    return {
      click: true,
      probeType: 3,
      ...this.props,
      observeDOM: this.props.observe,
      scrollX: this.props.direction === 'horizon',
      scrollY: this.props.direction === 'vertical',
      distanceY: this.props.distanceY,
      nestedScroll: this.nestedOptions,
    };
  }

  get myContext(): ScrollViewContext {
    return {
      groupId: this.groupId,
      direction: this.props.direction,
      scroller: this.scroller,
    };
  }

  groupId = ''

  /**
   * 如果当前为子滚动容器时，其父滚动容器的id
   */
  parentGroupId = ''

  /**
   * 滚动容器实例
   */
  scroller = null as VScroll

  /**
   * 滚动容器dom元素ref
   */
  containerRef = React.createRef<HTMLDivElement>()

  get isMobile() {
    return /Mobile|Android|iOS|iPhone/i.test(navigator.userAgent);
  }

  // 处理滚动到底部
  onEndReached(e: any) {
    const { onEndReached } = this.props;
    onEndReached && onEndReached(e);
  }

  // 处理滚动到底事件
  onScrollEnd(e: any) {
    const { distanceY = 0 } = this.props;
    const y = Math.abs(e.y);
    const yEnd = Math.abs(e.maxScrollY);
    if (y > 0 && yEnd > 0 && yEnd - y <= distanceY) {
      this.onEndReached(e);
    }
  }

  // 处理滚动事件
  onScroll(e: any) {
    const { onScroll } = this.props;
    onScroll && onScroll(this.createEvent('scroll'));
  }

  private createEvent(name: string) {
    return {
      type: name,
      bubbles: false,
      cancelBubble: false,
      cancelable: false,
      composed: false,
      target: this.scroller,
      currentTarget: this.scroller,
      defaultPrevented: false,
      eventPhase: 0,
      isTrusted: true,
    };
  }

  /**
   * 滚动到指定位置
   * @param dx
   * @param dy
   * @param easing
   */
  scrollTo(dx: number | null, dy: number | null, easing?: any) {
    const element = this.containerRef.current;
    if (this.scroller) {
      this.scroller.scrollTo(-dx, -dy, easing);
    } else if (element.scrollTo) {
      element.scrollTo({
        left: dx,
        top: dy,
        behavior: 'smooth',
      });
    } else {
      element.scrollLeft = dx;
      element.scrollTop = dy;
    }
  }

  defineDNature(iscroller: Scroll) {
    Object.defineProperty(iscroller, 'scrollHeight', { get: () => iscroller.content.scrollHeight });
    Object.defineProperty(iscroller, 'scrollWidth', { get: () => iscroller.content.scrollWidth });
    // 定义scrollTop属性
    Object.defineProperty(iscroller, 'scrollLeft', { get: () => Math.abs(iscroller.x) });
    // 定义scrollTop属性
    Object.defineProperty(iscroller, 'scrollTop', { get: () => Math.abs(iscroller.y) });
    // 添加addEventListener 函数
    Object.defineProperty(iscroller, 'addEventListener', {
      get: () => (name: string, handler: any) => {
        handler.__hook = (e: any) => handler(this.createEvent(name));
        iscroller.on(name, handler.__hook);
      },
    });
    // 添加addEventListener 函数
    Object.defineProperty(iscroller, 'removeEventListener', {
      get: () => (name: string, handler: any) => {
        handler = handler ? handler.__hook : handler;
        iscroller.off(name, handler);
      },
    });
    return iscroller;
  }

  // 组件渲染完成
  componentDidMount() {
    if (this.isMobile) {
      const scope = this;
      // 创建一个iscroll实例
      this.scroller = new Scroll(this.containerRef.current, this.scrollOptions as any) as VScroll;
      // 滚动事件
      this.scroller.on('scrollEnd', function() {
        return scope.onScrollEnd(this);
      });
      this.scroller.on('scroll', function() {
        return scope.onScroll(this);
      });
      this.defineDNature(this.scroller);
    }
  }

  // 组件销毁
  componentWillUnmount() {
    if (this.scroller) {
      this.scroller.destroy();
      this.scroller = null;
    }
  }

  // 渲染组件
  render() {
    const { className, direction, style, onScroll } = this.props;
    const mode = this.isMobile ? 'iscroll-viewable' : 'no-iscroll';
    const onScroll2 = this.isMobile ? null : onScroll;
    return (
      <Consumer>
        {
          (context) => {
            this.parentGroupId = context.direction === this.props.direction ? context.groupId : '';
            return (
              <div
                style={style}
                onScroll={onScroll2}
                className={`scroll-view ${mode} ${direction} ${className || ''}`}
                ref={this.containerRef}
              >
                <div className="scroll-inner-view">
                  <Provider value={this.myContext} >
                    {this.props.children}
                  </Provider>
                </div>
              </div>
            );
          }
        }
      </Consumer>
    );
  }
}
