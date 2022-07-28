/**
 * @module Service
 * @name：接口服务基础类
 * @description：接口服务类
 */
import Network from '../network';
import { NetworkOptions } from '../network/types';

export default class Service extends Network {
  constructor(options?: NetworkOptions) {
    super(options);
  }
}
