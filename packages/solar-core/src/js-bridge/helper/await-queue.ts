

interface ContainerQueues {
  [propName: string]: Array<Function>
}

const containers = {} as ContainerQueues;

const getContainersQueue = (name: string) => containers[name] = containers[name] || [];

/**
 * 添加队列函数到等待中
 * @param {String} name 队列类型名
 * @param {Function} handler 队列函数
 */
function doAwait(name: string, handler: Function) {
  return new Promise((resolve, reject) => {
    getContainersQueue(name).push(() => {
      return Promise.resolve(handler()).then(resolve, reject);
    });
  });
}

/**
 * 等待结束，开始执行队列已经清空队列
 * @param {String} name 队列类型名
 */
function doneAwait(name: string) {
  const queues = getContainersQueue(name);
  queues.forEach((queue) => queue());
  queues.length = 0;
}

export default {
  doAwait,
  doneAwait,
};
