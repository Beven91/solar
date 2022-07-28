/**
 * @module ServiceTest
 * @name 测试 Service模块
 * @description
 */
import Network from '../src/network';
import Service from '../src/service';

const fetch = global.fetch;

// 配置Network全局参数
Network.config({
  base: 'https://api.solar.com',
});

class UserService extends Service {
}

describe('Service', () => {
  // 接口发送数据
  const apiParams = { id: '10086' };
  // 创建一个user服务实例
  const userService = new UserService();

  beforeEach(() => {
    fetch.resetMocks();
  });


  test('Service.redux', () => {
    // 测试get请求 返回结果参见 www/index.js
    fetch.mockResponseOnce(JSON.stringify(apiParams));
    return userService
      .get('/all', apiParams)
      .json()
      .json()
      .then((data) => {
        expect(data.id).toBe(apiParams.id);
      });
  });
})
;
