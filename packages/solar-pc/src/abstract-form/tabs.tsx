import { Form, Input, Row, Tabs, TabsProps } from 'antd';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AbstractFormGroupItemType, AbstractFormItemType } from '../interface';
import type { DynamicProps } from './dynamic';
import { renderFormItem } from './render';
import { isFormItemVisible, useContextFormValuer, useTabGroupsAutoSwitchValidator } from './hooks';

type TabItems = TabsProps['items']

export default function TabsGroup<TRow = any>(props: DynamicProps<TRow>) {
  const groups = props.groups;
  const valuer = useContextFormValuer(props.model);
  const [plainFields] = useState<Record<string, number>>({});
  const [activeIndex, setActiveIndex] = useState(props.defaultActiveIndex || 0);
  const [items, setItems] = useState<TabItems>([]);

  // 获取tabs风格的分组表单
  const tabGroups = useMemo(() => {
    const normal = [] as Array<AbstractFormItemType<TRow>>;
    const tabs = [{ group: '', items: normal }] as AbstractFormGroupItemType<TRow>[];
    groups.forEach((group) => {
      if ('group' in group) {
        tabs.push(group);
      } else {
        normal.push(group as AbstractFormItemType<TRow>);
      }
    });
    const tabGroups = tabs.filter((tab) => tab.items?.length > 0);
    tabGroups.forEach((group, index) => {
      group.items.forEach((item) => {
        plainFields[item.name?.toString()] = index;
      });
    });
    return tabGroups;
  }, [groups.map((g: any) => g.group || g.name).join('-')]);

  const controlRules = useTabGroupsAutoSwitchValidator(tabGroups, setActiveIndex);
  const { tabPosition, tabType, tabBarGutter } = props;
  const filterItems = useCallback(() => {
    const allValues = valuer.getValues();
    return tabGroups
      .filter((m) => isFormItemVisible(m, allValues))
      .map((group, index) => {
        const originIndex = tabGroups.indexOf(group);
        return {
          key: `${originIndex}`,
          label: <div>{group.icon}{group.group || index}</div>,
          forceRender: true,
          children: (
            <Row className="tabs-group-form-inner" gutter={8}>
              {group.items?.map((item) => renderFormItem(item, props, group.span || props.span, group, index))}
            </Row>
          ),
        };
      });
  }, [tabGroups, valuer]);


  useEffect(() => {
    setItems(filterItems());
  }, []);

  const shouldUpdate = useCallback(() => {
    const newItems = filterItems();
    const id = newItems.map((m) => m.key).join('-');
    const id2 = items.map((m) => m.key).join('-');
    if (id !== id2) {
      setItems(newItems);
    }
    return false;
  }, [filterItems, items]);

  return (
    <React.Fragment>
      <Tabs
        items={items}
        type={tabType}
        className="abstract-form-tabs"
        tabBarStyle={{ paddingLeft: 20 }}
        activeKey={activeIndex.toString()}
        tabPosition={tabPosition}
        tabBarGutter={tabBarGutter}
        onChange={(activeKey) => setActiveIndex(Number(activeKey))}
      >
      </Tabs>
      <Form.Item shouldUpdate={shouldUpdate} name="tabsValidator" rules={controlRules} style={{ display: 'none' }} >
        <Input type="hidden" />
      </Form.Item>
    </React.Fragment>
  );
}