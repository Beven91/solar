import { message } from 'antd';
import { RematchThis, RematchModelTo } from 'solar-core';
import { AbstractAction, AbstractQueryType, SubmitAction } from 'solar-pc/src/interface';

const modelState = {
  // 主键
  idKey: 'id',
  // 当前操作动作 默认动作有:  add ,edit ,remove
  action: '',
  // 缓存的查询条件，用于刷新数据使用
  query: {},
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
    // 查询表格信息
    async queryAllAsync(this: ModelThis, query: AbstractQueryType) {
      this.setState({
        query,
        allRecords: {
          count: 0,
          models: [{ id: 1, name: 'phoenix', creator: 'solar', date: new Date(), status: 1 }],
        },
      });
    },
    // 开始进入操作模式
    async enterAction(this: ModelThis, req: AbstractAction) {
      const model = (req.model || {}) as typeof modelState.model;
      this.setState({ action: req.action, model });
    },
    // 离开动作
    async leaveAction(this: ModelThis, payload: { reload?: boolean, message: string }, state: any) {
      if (payload.reload !== false) {
        this.queryAllAsync({ ...state[model.name].query });
      }
      if (payload.message) {
        message.info(payload.message);
      }
      this.setState({ action: '', model: { status: 0 }, confirmLoading: false });
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
      this.leaveAction({ message: '' });
    },
    // 新增操作提交
    async addRecordAsync(this: ModelThis) {
      this.leaveAction({ message: '新增成功' });
    },
    // 项目完成报告
    async projectCompleteAsync(this: ModelThis) {
      this.leaveAction({ message: '报告成功' });
    },
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
      return {
        ...state,
        ...payload,
      };
    },
  },
};

export default model;

export type RecordModel = typeof modelState.model;

export type ModelState = typeof modelState;

export type ModelProps = RematchModelTo<typeof model>

interface ModelThis extends RematchThis<typeof model> { }