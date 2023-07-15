import { message } from 'antd';
import { $service$ } from '$serviceModule$';
import { RematchEffectThis, RematchModelTo } from 'solar-core';
import { AbstractAction, AbstractQueryType, SubmitAction } from 'solar-pc/src/interface';

export interface RecordModel {
  [propName: string]: any
}

const modelState = {
  // 主键
  idKey: '$primaryKey$',
  // 当前操作动作 默认动作有:  add ,edit ,remove
  action: '',
  // 缓存的查询条件，用于刷新数据使用
  query: {},
  // 是否显示loading
  confirmLoading: false,
  // 表格加载loading
  loading: false,
  // 当前正在操作的记录
  record: {},
  // 分页查询
  allRecords: {
    count: 0, // 总记录数
    models: [] as any[], // 本次查询所有的所有数据
  },
};

const model = {
  name: '$namespace$',
  state: modelState,
  effects: {
    // 查询表格信息
    async queryAllAsync(this: ModelThis, query: AbstractQueryType) {
      this.setState({ loading: true });
      const response = await $service$.$query$(query);
      this.setState({ query, loading: false, allRecords: response.result });
    },
    // 进入动作
    async enterAction(this: ModelThis, payload: AbstractAction) {
      if (payload.id) {
        const res = await $service$.$get$(payload.id).showLoading();
        payload.model = res.result;
      }
      this.setState({ action: payload.action, record: payload.model || {} });
    },
    // 离开动作
    async leaveAction(this: ModelThis, payload: { reload?: boolean, message: string }, state: any) {
      if (payload.reload !== false) {
        this.queryAllAsync({ ...state[model.name].query });
      }
      if (payload.message) {
        message.info(payload.message);
      }
      this.setState({ action: '', record: {}, confirmLoading: false });
    },
    // 提交动作
    async onSubmit(this: ModelThis, data: SubmitAction<RecordModel>) {
      this.setState({ confirmLoading: true });
      switch (data.action) {
        /* GENERATE-SUBMIT */
        default:
          break;
      }
    },
    // 取消动作
    onCancel(this: ModelThis) {
      this.setState({ action: '', record: {}, confirmLoading: false });
    },
    /* GENERATE-REDUCERS */
  },
  reducers: {
    onError(state: ModelState, payload: { name: string, error: any }) {
      // 所有effects 的执行异常，都会触发此reducer
      switch (payload.name) {
        case 'onSubmit':
          return {
            ...state,
            confirmLoading: false,
          };
        default:
          return { ...state };
      }
    },
    setState(state: ModelState, payload: Partial<ModelState>) {
      return { ...state, ...payload };
    },
  },
};

export default model;

interface ModelThis extends RematchEffectThis<typeof model> { }

export type ModelState = typeof modelState;

export type ModelProps = RematchModelTo<typeof model>;
