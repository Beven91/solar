import Preload from '../../src/preload';

describe('Preload', () => {
  it('show', () => {
    // fade timeout
    jest.useFakeTimers();

    const close = Preload.showLoading('加载中...');

    jest.runOnlyPendingTimers();
    // 断言:渲染内容
    expect(document.body).toMatchSnapshot();

    // 关闭preload
    close();
    // 断言:渲染内容
    expect(document.body).toMatchSnapshot();

    Preload.showLoading('请稍后', false);
    jest.runOnlyPendingTimers();
    // 断言:渲染内容
    expect(document.body).toMatchSnapshot();


    Preload.showLoading('请稍后', false, false);
    // 断言:渲染内容
    expect(document.body).toMatchSnapshot();

    Preload.showLoading('请稍后', true);
    jest.runOnlyPendingTimers();
    // 断言:渲染内容
    expect(document.body).toMatchSnapshot();

    Preload.showLoading(null, true);
    jest.runOnlyPendingTimers();
    // 断言:渲染内容
    expect(document.body).toMatchSnapshot();
  });
});

