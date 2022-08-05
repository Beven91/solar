import { message } from 'antd';
import { $service$ } from '$serviceModule$';
import { RematchEffectThis, RematchModelTo } from 'solar-core';
import { AbstractAction, AbstractQueryType, SubmitAction } from 'solar-pc/src/interface';

export interface RecordModel {
  [propName: string]: any
}

const modelState = {
  // 主键
  primaryKey: '$primaryKey$',
  // 当前操作动作 默认动作有:  add ,edit ,remove
  action: '',
  // 是否重新加载表格数据
  reload: false,
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
    // 开始进入操作模式
    async enterAction(this: ModelThis, payload: AbstractAction) {
      if (payload.id) {
        const res = await $service$.$get$(payload.id).showLoading();
        this.enterActionDone({ id: payload.id, model: res.model, action: payload.action });
      } else {
        this.enterActionDone(payload);
      }
    },
    // 离开操作模式
    async leaveAction(this: ModelThis, payload: { reload: boolean, [x: string]: any }, state: any) {
      if (payload.reload) {
        this.queryAllAsync({ ...state.$namespace$.query });
      }
      this.handleActionSubmitDone(payload);
    },
    // 查询表格信息
    async queryAllAsync(this: ModelThis, query: AbstractQueryType) {
      this.queryAllLoading();
      const data = await $service$.$query$(query);
      this.queryAllDone({ model: data.model, query });
    },
    // 操作提交
    async onSubmit(this: ModelThis, data: SubmitAction<RecordModel>) {
      this.confirmLoading();
      switch (data.action) {
        /* GENERATE-SUBMIT */
        default:
          break;
      }
    },
    // 取消提交
    onCancel(this: ModelThis) {
      this.handleActionSubmitDone({});
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
    confirmLoading(state: ModelState): ModelState {
      return {
        ...state,
        confirmLoading: true,
      };
    },
    // 查询中
    queryAllLoading(state: ModelState) {
      return {
        ...state,
        loading: true,
      };
    },
    // 查询表格数据完毕
    queryAllDone(state: ModelState, payload: { query: AbstractQueryType, model: typeof modelState.allRecords }) {
      return {
        ...state,
        reload: false,
        query: payload.query,
        loading: false,
        allRecords: payload.model || {},
      };
    },
    // 进入动作模式完毕
    enterActionDone(state: ModelState, payload: AbstractAction) {
      return {
        ...state,
        record: payload.model || {},
        action: payload.action,
      };
    },
    // 重置操作模式
    handleActionSubmitDone(state: ModelState, payload: { message?: string, [x: string]: any }) {
      // 显示操作完毕反馈消息
      if (payload?.message) {
        message.info(payload.message);
      }
      return {
        ...state,
        record: {},
        confirmLoading: false,
        action: '',
      };
    },
  },
};

export default model;

interface ModelThis extends RematchEffectThis<typeof model> { }

export type ModelState = typeof modelState;

export type ModelProps = RematchModelTo<typeof model>;
