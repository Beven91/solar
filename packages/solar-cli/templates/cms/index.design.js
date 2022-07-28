/**
 * @name $class$Design
 * @date $date$
 * @description
 *      $class$装修模块
 */
import './index.design.scss';
import React from 'react';
import PropTypes from 'prop-types';
import { DesignModule, genesis } from 'genesis-cms';
import { Input, Form } from 'antd';
import $class$Runtime from './index.js';

const FormItem = Form.Item;

@genesis.design('$groupName$', '$path$')
export default class $class$Design extends DesignModule {
  // 组件属性类型
  static propTypes = {
    // 页面对象数据
    page: PropTypes.object,
    // 模块配置数据
    data: PropTypes.object,
    // getDesignContainer函数 返回的组件引用 ，由PropertyPane组件传入
    designRef: PropTypes.instanceOf(React.Component),
  }

  /**
   * 自定义包裹viewport runtime组件 .
   * 返回的组件会被ref到当前design组件的designRef属性
   * @param {*} children runtime组件实例
   * @param {*} props  必要的属性
   */
  static getDesignContainer(children, props) {
    return (
      <DesignContainer {...props}>{children}</DesignContainer>
    );
  }

  /**
   * 定义当前装修模块元数据信息
   */
  static get descriptor() {
    return {
      name: '模块名称',
      icon: '模块图标',
      // 当前模块绝对位置 例如：heder组件，使用排在最前面，通过指定index:0
      // index:0,
      // 当前模块是否可以拖动排序
      // sortable: false,
      // 当前模块是否能拖放多个实例到页面，设置成false 一个页面仅能添加一个此模块
      multiple: true,
      // 关联运行时组件
      component: $class$Runtime,
    };
  }

  /**
   * 保存模块配置时触发，用于最后统一处理保存参数
   * 正常情况下，使用不到此函数。
   * @param {*} data
   */
  onDesignCommit(data) {
    return data;
  }

  // 渲染组件
  render() {
    const { form, data } = this.props;
    const { getFieldDecorator } = form;
    return (
      <div>
        <FormItem
          label="Demo"
          className="no-normal img-list"
          hasFeedback
        >
          {getFieldDecorator('demo', {
            initialValue: data.demo,
            rules: [{
              required: true, message: '请输入demo',
            }],
          })(
            <Input />,
          )}
        </FormItem>
      </div>
    );
  }
}

/**
 * 用于包裹Viewport区域当前装修模块的Runtime组件,
 * 具体可以查看genesis-cms/design-layout/MirrorModule.js 的render函数
 */
class DesignContainer extends React.Component {
  static propTypes = {
    // 当前装修模块数据
    cmsModule: PropTypes.object,
  }

  // 渲染组件
  render() {
    const { className, children } = this.props;
    return (
      <div className={`genesis-$name$-module-container ${className}`}>
        {children}
      </div>
    );
  }
}
