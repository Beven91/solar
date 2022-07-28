const scope = window as any;

scope.mainAppHost = {
  // 公布React
  'react': require('react'),
  // 公布antd
  'antd': require('antd'),
  // 公布react-dom
  'reactDOM': require('react-dom'),
  // 公布moment
  'moment': require('moment'),
  // antdIcons
  'antdIcons': require('@ant-design/icons'),
  // network
  'network': require('solar-core/src/network'),
  // service
  'service': require('solar-core/src/service'),
  // dawn配置
  'coreConfig': require('solar-core/src/config'),
  // dawn-provider
  'uiConfigProvider': require('solar-pc/src/abstract-provider'),
  // systemRegistration
  'systemRegistration': require('solar-core/src/system-registration'),
  'config': require('mains-configs'),
};

if (process.env.NODE_ENV !== 'production') {
  // 子应用热更新支持。
  scope.mainAppHost.reactRefresh = require('react-refresh/runtime');
}

export {

};