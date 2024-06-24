import { Form, FormInstance, Input, Row, Tabs } from 'antd';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { IsolationError } from './context';
import { AbstractFormGroupItemType, AbstractFormItemType } from '../interface';
import type { DynamicProps } from './dynamic';
import { renderFormItem } from './render';
import { isFormItemVisible, useContextFormValuer } from './hooks';

export default function TabsGroup<TRow = any>(props: DynamicProps<TRow>) {
  const groups = props.groups;
  const [, setUpdateId] = useState('a');
  const valuer = useContextFormValuer(props.model);
  const [plainFields] = useState<Record<string, number>>({});
  const [accessedKeys] = useState<Record<string, boolean>>({});
  const memo = useRef({ isMounted: false, timerId: 0 as any, callback: () => { }, keepIndex: -1 });
  const [activeIndex, setActiveIndex] = useState(props.defaultActiveIndex || 0);
  const controlRules = [
    (form: FormInstance) => {
      return {
        validator: () => {
          return new Promise<void>((resolve, reject) => {
            setTimeout(() => {
              const ok = checkTabsValidator(form);
              ok ? resolve() : reject(<IsolationError />);
            }, 20);
          });
        },
      };
    },
  ];
  const toggleActiveIndex = (index: string | number) => {
    accessedKeys[index.toString()] = true;
    setActiveIndex(Number(index));
  };

  const checkTabsValidator = (form: FormInstance) => {
    const errorField = form.getFieldsError().filter((m) => m.errors?.length > 0)[0];
    const key = Object.keys(accessedKeys).find((k) => accessedKeys[k] == false);
    if (!key && !errorField) {
      memo.current.keepIndex > -1 && toggleActiveIndex(memo.current.keepIndex);
      memo.current.keepIndex = -1;
      return true;
    }
    if (errorField) {
      memo.current.keepIndex = -1;
      toggleActiveIndex(plainFields[errorField.name.join('.')]);
    } else if (key) {
      if (memo.current.keepIndex === -1) {
        memo.current.keepIndex = activeIndex;
      }
      memo.current.callback = () => {
        setTimeout(() => form.submit?.(), 20);
      };
      toggleActiveIndex(key);
    }
    return false;
  };

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
    Object.keys(accessedKeys).forEach((k) => {
      delete accessedKeys[k];
    });
    const tabGroups = tabs.filter((tab) => tab.items?.length > 0);
    tabGroups.forEach((group, index) => {
      group.items.forEach((item) => {
        plainFields[item.name?.toString()] = index;
      });
      accessedKeys[index] = index == activeIndex;
    });
    return tabGroups;
  }, [groups.map((g: any) => g.group || g.name).join('-')]);

  const { tabPosition, tabType, tabBarGutter } = props;
  const allValues = valuer.getValues();
  const items = tabGroups
    .filter((m) => isFormItemVisible(m, allValues))
    .map((group, index) => {
      return {
        key: `${index}`,
        label: <div>{group.icon}{group.group || index}</div>,
        children: (
          <Row className="tabs-group-form-inner" gutter={8}>
            {group.items?.map((item) => renderFormItem(item, props, group.span || props.span, group, index))}
          </Row>
        ),
      };
    });

  const tryUpdate = ()=> {
    const items2 = tabGroups.filter((m) => isFormItemVisible(m, valuer.getValues()));
    if (items2.length !== items.length) {
      setUpdateId((m) => m == 'a' ? 'b' : 'a');
    }
  };

  useEffect(() => {
    if (!memo.current.isMounted) {
      memo.current.isMounted = true;
      setUpdateId((m) => m == 'a' ? 'b' : 'a');
    }
  }, []);

  useEffect(() => {
    if (memo.current.callback) {
      memo.current.callback();
      memo.current.callback = null;
    }
  }, [activeIndex]);

  const shouldUpdate = useCallback(() => {
    clearTimeout(memo.current.timerId);
    memo.current.timerId = setTimeout(tryUpdate, 16);
    return false;
  }, [valuer.getValues, tabGroups, items.length]);

  return (
    <React.Fragment>
      <Tabs
        className="abstract-form-tabs"
        tabBarStyle={{ paddingLeft: 20 }}
        activeKey={activeIndex.toString()}
        type={tabType}
        style={{ visibility: memo.current.isMounted ? undefined : 'hidden' }}
        tabPosition={tabPosition}
        tabBarGutter={tabBarGutter}
        onChange={(activeKey) => toggleActiveIndex(activeKey)}
        items={items}
      >
      </Tabs>
      <Form.Item shouldUpdate={shouldUpdate} name="tabsValidator" rules={controlRules} style={{ display: 'none' }} >
        <Input type="hidden" />
      </Form.Item>
    </React.Fragment>
  );
}