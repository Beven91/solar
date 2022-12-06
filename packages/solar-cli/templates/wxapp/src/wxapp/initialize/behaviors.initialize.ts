/**
 * @module PageBehaviorInitialize
 * @description 页面共享行为初始化，主要用于使小程序页面，支持全局监听，以及混入
 */
import { Adapter } from 'solar-core';

const scope = this as any;

// 原始小程序 Page 函数
const Native = scope.Page;

// 扩展页面注册
scope.Page = function(options: any) {
  const behaviors = {
    // 全局点击监听
    onVenylogClick() {

    },
    onLoad() {

    },
  };

  // 调用原生页面注册
  Native(Adapter.adapterObject(options, behaviors));
};
