/**
 * @module System
 * @description 前端微服务加载器
 */

export interface SystemOptions {
  css?: boolean
  base?: string
  version?: string
  context?: InvokeOptions
}

export interface InvokeOptions {
  // 子系统渲染目标节点
  root: HTMLElement
}

export interface SystemRegistrations {
  [propName: string]: SystemRegistration
}

export interface SystemRegistration {
  // 名称
  name?: string
  // 状态
  status?: 'pending' | 'running' | 'destoryed'
  // 最后一次调用上下文
  context?: InvokeOptions
  // 运行子系统
  run: (options: InvokeOptions) => any
  // 销毁子系统
  destory: (options: InvokeOptions) => any
}

// 子系统注册字典
const registrations: SystemRegistrations = {};
const imports = {} as { [propName: string]: Promise<any> };

export default class System {
  /**
   * 加载资源
   * @param url js资源文件
   */
  private static loadJs(url: string) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.onload = resolve;
      script.onerror = reject;
      script.src = url;
      document.head.appendChild(script);
    });
  }

  /**
   * 加载css
   */
  private static loadCss(url: string) {
    return new Promise((resolve) => {
      const link = document.createElement('link');
      link.href = url;
      link.type = 'text/css';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
      resolve({});
    });
  }

  /**
   * 加载资源
   * @param url 资源链接
   */
  private static loadResource(url: string, query = '') {
    if (/\.js$/.test(url)) {
      return this.loadJs(url + query);
    }
    return this.loadCss(url + query);
  }

  /**
   * 加载子系统
   */
  static async import(name: string, options: SystemOptions) {
    // 如果已经注册过 直接返回
    if (registrations[name]) return registrations[name];
    if (!imports[name]) {
      // 保证全局唯一，防止重复加载
      imports[name] = new Promise((resolve, reject) => {
        // 开始加载子系统
        options = options || {} as SystemOptions;
        const jsUrl = `${options.base}/${name}/app.js`;
        if (options.css) {
          // 无阻塞方式加载css
          this.loadResource(`${options.base}/${name}/app.css`);
        }
        console.info(`[System] 加载子系统:${name}`);
        // 加载js资源
        this.loadResource(jsUrl, `?v=${options.version || ''}system=${name}`).then(resolve, reject);
      });
    }
    // 等待加载结束
    await imports[name];
    // 等待js执行完后，在系统中会执行register来注册，注册完成后返回
    return registrations[name];
  }

  // 获取指定子系统
  static getRegistration(name: string) {
    return registrations[name];
  }

  /**
   * 加载并且执行指定子系统
   * @param name 子系统名
   * @param options 参数
   */
  static async invoke(name: string, options: SystemOptions) {
    const registration = await this.import(name, options);
    if (!registration) {
      console.warn('[System] 找不到注册的子系统:' + name);
      return;
    }
    const runningKey = Object.keys(registrations).find((k) => registrations[k].status === 'running');
    const running = registrations[runningKey];
    if (running === registration) {
      // 如果当前子系统正在运行，则跳过
      return;
    }
    // 如果当前有其他正在执行的子系统
    if (running) {
      await this.exit(running.name);
    }
    console.info('[System] 运行子系统:' + name);
    // 执行当前子系统
    registration.status = 'running';
    return Promise.resolve(registration.run(options.context));
  }

  /**
   * 退出子系统
   * @param name
   */
  static exit(name: string) {
    const running = registrations[name];
    if (running && running.status === 'running') {
      running.status = 'destoryed';
      console.info('[System] 退出子系统:' + running.name);
      // 销毁子系统
      return Promise.resolve(running.destory(running.context));
    }
    return Promise.resolve({});
  }

  /**
   * 退出正在运行的子系统
   */
  static exitRunnings() {
    const runningKeys = Object.keys(registrations).filter((k) => registrations[k].status === 'running');
    return Promise.all(
      runningKeys.map((k) => this.exit(registrations[k].name))
    );
  }

  /**
   * 注册一个子服务
   */
  static register(name: string, registration: SystemRegistration) {
    if (registrations[name]) {
      return Promise.reject(new Error('已存在相同的子系统,请勿重复注册'));
    }
    console.info('[System] 注册子系统:' + name);
    registrations[name] = {
      status: 'pending',
      name: name,
      ...registration,
    };
    return Promise.resolve(registrations[name]);
  }
}
