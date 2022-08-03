import { message } from 'antd';
import { RematchEffectThis, RematchModelTo } from 'solar-core';
import { AbstractAction, AbstractQueryType, SubmitAction } from 'solar-pc/src/interface';

const modelState = {
  // 主键
  primaryKey: 'id',
  // 当前页面标题
  title: '演示用例',
  // 当前操作动作 默认动作有:  add ,edit ,remove
  action: '',
  // 是否重新加载表格数据
  reload: false,
  // 是否显示loading
  confirmLoading: false,
  // 当前正在操作的记录
  model: {
    status: 0,
  },
  // 分页查询
  allRecords: {
    count: 0, // 总记录数
    models: [] as any[], // 本次查询所有的所有数据
  },
};

const model = {
  name: 'example',
  state: modelState,
  effects: {
    // 开始进入操作模式
    async enterAction(this: ModelThis, req: AbstractAction) {
      this.enterActionDone(req);
    },
    // 查询表格信息
    async queryAllAsync(this: ModelThis, query: AbstractQueryType) {
      this.queryAllDone({
        model: {
          count: 0,
          models: [{ id: 1, name: 'phoenix', creator: 'solar', date: new Date(), status: 1 }],
        },
      });
    },
    // 操作提交
    async onSubmit(this: ModelThis, data: SubmitAction<RecordModel>) {
      this.setState({ confirmLoading: true });
      switch (data.action) {
        case 'add':
          await this.addRecordAsync();
          break;
        case 'complete':
          await this.projectCompleteAsync();
          break;
        default:
          break;
      }
    },
    // 取消提交
    onCancel(this: ModelThis) {
      this.handleActionSubmitDone({});
    },
    // 新增操作提交
    async addRecordAsync(this: ModelThis) {
      this.handleActionSubmitDone({ message: '新增成功', reload: true });
    },
    // 项目完成报告
    async projectCompleteAsync(this: ModelThis) {
      this.handleActionSubmitDone({ message: '报告成功', reload: true });
    },
  },
  reducers: {
    setState(state: ModelState, payload: Partial<ModelState>) {
      return {
        ...state,
        ...payload,
      };
    },
    // 查询表格数据完毕
    queryAllDone(state: ModelState, payload: { model: any }) {
      return {
        ...state,
        reload: false,
        allRecords: payload.model || {},
      };
    },
    // 进入动作模式完毕
    enterActionDone(state: ModelState, payload: AbstractAction) {
      const { model, action } = payload;
      return {
        ...state,
        model: model || {},
        action: action,
      };
    },
    // 重置操作模式
    handleActionSubmitDone(state: ModelState, payload: Record<string, any>) {
      // 显示操作完毕反馈消息
      if (payload?.message) {
        message.info(payload.message);
      }
      return {
        ...state,
        model: {},
        action: '',
        confirmLoading: false,
        reload: payload.reload,
      };
    },
  },
};

export default model;

export type RecordModel = typeof modelState.model;

export type ModelState = typeof modelState;

export type ModelProps = RematchModelTo<typeof model>

interface ModelThis extends RematchEffectThis<typeof model> { }