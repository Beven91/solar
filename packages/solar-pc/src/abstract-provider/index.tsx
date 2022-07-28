/**
 * @module AbstractProvider
 * @description 统一配置fluxy-pc
 */
import React, { Consumer, Provider } from 'react';
import { AbstractConfig } from '../interface';

interface AbstractProvider extends Provider<AbstractConfig> {
  Consumer: Consumer<AbstractConfig>
  Context: React.Context<AbstractConfig>
  defaultMediaDefinitions: {
    [propName: string]: {
      accept: string
      max: number
    }
  }
}

const defaultMediaDefinitions = {
  image: {
    accept: 'image/jpg, image/jpeg, image/png,image/webp',
    max: 1024 * 1024 * 3,
  },
  audio: {
    accept: 'audio/*',
    max: 1024 * 1024 * 150,
  },
  video: {
    accept: 'video/*',
    max: 1024 * 1024 * 150,
  },
};

const Context = React.createContext<AbstractConfig>({
  // 全局输入框值格式化函数
  valueFormatter: (v: any) => {
    if (typeof v === 'string') {
      return v.trim().replace(/^(\r\n|\n)/, '');
    }
    return v;
  },
  fetchOption: () => Promise.resolve({ models: [], count: 0 }),
  // 统一配置上传文件接口
  upload: {
    media: defaultMediaDefinitions,
  },
});

const ContextProvider = Context.Provider as AbstractProvider;

ContextProvider.Consumer = Context.Consumer;

ContextProvider.defaultMediaDefinitions = defaultMediaDefinitions;

ContextProvider.Context = Context;

export default ContextProvider;


