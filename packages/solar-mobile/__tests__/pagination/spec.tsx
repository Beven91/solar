import React from 'react';
import Pagination, { EndReachedEvent } from '../../src/pagination';
import ScrollPortalView from '../../src/pagination/ScrollPortalView';
import ReverseListView from '../../src/pagination/ReverseListView';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';

jest.useFakeTimers();

class App extends React.Component<any, any> {
  public onEndReached: jest.Mock

  public pagination: Pagination

  constructor(props: any) {
    super(props);
    this.onEndReached = jest.fn();
    this.onEndReached.mockImplementation(this.onEndReached2);
  }

  state = {
    data: [] as any,
    hasMore: true,
  }

  renderRow = jest.fn().mockImplementation((row) => {
    return <div>{row.name}</div>;
  })

  onEndReached2 = (e: EndReachedEvent) => {
    const rows = getPageRows(e.page, e.size);
    const data = this.state.data;
    const increment = this.props.increment;
    const allRows = increment ? data.concat(data) : rows;
    const { onPaginating } = this.props;
    onPaginating && onPaginating();
    this.setState({
      data: [...allRows],
      hasMore: rows.length > 0,
    });
  }

  componentDidUpdate() {
    jest.runOnlyPendingTimers();
  }

  render() {
    return (
      <Pagination
        key="order-list"
        className="order-list"
        {...this.props}
        ref={(pagination) => this.pagination = pagination}
        hasMore={this.state.hasMore}
        dataSource={this.state.data}
        pageSize={3}
        increment={this.props.increment}
        renderRow={this.renderRow}
        onEndReached={this.onEndReached}
        getScrollContainer={this.props.getScrollContainer}
      />
    );
  }
}

