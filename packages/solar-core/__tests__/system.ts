/**
 * @module SystemTest
 * @name 测试 System模块
 * @description
 */
import System, { SystemRegistration } from '../src/system-registration';

const context = System as any;
const oLoadJs = context.loadJs;
const oLoadCss = context.loadCss;

describe('System', () => {
  const loadJs = jest.spyOn(context, 'loadJs');
  const loadCss = jest.spyOn(context, 'loadCss');

  function mockLoadSystem(name: string, registration?: SystemRegistration) {
    loadJs.mockImplementation(() => {
      System.register(name, registration || {
        run(options: any) {
        },
        destory() {
        },
      });
      return Promise.resolve({});
    });
  }

  test('Service.import', async() => {
    const runtime = {
      error: null as Error,
    };
    // 模拟加载solar-base
    mockLoadSystem('solar-base');
    const regisration = await System.import('solar-base', { base: 'https://www.solar.com' });
    // 断言：此时会注册一个solar-base子系统
    expect(regisration.name).toBe('solar-base');
    try {
      // 测试：重复注册
      await System.register('solar-base', {} as any);
    } catch (ex) {
      runtime.error = ex;
    }

    // 断言：会出现一存在异常判定
    expect(runtime.error.message).toContain('已存在相同的子系统');

    // 测试：重复加载，此时已经加载过后，无需重复加载
    loadJs.mockReset();
    mockLoadSystem('solar-base');
    const registration2 = await System.import('solar-base', { base: 'https://www.solar.com' });
    // 断言: registration2 必须等于 registration
    expect(registration2).toBe(regisration);

    // 清空调用
    loadCss.mockReset();
    // 模拟加载solar-base2
    mockLoadSystem('solar-base2');
    // 加载css模式
    const regisration3 = await System.import('solar-base2', { css: true, base: 'https://www.solar.com' });

    // 断言： 此时loadCss会调用
    expect(loadCss).toHaveBeenCalled();
    expect(regisration3.name).toBe('solar-base2');
  });

  it('invoke', async() => {
    // 模拟加载solar-base
    mockLoadSystem('solar-base');

    // 注册solar-order子系统
    System.register('solar-order', {} as any);

    const solarbase = System.getRegistration('solar-base');
    const solarorder = System.getRegistration('solar-order');

    solarbase.run = jest.fn();
    solarbase.destory = jest.fn();
    solarorder.run = jest.fn();
    solarorder.destory = jest.fn();


    // 执行solar-base子系统
    await System.invoke('solar-base', {});

    // 断言：run函数被执行
    expect(solarbase.run).toHaveBeenCalled();
    // 断言： destory不会被执行
    expect(solarbase.destory).not.toHaveBeenCalled();
    // 断言：此时regisration的状态为running
    expect(solarbase.status).toBe('running');

    // 重置run
    (solarbase.run as any).mockReset();
    // 重复执行solar-base
    await System.invoke('solar-base', {});
    // 断言： destory不会被执行
    expect(solarbase.destory).not.toHaveBeenCalled();
    // 断言：此时run不会被执行，因为solar-base正在运行中
    expect(solarbase.run).not.toHaveBeenCalled();


    // 切换子系统
    await System.invoke('solar-order', {});
    // 断言：此时solar-base的destory会被执行
    expect(solarbase.destory).toHaveBeenCalled();
    // 断言：此时solar-base的run不会被执行
    expect(solarbase.run).not.toHaveBeenCalled();
    // 断言: 此时solarorder的run会被执行
    expect(solarorder.run).toHaveBeenCalled();
    // 断言：此时solarorder状态为正在运行中
    expect(solarorder.status).toBe('running');
    // 断言：此时solarbase的状态为destoryed
    expect(solarbase.status).toBe('destoryed');

    // 退出子系统
    System.exit('solar-order');
    // 断言： 此时solarorder 状态应为该destoryed
    expect(solarorder.status).toBe('destoryed');
    System.exit('solar-order2');

    // 运行solar-order
    await System.invoke('solar-order', {});
    expect(solarorder.status).toBe('running');
    // 退出正在运行的子系统
    await System.exitRunnings();
    expect(solarorder.status).toBe('destoryed');

    // 覆盖率
    mockLoadSystem('solar-unkonw');
    System.invoke('solar-unkonw', {});
  });

  it('loadJs', async()=>{
    await oLoadJs('mock.js');
  });

  it('loadCss', async()=>{
    await oLoadCss('mock.css');
  });
});
