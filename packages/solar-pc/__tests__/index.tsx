import runApplication from './App';
import RuntimeApp from '../src/abstract-object/demo/index';

runApplication(document.getElementById('app'), RuntimeApp);

// 启动测试用例
if (module.hot) {
  module.hot.accept();
}