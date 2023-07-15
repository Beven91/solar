/**
 * @module Configurer
 * @description 用于提供框架内部全局配置统一对外的配置入口
 */

export type BucketType = 'public' | 'private'

export interface AliOssConfig {
  policy: string
  accessId: string
  signature: string
  host: string
  dir: string
}

export interface FileGatewayOptions {
  // 业务ID
  bizId: string
  // 是否覆盖同名文件    (true:表示同名覆盖，，false，默认值，会对文件进行重命名，重命名策略=bizId-32位随机字符串)
  overlaySameFile?: boolean
  // 只能传 private / public （private 表示存放私有云，public 表示存放公有云)
  bucketType?: BucketType
  // 存储目录  例：test1/test2/test3  (1：中间不能有空白符，包括换行符，如果有将替换去掉) overlaySameFile=true时才有效
  storeDir?: string
  // 上传文件缓存类型
  cacheType?: 'no-cache' | 'no-store' | 'public' | 'private' | 'max-age'
  // 是否为web直传模式
  web?: boolean
  [x: string]: any
}

interface ConfigOptions {
  fileGateway?: {
    data?: FileGatewayOptions,
    // web直传时的获取签名配置函数
    aliOssConfig?: (directory?: string) => Promise<AliOssConfig>
    // 上传地址
    uploadUrl: string,
    urls: {
      // 共有云地址
      public: string
      // 私有云地址
      private: string
      [x: string]: string
    }
  }
}

const options = {
  fileGateway: {
    data: {},
    urls: {},
  },
} as ConfigOptions;

export default class Configurer {
  /**
   * 配置框架配置项
   * @param {Object} data
   */
  static setup(data: ConfigOptions) {
    Object.assign(options, data || {});
  }

  static get options() {
    return options;
  }
}
