import './index.scss';
import React from 'react';
import { UserOutlined, LockOutlined, CopyrightOutlined } from '@ant-design/icons';
import { Button, Input, Checkbox, Form } from 'antd';
import { store } from '$projectName$-provider';
import model from './model';

const FormItem = Form.Item;

@store.connect(model)
export default class IndexScreen extends React.Component<any, any> {
  rules = {
    userName: [{ required: true, message: '请输入用户名' }],
    userPassword: [{ required: true, message: '请输入密码' }],
  }

  // 提交登录
  handleSubmit = (values: any) => {
    this.props.ajaxUserLogin(values);
  };

  /**
   * 渲染组件
   */
  render() {
    const { loading } = this.props;
    return (
      <div className="login-wrapper">
        <div className="login">
          <div className="logo">
            <div className="logo-header">phoenix</div>
            <div className="logo-desc"> 一个由solar生成的，通用后台方案 </div>
          </div>
          <div className="login-container">
            <div className="login-body">
              <div className="login-title">后台系统登录</div>
              <Form onFinish={this.handleSubmit} className="login-form">
                <FormItem
                  name="userName"
                  rules={this.rules.userName}
                  hasFeedback
                >
                  <Input size="large" prefix={<UserOutlined />} placeholder="用户名" />
                </FormItem>
                <FormItem
                  name="userPassword"
                  hasFeedback
                >
                  <Input size="large" prefix={<LockOutlined />} type="password" placeholder="密码" />
                </FormItem>
                <FormItem
                  name="autoLogin"
                >
                  <Checkbox>
                    <span className="remember">记住密码</span>
                  </Checkbox>
                  <a className="forgot" href="/#forgot">
                    忘记密码
                  </a>
                </FormItem>
                <FormItem>
                  <Button loading={loading} htmlType="submit" type="primary" block size="large">
                    登录
                  </Button>
                </FormItem>
              </Form>
            </div>
            <div className="login-footer">
              <div className="copy-right">
                Copyright
                <CopyrightOutlined className="icon-copy-right" />
                2019 Solar
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
