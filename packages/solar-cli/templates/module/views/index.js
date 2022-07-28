import React from 'react';
import { Base, Layout } from 'solar-mobile';
import { } from '$components$';
import { } from 'antd-mobile';

export default class $name$Screen extends Base {
  static navigationOptions = {
    title: '$name$',
  }

  constructor(props) {
    super(props, '$name$');
  }

  headerOption = {

  }

  /**
   * 渲染组件
   */
  render() {
    return (
      <Layout className="$cls$" headerOption={this.headerOption}>$name$</Layout>
    );
  }
}
