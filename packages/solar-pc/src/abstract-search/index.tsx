/**
 * @name AbstractSearch 后台系统列表界面搜索视图组件
 * @description
 *       提供通用的搜索视图
 */
import './index.scss';
import React, { PropsWithChildren } from 'react';
import { SearchOutlined, DeleteOutlined } from '@ant-design/icons';
import { Button, Col, Form, Input } from 'antd';
import { AbstractQueryType, PlainObject, AbstractSField, RecordModel, AbstractRow } from '../interface';
import { FormInstance } from 'antd/lib/form';
import AdvancePicker from '../advance-picker';
import AbstractForm from '../abstract-form';

export interface AbstractSearchProps<TRow> {
   // 容器样式名
   className?: string
   // 搜搜按钮容器样式
   actionsCls?: string
   // 默认查询条件
   initialValues?: TRow
   // 需要配置的搜索项
   fields: Array<AbstractSField>
   // 搜索调用的方法
   onQuery: (query: AbstractQueryType) => void
   // 每一个搜索项内部的标题和录入框的span配置
   span?: number,
   // 按钮是否换行展示
   // 默认：inline
   actionStyle?: 'inline' | 'newline'
   // 清空
   onClean?: () => void,
 }

export interface AbstractSearchState {
 }

const FormItem = Form.Item;

export default class AbstractSearch<TRow = AbstractRow> extends React.Component<PropsWithChildren<AbstractSearchProps<TRow>>, AbstractSearchState> {
  // 构造函数
  constructor(props: AbstractSearchProps<TRow>) {
    super(props);
    this.handleSearch = this.handleSearch.bind(this);
    this.handleReset = this.handleReset.bind(this);
    this.state = {};
  }

  formRef = React.createRef<FormInstance>();

  delayTimerId: any;

  get isNewline() {
    return this.props.actionStyle === 'newline';
  }

  get fields() {
    const { fields = [], span } = this.props;
    return fields.map((item) => {
      return {
        ...item,
        span: item.span || span,
        render: (record: RecordModel) => this.renderSearchInput(item, record),
      };
    });
  }

  getQueryValues() {
    if (this.formRef.current) {
      return this.formRef.current.getFieldsValue();
    }
    return {};
  }

  // 获取搜索表单
  renderSearchInput = (field: AbstractSField, record: RecordModel) => {
    const api = field.api;
    if (typeof field.render === 'function') {
      return field.render(record);
    } else if (field.render) {
      return field.render;
    } else if (field.enums) {
      return <AdvancePicker allowClear allOption type="local" data={field.enums as any} />;
    } else if (field.api) {
      return <AdvancePicker allowClear allOption labelName={api[1]} valueName={api[2]} api={api[0]} />;
    }
    return <Input />;
  };

  // 处理搜索
  handleSearch(values: PlainObject) {
    clearTimeout(this.delayTimerId);
    const { onQuery: onSearch } = this.props;
    const query = values || {};
    if (typeof onSearch === 'function') {
      onSearch(this.renderQuery(query) as AbstractQueryType);
    }
  }

  /**
    * 过滤为空的选项
    */
  renderQuery(query: PlainObject) {
    return Object.keys(query).reduce((newQuery: PlainObject, k) => {
      let v = query[k];
      if (v === null || v === undefined || v.toString().trim() === '') {
        return newQuery;
      }
      if (typeof v === 'string') {
        v = v.trim();
      }
      newQuery[k] = v;
      return newQuery;
    }, {});
  }


  // 重置表单
  handleReset() {
    const form = this.formRef.current;
    const { onClean } = this.props;
    form.resetFields();
    this.handleSearch({});
    onClean && onClean();
  }

  // 处理输入项onChange时，执行搜索
  handleInputChanged = (changedValues: PlainObject, allValues: any) => {
    const key = Object.keys(changedValues)[0];
    const fields = this.props.fields || [];
    const field = fields.find((f) => f.name == key);
    if (field) {
      const onChange = field.onChange;
      if (typeof onChange === 'function') {
        onChange(changedValues[key]);
      }
      if (field.auto) {
        clearTimeout(this.delayTimerId);
        this.delayTimerId = setTimeout(() => this.handleSearch(allValues), 200);
      }
    }
  };

  // 渲染搜索按钮
  renderSearchActions() {
    return (
      <FormItem
        className={this.props.actionsCls}
      >
        <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
           查询
        </Button>
        <Button style={{ marginLeft: 8 }} icon={<DeleteOutlined />} onClick={this.handleReset}>
           清空
        </Button>
      </FormItem>
    );
  }

  renderNewlineActions() {
    if (!this.isNewline) return null;
    return (
      <div className={'search-newline-btn'}>
        {this.renderSearchActions()}
      </div>
    );
  }

  renderInlineActions() {
    if (this.isNewline) return null;
    const { span } = this.props;
    return (
      <Col
        span={span - 1}
        key="table-search-buttons"
        className="search-buttons abstract-search-item"
      >
        {this.renderSearchActions()}
      </Col>
    );
  }

  // 渲染
  render() {
    const { fields = [] } = this.props;
    const len = fields.length;
    if (len < 1) {
      return React.Children.only(this.props.children);
    }
    return (
      <div className={'abstract-search-form abstract-form '}>
        <Form
          className={`abstract-search-form-container ${this.props.className || ''}`}
          ref={this.formRef}
          initialValues={this.props.initialValues}
          onValuesChange={this.handleInputChanged}
          onFinish={this.handleSearch}
        >
          <AbstractForm
            form={this.formRef}
            groups={this.fields}
            formChildren={this.renderInlineActions()}
          />
          {this.renderNewlineActions()}
        </Form>
        {this.props.children}
      </div>
    );
  }
}
