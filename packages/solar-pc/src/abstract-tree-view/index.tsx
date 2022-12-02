/**
 * @module TreeList
 * @description 部门树控件
 */
import './index.scss';
import React, { ReactNode } from 'react';
import { Spin, Tree } from 'antd';
import { } from 'solar-core';
import { AbstractAction, AbstractButtons, AbstractQueryType, PlainObject } from 'solar-pc/src/interface';
import CellActions from 'solar-pc/src/abstract-table/parts/CellActions';
import { TreeProps, DataNode } from 'antd/lib/tree';
import memoize from 'memoize-one';
import renders from '../abstract-table/util/cellRenders';
import classify from './classify';

interface ClassifyNodes<TRow> {
  [propName: string]: {
    children: TRow[]
  }
}

type getRootNodesFunc = (data: ClassifyNodes<DataNode>) => DataNode[]

export interface TreeViewProps<TRow> extends TreeProps {
  // 是否数据加载中
  loading?: boolean
  // 节点操作按钮
  buttons?: AbstractButtons<TRow>
  // 主键
  rowKey: string
  // 用于指定父级节点的唯一 属性名
  parentKey?: string
  // 展示的属性名
  labelKey?:string
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

export interface TreeViewState<TRow> {
  data: TRow[]
}

export default class TreeView<TRow extends PlainObject> extends React.Component<TreeViewProps<TRow>, TreeViewState<TRow>> {
  static defaultProps: Partial<TreeViewProps<any>> = {
    loading: false,
    initQuery: true,
    rowKey: 'id',
    labelKey: 'title',
    parentKey: 'parentId',
  };

  constructor(props: TreeViewProps<TRow>) {
    super(props);
    this.state = {
      data: [],
    };
  }

  componentDidMount(): void {
    this.initQuery();
  }

  async initQuery() {
    if (this.props.initQuery) {
      const res = await this.props.onQuery({} as AbstractQueryType);
      this.setState({
        data: res,
      });
    }
  }

  handleSelect = (keys: string[], info: any) => {
    const node = info.selectedNodes[0];
    const { onActionRoute } = this.props;
    onActionRoute && onActionRoute(renders.createAction({ id: node.key, action: 'update' }));
  };

  stopPropagation = (ev: React.MouseEvent<HTMLDivElement>) => {
    ev.stopPropagation();
  };

  renderNode = (node: DataNode) => {
    const { itemRender, rowKey, disabled } = this.props;
    return (
      <div
        className="abstract-tree-node"
        onClick={this.stopPropagation}
      >
        <span className="abstract-node-title">
          {!itemRender ? (node.title || node.key) : itemRender(node)}
        </span>
        <div className="node-actions">
          {
            disabled ? null : (
              <CellActions
                style={{ display: 'inline-block' }}
                onAction={this.props.onActionRoute}
                row={node}
                rowId={(node as any)[rowKey]}
                buttons={this.props.buttons}
              />
            )
          }
        </div>
      </div>
    );
  };

  getData = memoize((data: TRow[], parentKey: string, rowKey: string, labelKey:string, format: getRootNodesFunc) => {
    if (!data) return [];
    const elements = data.map((item) => {
      return {
        key: item[rowKey],
        title: item[labelKey],
        ...item,
      } as DataNode;
    });
    const tree = classify(elements, parentKey, rowKey) as ClassifyNodes<DataNode>;
    return format(tree);
  });

  render() {
    const { parentKey, rowKey, labelKey, getRootNodes, ...props } = this.props;
    return (
      <div>
        <div className="abstract-tree-view">
          <Spin
            spinning={this.props.loading}
          >
            <Tree<DataNode>
              showIcon
              defaultExpandAll
              onSelect={this.handleSelect}
              titleRender={this.renderNode}
              // switcherIcon={<DownOutlined />}
              {...props}
              treeData={this.getData(this.state.data, parentKey, rowKey, labelKey, getRootNodes)}
            />
          </Spin>
        </div>
      </div>
    );
  }
}
