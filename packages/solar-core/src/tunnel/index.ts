/**
 * @name Tunnel
 * @description 消息通道，用于执行模块之间交互
 */

interface MessageContainers {
  [propName: string]: Array<Function>
}

class Tunnel {
  private messageContainers: MessageContainers

  constructor() {
    this.messageContainers = {};
  }

  /**
   * 创建一个消息通道
   */
  create() {
    return new Tunnel();
  }

  /**
   * 获取指定消息队列信息
   * @param {*} name 消息类型名
   */
  getMessageContainer(name: string): Array<Function> {
    return this.messageContainers[name] = this.messageContainers[name] || [];
  }

  /**
   * 添加一个消息监听，当有新消息push过来时，触发绑定的事件
   * @param {String} name 消息名称
   * @param {Function} handler 绑定的消息函数
   * @param {Boolean} remove 在添加前，是否移除此类消息已绑定的所有函数
   */
  pull(name: string, handler: Function, remove = false): () => void {
    if (remove) {
      this.off(name);
    }
    this.getMessageContainer(name).push(handler);
    return () => {
      this.off(name, handler);
    };
  }

  /**
   * 推送一个消息
   * @param {String} name 要推送的消息类型
   * @param {Args } ...args 参数
   */
  push(name: string, ...args: Array<any>) {
    const handlers = this.getMessageContainer(name);
    const results = handlers.map((handler) => handler(...args));
    return results;
  }

  /**
   * 移除指定类型消息的所有监听函数
   * @param {String} name 要移除的已订阅的消息名
   * @param {Function} handler 要移除的订阅函数 不填写则移除name下所有订阅函数
   */
  off(name: string, handler?: Function) {
    const handlers = this.getMessageContainer(name);
    if (arguments.length == 1) {
      return handlers.length = 0;
    }
    const index = handlers.indexOf(handler);
    return handlers.splice(index, 1);
  }
}

export default new Tunnel();
