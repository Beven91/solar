/**
 * @name ResizeObserver
 * @description
 *      一个用于监听element元素resize变化的监听类
 */
import './requestAnimation';

const mGlobal = global as any;

class CustResizeObserver {
  private callback: Function

  private observes: Array<any>

  /**
   * 构造函数
   * @param {Function} callback 当监听元素resize时的回调函数
   */
  constructor(callback: Function) {
    if (typeof callback !== 'function') {
      throw new Error('callback 参数必须为函数');
    }
    this.callback = callback;
    this.observes = [];
  }

  /**
   * 添加一个dom元素resize监听
   * @param { Element } element 要监听尺寸变化的元素
   */
  observe(element: any) {
    if (!element) {
      return;
    } else if (element.__resizeListenered) {
      // 如果已监听 则不进行重复添加
      return;
    }
    this.__addObserve(element);
  }

  /**
   * 取消指定元素监听
   * @param { Element } element 要取消监听尺寸变化的元素
   */
  unobserve(element: any) {
    const observe = this.observes.find((o) => o.element === element);
    if (observe) {
      observe.element = null;
      observe.destory();
      element.__resizeListenered = false;
    }
    this.observes = this.observes.filter((o) => o !== observe);
  }

  /**
   * 断开监听
   */
  disconnect() {
    this.observes.map((o) => o.destory());
    this.observes.length = 0;
  }

  /**
   * 添加一个监听
   * @param {*} element 要监听的dom元素
   */
  __addObserve(element: any) {
    // 标记当前元素已监听
    element.__resizeListenered = true;
    // 处理样式，如果是static类型 则改成relative
    if (getComputedStyle(element).position == 'static') {
      element.style.position = 'relative';
    }
    // 当元素尺寸发生变化时的回调函数
    const resizeListener = () => this.__handleOnResize(element);
    // 创建一个resize触发元素
    const trigger = document.createElement('object');
    // 设置样式为absolute 通过absolute伸缩性来同步实际element的高度与宽度变化
    trigger.setAttribute(
      'style',
      'display: block; position: absolute; top: 0; left: 0; height: 100%; width: 100%; overflow: hidden; pointer-events: none; z-index: 1;'
    );
    // 当trigger元素加载完成后，获取window索引，来绑定resize函数
    trigger.addEventListener('load', () => {
      trigger.contentDocument.defaultView.addEventListener('resize', resizeListener);
    });
    // 设置trigger媒体类型为text/html
    trigger.type = 'text/html';
    // 设置默认地址
    trigger.data = 'about:blank';
    // 拼接对象到兼容元素中
    element.appendChild(trigger);
    // ipad下不触发onload
    if (trigger.contentDocument && trigger.contentDocument.defaultView) {
      trigger.contentDocument.defaultView.addEventListener('resize', resizeListener);
    }
    // 销毁时的清理操作
    this.observes.push({
      element,
      destory: () => {
        // 标记为未监听
        element.__resizeListenered = false;
        // 取消事件监听
        trigger.contentDocument.defaultView.removeEventListener('resize', resizeListener);
        // 移除元素
        element.removeChild(trigger);
      },
    });
  }

  /**
   * 执行元素resize事件
   */
  __handleOnResize = (element: any) => {
    cancelAnimationFrame(element.__ResizeAnimationId);
    element.__ResizeAnimationId = requestAnimationFrame(() => {
      this.callback(
        [
          {
            target: element,
            contentRect: element.getBoundingClientRect(),
          },
        ]
      );
    });
  }
}

const ResizeObserver = mGlobal.ResizeObserver ? mGlobal.ResizeObserver : CustResizeObserver;

export default ResizeObserver;
