/**
 * @module Configurer
 * @description 用于提供框架内部全局配置统一对外的配置入口
 */

export interface AliOssConfig {
  policy: string
  accessid: string
  signatur: string
  host: string
}

interface ConfigOptions {
  cdn?: string
  oss?: {
    directory: string
    aliOssConfig: (category: string) => Promise<AliOssConfig>
  }
}

const options = {
  cdn: '',

} as ConfigOptions;

export default class Configurer {
  /**
   * 配置框架配置项
   * @param {Object} data
   */
  static setup(data: ConfigOptions) {
    Object.assign(options, data || { });
    options.cdn = options.cdn || '';
  }

  static get options() {
    return options;
  }
}
