/**
 * @name AbstractSearch 后台系统列表界面搜索视图组件
 * @description
 *       提供通用的搜索视图
 */
import './index.scss';
import React, { PropsWithChildren, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { SearchOutlined, DeleteOutlined, DownOutlined, UpOutlined } from '@ant-design/icons';
import { Button, ButtonProps, Col, ConfigProvider, Form, Input } from 'antd';
import { AbstractQueryType, PlainObject, AbstractSField, RecordModel, AbstractRow } from '../interface';
import { FormInstance } from 'antd/lib/form';
import AdvancePicker from '../advance-picker';
import AbstractForm, { AbstractFormProps } from '../abstract-form';

export interface AbstractSearchProps<TRow> {
  // 获取表单实例
  formRef?: React.RefObject<FormInstance>
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
  // 查询按钮配置
  btnQuery?: ButtonProps
  // 取消按钮配置
  btnCancel?: ButtonProps
  // 每一个搜索项内部的标题和录入框的span配置
  span?: number,
  // 按钮是否换行展示
  // 默认：inline
  actionStyle?: 'inline' | 'newline'
  // 当actionStyle值为newline时，布局位置
  actionFlow?: 'center' | 'left' | 'right'
  // 清空
  onClean?: () => void,
  // 搜索表单项样式类名
  formItemCls?: string
  // 清空模式
  // \n all：清空时无视默认值全部清空，
  // \n initial:清空时保留默认值
  resetMode?: 'all' | 'initial'
  // 搜索值发生改变
  onChange?: (allValues: Record<string, any>) => void
  // 搜索项style
  itemStyle?: React.CSSProperties
  // 是否开启折叠
  collapse?: boolean
  // 是否开启回车搜索
  enterKeySubmit?: boolean
  // 表单布局配置
  formItemLayout?: AbstractFormProps<TRow>['formItemLayout']
  // 渲染在搜索按钮后额内容
  afterContent?: React.ReactNode
}

const FormItem = Form.Item;

// 获取搜索表单
const renderSearchInput = (field: AbstractSField, record: RecordModel) => {
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
  return <Input placeholder={field.placeholder} />;
};

/**
 * 过滤为空的选项
 */
const renderQuery = (query: PlainObject) => {
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
};

const useValue = (value: string, dv: string) => {
  return value === null || value == undefined ? dv : value;
};

const useFormRef = (formRef: React.MutableRefObject<FormInstance>) => {
  if (formRef) {
    return formRef;
  }
  return useRef<FormInstance>();
};

export default function AbstractSearch<TRow = AbstractRow>({
  span = 8,
  onQuery = () => { },
  resetMode = 'all',
  collapse,
  enterKeySubmit = true,
  ...props
}: PropsWithChildren<AbstractSearchProps<TRow>>) {
  const formRef = useFormRef(props.formRef);
  const [expand, setExpand] = useState(false);
  const [delayTimerId, setDelayTimerId] = useState<ReturnType<typeof setTimeout>>();
  const isNewline = (props.actionStyle == 'newline' || collapse) && !expand;
  const context = useContext(ConfigProvider.ConfigContext);

  const fields = useMemo(() => {
    return (props.fields || []).map((item) => ({
      ...item,
      span: item.span || span,
      render: (record: RecordModel) => renderSearchInput(item, record),
    }));
  }, [props.fields, span]);

  const onKeyUp = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && enterKeySubmit) {
      formRef.current?.submit();
    }
  }, [enterKeySubmit]);

  // 处理搜索
  const handleSearch = (values: PlainObject) => {
    clearTimeout(delayTimerId);
    const query = values || {};
    onQuery?.(renderQuery(query) as AbstractQueryType);
  };

  // 重置表单
  const handleReset = () => {
    formRef.current?.resetFields();
    if (resetMode !== 'initial') {
      const emptyValues = {} as Record<string, any>;
      Object.keys(props.initialValues || {}).forEach((k) => {
        emptyValues[k] = null;
      });
      formRef.current?.setFieldsValue?.(emptyValues);
    }
    const values = formRef.current?.getFieldsValue?.() || {};
    handleSearch(values);
    props.onClean?.();
  };

  // 处理输入项onChange时，执行搜索
  const handleInputChanged = useCallback((changedValues: PlainObject, allValues: any) => {
    const key = Object.keys(changedValues)[0];
    const fields = props.fields || [];
    const field = fields.find((f) => f.name == key);
    const model = { ...allValues, ...changedValues };
    if (field) {
      field.onChange?.(changedValues[key]);
      if (field.auto) {
        clearTimeout(delayTimerId);
        const id = setTimeout(() => handleSearch(model), 200);
        setDelayTimerId(id);
      }
    }
    props.onChange?.(model);
  }, [props.fields, delayTimerId, props.onChange]);

  const toggleExpander = useCallback(() => {
    setExpand((expand) => !expand);
  }, []);

  // 渲染搜索按钮
  const renderSearchActions = () => {
    return (
      <FormItem className="search-action-form-item">
        <div className={`${props.actionsCls || ''} search-actions-btns`}>
          <Button
            type="primary"
            icon={<SearchOutlined />}
            {...(props.btnQuery || {})}
            onClick={() => formRef.current?.submit()}
          >
            {useValue(props.btnQuery?.title, '查询')}
          </Button>
          <Button
            style={{ marginLeft: 8 }}
            icon={<DeleteOutlined />}
            onClick={handleReset}
            {...(props.btnCancel || {})}
          >
            {useValue(props.btnCancel?.title, '清空')}
          </Button>
          {
            collapse && (
              <Button
                onClick={toggleExpander}
                icon={expand ? <UpOutlined /> : <DownOutlined />}
                type="link"
              >
                {expand ? '收起' : '展开'}
              </Button>
            )
          }
          {props.afterContent}
        </div>
      </FormItem>
    );
  };

  const renderNewlineActions = () => {
    if (!isNewline) return null;
    return (
      <div className={`search-newline-btn search-btns-align-${props.actionFlow || 'left'}`}>
        {renderSearchActions()}
      </div>
    );
  };

  const renderInlineActions = () => {
    if (isNewline) return null;
    return (
      <Col
        span={span}
        key="table-search-buttons"
        className={`search-buttons abstract-search-item ${collapse ? 'collapse' : ''}`}
      >
        {renderSearchActions()}
      </Col>
    );
  };

  // 渲染
  if (fields.length < 1) {
    return (
      <>{props.children}</>
    );
  }

  return (
    <div className={`abstract-search-form abstract-form ${context.getPrefixCls('form-horizontal')}`}>
      <div className={`abstract-search-inner ${collapse && !expand ? 'collapse' : ''}`} onKeyUp={onKeyUp}>
        <Form
          component={false}
          className={`abstract-search-form-container ${props.className || ''}`}
          ref={formRef}
          onSubmitCapture={() => false}
          initialValues={props.initialValues}
          onValuesChange={handleInputChanged}
          onFinish={handleSearch}
        >
          <AbstractForm
            groups={fields}
            itemStyle={props.itemStyle}
            name="AbstractSearch"
            formItemLayout={props.formItemLayout}
            formItemCls={`${props.formItemCls || ''} abstract-search-form-item`}
            formChildren={renderInlineActions()}
          />
          {renderNewlineActions()}
        </Form>
      </div>
      {props.children}
    </div>
  );
}
