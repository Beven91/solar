/**
 * @module TreeList
 * @description 部门树控件
 */
import './index.scss';
import React, { ReactNode, useEffect, useMemo, useState } from 'react';
import { Spin, Tree } from 'antd';
import { } from 'solar-core';
import { AbstractAction, AbstractButtons, AbstractQueryType, PlainObject } from 'solar-pc/src/interface';
import CellActions from 'solar-pc/src/abstract-table/parts/CellActions';
import { TreeProps, DataNode } from 'antd/lib/tree';
import renders from '../abstract-table/util/cellRenders';
import classify from './classify';

interface ClassifyNodes<TRow> {
  [propName: string]: {
    children: TRow[]
  }
}

type getRootNodesFunc = (data: ClassifyNodes<DataNode>) => DataNode[]

export interface TreeViewProps<TRow> extends TreeProps {
  // 是否正在加载中
  loading?: boolean
  // 采用数据模式
  data?: TRow[]
  // 节点操作按钮
  buttons?: AbstractButtons<TRow>
  // 主键
  rowKey: string
  // 用于指定父级节点的唯一 属性名
  parentKey?: string
  // 展示的属性名
  labelKey?: string
  // 自定义获取根节点
  getRootNodes: getRootNodesFunc
  // 点击节点时触发的action
  clickAction?: string
  // 初始化数据
  onQuery: (query: AbstractQueryType) => Promise<TRow[]>
  // 当触发动作切换
  onActionRoute?: (data: AbstractAction) => void
  // 自定义节点项渲染
  itemRender?: (record: DataNode) => ReactNode
  // 初始化时，是否执行查询
  initQuery?: boolean
}

const stopPropagation = (ev: React.MouseEvent<HTMLDivElement>) => {
  ev.stopPropagation();
};

export default function TreeView<TRow extends PlainObject>(
  {
    initQuery = true,
    rowKey = 'id',
    labelKey = 'title',
    parentKey = 'parentId',
    getRootNodes,
    ...props
  }: TreeViewProps<TRow>
) {
  const [data, setData] = useState(props.data || []);
  const [loading, setLoading] = useState(props.loading);

  const requestQuery = async() => {
    if (initQuery) {
      setLoading(true);
      const res = await props.onQuery({} as AbstractQueryType);
      setData(res);
      setLoading(false);
    }
  };

  useEffect(() => {setLoading(props.loading);}, [props.loading]);

  useEffect(() => {setData(props.data);}, [props.data]);

  useEffect(() => {requestQuery();}, []);

  const handleSelect = (keys: string[], info: any) => {
    const node = info.selectedNodes[0];
    const { onActionRoute } = props;
    onActionRoute && onActionRoute(renders.createAction({ id: node.key, action: 'update' }));
  };

  const treeSource = useMemo(() => {
    if (!data) return [];
    const elements = data.map((item) => {
      return {
        key: item[rowKey],
        title: item[labelKey],
        ...item,
      } as DataNode;
    });
    const tree = classify(elements, parentKey, rowKey) as ClassifyNodes<DataNode>;
    return getRootNodes(tree);
  }, [data, parentKey, rowKey, labelKey, getRootNodes]);

  const renderNode = (node: DataNode) => {
    const { itemRender, disabled } = props;
    const title = typeof node.title == 'function' ? node.title(node) : node.title;
    return (
      <div
        className="abstract-tree-node"
        onClick={stopPropagation}
      >
        <span className="abstract-node-title">
          {itemRender?.(node) || (title || node.key)}
        </span>
        <div className="node-actions">
          {
            disabled ? null : (
              <CellActions
                style={{ display: 'inline-block' }}
                onAction={props.onActionRoute}
                row={node}
                rowId={(node as any)[rowKey]}
                buttons={props.buttons}
              />
            )
          }
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="abstract-tree-view">
        <Spin
          spinning={loading}
        >
          <Tree<DataNode>
            showIcon
            defaultExpandAll
            onSelect={handleSelect}
            titleRender={renderNode}
            {...props}
            treeData={treeSource}
          />
        </Spin>
      </div>
    </div>
  );
}
