/**
 * @name FilterTabs
 * @description 过滤tab组件
 */
import React from 'react';
import { Tabs } from 'antd';
import { FilterTabType } from '../../interface';

const TabPane = Tabs.TabPane;

const defaultTab = { label: '全部', value: '' };

export interface FilterTabsProps {
  // 过滤tabs配置
  filters: FilterTabType[]
  loadFilters: () => Promise<FilterTabType[]>
  // 默认选中的值
  value: any,
  // tab发生改变
  onChange: (v: any) => void,
}

export interface FilterTabsState {
  loadFilters?: () => Promise<FilterTabType[]>,
  filters: FilterTabType[]
  needReload: boolean
  value: any
}

export default class FilterTabs extends React.Component<FilterTabsProps, FilterTabsState> {
  // 默认属性
  static defaultProps = {
    filters: [] as FilterTabType[],
    value: null as any,
    onChange: () => '',
  }

  static getDerivedStateFromProps(props: FilterTabsProps, state: FilterTabsState) {
    if (props.loadFilters != state.loadFilters) {
      return {
        loadFilters: props.loadFilters,
        needReload: !!props.loadFilters,
        filters: [defaultTab],
      };
    } else if (!props.loadFilters && props.filters !== state.filters) {
      return {
        filters: props.filters,
      };
    }
    return null;
  }

  constructor(props: FilterTabsProps) {
    super(props);
    this.state.value = props.value;
  }

  // 初始化状态
  state: FilterTabsState = {
    needReload: false,
    filters: [] as FilterTabType[],
    value: '',
  }

  // tab样式
  tabStyle = {
    margin: '0px',
  }

  // 切换tab时触发
  onChange = (value: any) => {
    const { onChange } = this.props;
    this.setState({ value });
    onChange && onChange(value);
  }

  loadFiltersData() {
    this.setState({
      needReload: false,
      filters: [
        defaultTab,
      ],
    });
    Promise
      .resolve(this.props.loadFilters())
      .then((data) => {
        this.setState({
          needReload: false,
          filters: [
            defaultTab,
            ...data,
          ],
        });
      })
      .catch(() => {
        this.setState({ needReload: false });
      });
  }

  componentDidMount() {
    if (this.state.needReload) {
      this.loadFiltersData();
    }
  }

  componentDidUpdate() {
    if (this.state.needReload) {
      this.loadFiltersData();
    }
  }

  changeActiveTab = (value:string)=>{
    this.setState({ value: value });
  }

  // 渲染组件
  render() {
    const { filters } = this.state;
    const value = this.state.value;
    if (filters.length < 1) {
      return '';
    }
    return (
      <div className="tab-filters">
        <Tabs activeKey={`${value}`} onChange={this.onChange} tabBarStyle={this.tabStyle}>
          {
            filters.map((filter) => {
              return (
                <TabPane key={filter.value} tab={filter.label} style={{ height: 0 }} />
              );
            })
          }
        </Tabs>
      </div>
    );
  }
}

