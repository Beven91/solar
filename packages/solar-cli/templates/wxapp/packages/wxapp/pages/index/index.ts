import { } from 'solar-core';
import { Credentials, Profile } from '$projectName$-provider';

// 配置
Page({
  // 点击授权按钮
  handlePreQueryUser() {
    wx.showLoading({ title: '登录中...' });
  },
  // 使用微信开放能力 getUserInfo 获取用户信息完毕后，开始进行登录
  handlePostQueryUser(e: any) {
    if (!e.detail.userInfo) return;
    Credentials
      .authorize()
      .then(() => this.handleAuthOK())
      .catch((ex: Error) => this.handleAuthFail(ex));
  },
  // 授权成功
  handleAuthOK() {
    wx.hideLoading();
    wx.navigateTo({ url: '/pages/home/index' });
  },
  // 授权失败
  handleAuthFail(ex: Error) {
    wx.hideLoading();
    console.error(ex);
  },
  // 小程序页面进入
  onLoad() {
    if (Profile.tk) {
      wx.navigateTo({ url: '/pages/home/index' });
    } else {
      this.setData({ credentials: 'visible' });
    }
  },
});
