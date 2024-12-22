/**
 * @name FilterTabs
 * @description 过滤tab组件
 */
import React, { useEffect, useMemo, useState } from 'react';
import { Tabs } from 'antd';
import { FilterTabType } from '../../interface';

export interface FilterTabsProps {
  // 过滤tabs配置
  filters: FilterTabType[]
  // 默认的字段名
  name?: string
  loadFilters: () => Promise<FilterTabType[]>
  // 默认选中的值
  value?: any,
  // tab发生改变
  onChange: (v: any) => void,
}

// tab样式
const tabStyle = {
  margin: '0px',
};

const findDefaultValue = (value: string, filters: FilterTabType[]) => {
  if (value == undefined) {
    return filters[0]?.value;
  }
  return value;
};

const normalizeFilters = (filters: FilterTabType[], name: string) => {
  return filters?.map((item) => {
    item.field = item.field || name;
    return item;
  }) || [];
};

export default function FilterTabs({
  loadFilters,
  ...props
}: FilterTabsProps) {
  const filters = props.filters || [];
  const [memo] = useState({ mounted: false });
  const [items, setItems] = useState<FilterTabType[]>(normalizeFilters(filters, props.name));
  const [activeKey, setActiveKey] = useState();

  const initItems = (filters: FilterTabType[]) => {
    setItems(normalizeFilters(filters, props.name));
    if (activeKey == undefined) {
      // 默认值选中处理
      onChange(findDefaultValue(props.value, filters));
    }
  };

  useEffect(() => {
    if (typeof loadFilters == 'function') {
      loadFilters().then((filters) => initItems(filters));
    }
  }, [loadFilters]);

  useEffect(() => {
    if (!loadFilters) {
      onChange(findDefaultValue(props.value, items));
    }
  }, [props.value]);

  useEffect(()=>{
    if (memo.mounted) {
      setItems(normalizeFilters(filters, props.name));
    }
    memo.mounted = true;
  }, [props.filters]);

  // 切换tab时触发
  const onChange = (value: any) => {
    setActiveKey(value);
    const tab = items.find((item) => item.value == value);
    props.onChange?.(tab);
  };

  const tabs = useMemo(()=>{
    return items.map((filter) => {
      return {
        label: filter.label,
        key: String(filter.value),
        children: null,
      };
    });
  }, [items]);

  if (tabs.length < 1) {
    return null;
  }

  return (
    <div className="tab-filters">
      <Tabs
        size="large"
        activeKey={`${activeKey}`}
        onChange={onChange}
        tabBarStyle={tabStyle}
        items={tabs}
      />
    </div>
  );
}

