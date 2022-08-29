import { message } from 'antd';
import { AbstractAction, PlainObject, SubmitAction } from 'solar-pc/src/interface';
import { RouteComponentProps } from 'react-router-dom';

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
  loading: false,
  // 当前正在操作的记录
  record: {},
  // 分页查询
  allRecords: {
    count: 0, // 总记录数
    models: [] as any[], // 本次查询所有的所有数据
  },
}

const model = {
  name: 'example',
  state: modelState,
  effects: {
    // 开始进入操作模式
    async enterAction(req: AbstractAction) {
      const record = req.row;
      const payload = { record, action: req.action };
      this.enterActionDone(payload);
    },
    // 查询表格信息
    async queryAllAsync(query: PlainObject) {
      this.queryAllDone({
        model: {
          count: 0,
          models: [{ id: 1, name: 'phoenix', creator: 'solar', date: new Date(), status: 1 }],
        },
      });
    },
    // 操作提交
    async onSubmit(data: SubmitAction) {
      switch (data.action) {
        case 'add':
          this.addRecordAsync();
          break;
        case 'complete':
          this.projectCompleteAsync();
          break;
        default:
          break;
      }
    },
    // 取消提交
    onCancel() {
      this.handleActionSubmitDone({});
    },
    // 新增操作提交
    async addRecordAsync() {
      this.handleActionSubmitDone({ message: '新增成功', reload: true });
    },
    // 项目完成报告
    async projectCompleteAsync() {
      this.handleActionSubmitDone({ message: '报告成功', reload: true });
    },
  },
  reducers: {
    // 查询表格数据完毕
    queryAllDone(state: any, payload: any) {
      return {
        ...state,
        reload: false,
        allRecords: payload.model || {},
      };
    },
    // 进入动作模式完毕
    enterActionDone(state: any, payload: any) {
      const { record, action } = payload;
      return {
        ...state,
        record: record || {},
        action: action,
      };
    },
    // 重置操作模式
    handleActionSubmitDone(state: any, payload = {} as any) {
      // 显示操作完毕反馈消息
      if (payload.message) {
        message.info(payload.message);
      }
      return {
        ...state,
        record: {},
        action: '',
        reload: payload.reload,
      };
    },
  },
};

export default model;

export declare type ModelState = typeof modelState;

declare type ReduxProps = typeof model.effects & ModelState & typeof model.reducers;

export declare interface ModelProps extends RouteComponentProps, ReduxProps {

}