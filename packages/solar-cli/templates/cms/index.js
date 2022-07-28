/**
 * @name $class$Module
 * @date $date$
 * @description
 *      $class$装修模块
 */
import './index.scss';
import React from 'react';
import { } from 'solar-mobile';
import PropTypes from 'prop-types';
import { RuntimeModule, genesis } from 'genesis-cms';

@genesis.runtime()
export default class $class$Module extends RuntimeModule {
  // 属性类型定义
  static propTypes = {
    // 页面对象数据
    page: PropTypes.object,
    // 模块配置数据
    data: PropTypes.object,
  }

  /**
   * 装修运行时模块描述
   */
  static get descriptor() {
    return {
      code: '$name$',
      // 当前模块是否为悬浮模块
      // position: 'absolute',
      // 当前模块默认的配置数据
      props: {
      },
    };
  }

  // 渲染组件
  render() {
    const { data = {} } = this.props;
    return (
      <div className="genesis-$name$-module">
        {data.demo || ''}
      </div>
    );
  }
}