describe('Pagination', () => {
  it('pagination', () => {
    const tree = mount(
      <App direction="bottom-to-top" />
    );
    expect(toJson(tree, { noKey: true, mode: 'deep' })).toMatchSnapshot();
  });

  it('pagination-revese', () => {
    const tree = mount(
      <App />
    );
    expect(toJson(tree, { noKey: true, mode: 'deep' })).toMatchSnapshot();
  });


  it('pagination increment', () => {
    const tree = mount(
      <App
        filter={(row1: any, row2: any) => row1 !== row2}
        increment={false}
        getScrollContainer={() => document.body}
      />
    );
    expect(toJson(tree, { noKey: true, mode: 'deep' })).toMatchSnapshot();

    // 手动触发分页
    const instance = tree.instance() as App;
    instance.pagination.onEndReached();

    expect(toJson(tree, { noKey: true, mode: 'deep' })).toMatchSnapshot();
  });


  it('pagination custom scroller', () => {
    const tree = mount(
      <App getScrollContainer={() => document.body} />
    );
    const instance = tree.instance() as App;
    const onEndReached = instance.onEndReached;

    // 断言：在当前状态下，渲染的数据为 3条
    expect(toJson(tree, { noKey: true, mode: 'deep' })).toMatchSnapshot();

    // 场景一：没有滚动到底部，不触发滚动分页
    Object.defineProperty(document.body, 'scrollHeight', { configurable: true, value: 1500 });
    document.body.scrollTop = 100;
    document.body.dispatchEvent(new Event('scroll'));
    // 由于没有滚动到底部，所以这里不会触发滚动分页
    // 值为什么是1? 因为默认初始化会加载一次数据，所以调用了一次
    expect(onEndReached).toHaveBeenCalledTimes(1);
    // 断言：在没有触发滚动分页状态下，渲染数据仍然为3条
    expect(toJson(tree.render(), { noKey: true, mode: 'deep' })).toMatchSnapshot();

    // 场景二：滚动到底部，触发滚动分页
    document.body.scrollTop = 890;
    document.body.dispatchEvent(new Event('scroll'));
    expect(onEndReached).toHaveBeenCalledTimes(2);
    expect(toJson(tree.render(), { noKey: true, mode: 'deep' })).toMatchSnapshot();
    // 触发滚动分页

    // 销毁组件
    tree.unmount();
  });

  it('pagination.refresh', () => {
    const tree = mount(
      <App getScrollContainer={() => document.body} />
    );
    const instance = tree.instance() as App;
    const onEndReached = instance.onEndReached;
    // 滚动分页
    document.body.scrollTop = 890;
    document.body.dispatchEvent(new Event('scroll'));

    // 获取分页组件实例
    const pagination = tree.find<Pagination>(Pagination).instance();
    // 断言：当前页码应该在第二页
    expect(pagination.state.page).toBe(2);

    // 清除调用记录
    onEndReached.mockClear();
    // 调用刷新函数
    // pagination.refresh();

    // 断言：当前页码应该重回到第一页状态
    // expect(pagination.state.page).toBe(1);
    // 断言：onEndReached 需要被调用，进行一次数据刷新
    // expect(onEndReached).toHaveBeenCalledTimes(1);
  });


  it('pagination.componentWillReceiveProps', () => {
    const tree = mount(
      <Pagination
        dataSource={[]}
        onEndReached={() => []}
        renderRow={() => <div></div>}
        increment={false}
      />
    );
    tree.setProps({ data: null });
    expect(toJson(tree.render(), { noKey: true, mode: 'deep' })).toMatchSnapshot();
  });

  it('ScrollView', () => {
    const dataSource = [] as any;
    const getScrollContainer = jest.fn();
    getScrollContainer.mockImplementation(() => document.body);
    const scrollView = mount(
      <ScrollPortalView
        dataSource={dataSource}
        horizontal={true}
        getScrollContainer={getScrollContainer}
      />
    );
    const instance = scrollView.instance() as ScrollPortalView;
    instance.getMetrics();
    scrollView.setProps({ initialListSize: 20 });
    scrollView.setProps({ horizontal: false });

    instance.isRemovedScroll = false;
    instance.componentDidUpdate();
    scrollView.update();
    jest.runOnlyPendingTimers();
    getScrollContainer.mockImplementation(() => null);

    scrollView.instance().componentDidMount();
    jest.runOnlyPendingTimers();

    scrollView.unmount();
  });

  /**
   * =================>
   *
   * 逆向滚动 测试用例
   *
   * =================>
   */

  it('pagination bottom-to-top', () => {
    // 逆向滚动分页
    const tree = mount(
      <App
        className="reverse-pagination"
        direction="bottom-to-top"
      />
    );
    const instance = tree.instance() as App;
    const onEndReached = instance.onEndReached;
    const renderRow = instance.renderRow;
    // 断言：初始状态下 逆向滚动分页镜像匹配
    expect(toJson(tree, { noKey: true, mode: 'deep' })).toMatchSnapshot();

    // 断言：onEndReached 会被调用一次，（初始化的分页请求)
    expect(onEndReached).toHaveBeenCalledTimes(1);

    // 清除调用记录
    onEndReached.mockClear();

    // 获取滚动容器
    const scroller = tree.find('.reverse-pagination').first();
    // 模拟滚动变化
    simulateScroll(scroller, { scrollTop: 180 });
    jest.runOnlyPendingTimers();
    // 断言：此时不会触发onEndReached 默认 当scrollTop < 10 时才会触发分页请求
    expect(onEndReached).not.toHaveBeenCalled();

    // 模拟滚动到 20以内，
    simulateScroll(scroller, { scrollTop: 18 });
    jest.runOnlyPendingTimers();
    // 断言：当滚动到顶部，会触发分页请求
    expect(onEndReached).toHaveBeenCalledTimes(1);

    // 断言renderRow 会被调用
    expect(renderRow).toHaveBeenCalled();
    // 清除renderRow 调用记录
    renderRow.mockClear();
    // 在不改变page的情况下，强制触发组件刷新
    tree.instance().forceUpdate();
    // 断言：renderRow 不会被调用
    // 预期：在不改变page的情况下，不会触发ReverseListView 组件prependRows 这样可以防止重复行渲染
    expect(renderRow).not.toHaveBeenCalled();

    // 设置当前无更多记录，hasMore=false
    tree.setState({ hasMore: false });
    // 清除调用记录
    onEndReached.mockClear();
    // 模拟滚动到 10以内，
    simulateScroll(scroller, { scrollTop: 9 });
    jest.runOnlyPendingTimers();
    // 断言：由于hasMore=false 所以后续滚动不会触发分页
    expect(onEndReached).not.toHaveBeenCalled();
    // 断言：在无更多分页数据状态下，不会出现loading头部
    expect(tree.find('.reverse-header').length).toBe(0);
  });

  it('pagination bottom-to-top handlePosition', () => {
    // 逆向滚动分页
    const tree = mount(
      <App
        className="reverse-pagination"
        direction="bottom-to-top"
      />
    );
    // 获取滚动容器
    const scroller = tree.find('.reverse-pagination').first();
    const reverser = tree.find(ReverseListView);
    const reverserInstance = reverser.instance() as ReverseListView;
    const dom = scroller.getDOMNode();
    const originalHandlePosition = reverserInstance.handlePosition;

    // 模拟当前分页的内容总体高度为 1200
    Object.defineProperty(dom, 'scrollHeight', { value: 1200, configurable: true });
    // 断言：dom.scrollHeight 为 1200
    expect(dom.scrollHeight).toBe(1200);

    // 通过覆写handlePosition 来测试scrollTop的值是否准确
    reverserInstance.handlePosition = (...options) => {
      // 模拟在请求数据完成后，scrollHeight 变为 2400
      Object.defineProperty(dom, 'scrollHeight', { value: 2400, configurable: true });
      originalHandlePosition.apply(reverserInstance, [...options]);
    };

    // 模拟滚动分页
    simulateScroll(scroller, { scrollTop: 9 });
    jest.runOnlyPendingTimers();

    // 断言：scrollTop 值应该为 1209
    //  即: scrollHeight(2400) - prev ScrollHeight(1200) + last scrollTop(9)
    //  即: 2400 - 1200 + 9 = 1209
    // 原因：在滚动顶部，分页请求完毕，且渲染完毕后，需要将滚动容器的scrollTop设置到最后滚动的位置
    // 否则，在渲染后，顶部显示的是最后一页的最后几条记录，这样位置不延续
    expect(dom.scrollTop).toBe(1209);
  });

  it('pagination bottom-to-top repeat-scroll', () => {
    const onPaginating = jest.fn();
    // 逆向滚动分页
    const tree = mount(
      <App
        className="reverse-pagination"
        onPaginating={onPaginating}
        direction="bottom-to-top"
      />
    );
    const instance = tree.instance() as App;
    const onEndReached = instance.onEndReached;
    // 获取滚动容器
    const scroller = tree.find('.reverse-pagination').first();
    // 清除调用记录
    onEndReached.mockClear();

    // 模拟滚动分页
    simulateScroll(scroller, { scrollTop: 9 });
    // 此时在 onPaginating时，模拟再一次滚动
    onPaginating.mockImplementation(() => {
      // 模拟滚动分页
      simulateScroll(scroller, { scrollTop: 8 });
    });
    jest.runOnlyPendingTimers();

    // 断言：虽然连续滚动了两次，但是onEndReached 仅需要被调用一次
    expect(onEndReached).toHaveBeenCalledTimes(1);
  });
});

function simulateScroll(wrapper: any, config: any) {
  const node = wrapper.getDOMNode();
  node.scrollTop = config.scrollTop;
  wrapper.simulate('scroll', { target: node });
}

function getPageRows(page: number, size: number) {
  const rows = [];
  if (page > 2) {
    return [];
  }
  for (let i = 0; i < size; i++) {
    rows.push({ name: 'hello_' + i });
  }
  return rows;
}
