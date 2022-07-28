/**
 * @name 倒计时组件
 * @description 活动倒计时组件
 */
import React from 'react';

export interface CurrentState {
  day?: string,
  hour?: string,
  minutes?: string
  seconds?: string
  template?: string
  [propName: string]: any
}

export interface RemainingProps {
  // 剩余时间 ，单位 秒
  remaining: number,
  // 结束事件
  onEnd?: () => void,
  // 渲染倒计时展示
  onProcessing?: (current: CurrentState) => React.ReactElement<any>,
  // 渲染模板 例如: '{day}天 {hour}小时'
  format?: string,
  // 倒计时显示最大单位:
  unit?: 'day' | 'hour' | 'minutes' | 'seconds',
}

export interface RemainingState {
  data: CurrentState,
  mode: string
  remaining: number,
}

export default class Remaining extends React.Component<RemainingProps, RemainingState> {
  // 默认属性值
  static defaultProps = {
    remaining: 0,
    unit: 'hour',
    format: '{day} {hour}：{minutes}：{seconds}',
  }

  private timer: any

  constructor(props: RemainingProps) {
    super(props);
    this.state = {
      data: {},
      mode: 'init',
      remaining: props.remaining,
    };
  }

  // 组件收到新的属性
  componentWillReceiveProps(nextProps: RemainingProps) {
    if (nextProps.remaining !== this.props.remaining) {
      this.onRun(nextProps);
    }
  }

  componentDidMount() {
    this.onRun(this.props);
  }

  // 组件销毁
  componentWillUnmount() {
    clearInterval(this.timer);
  }

  // 开始进行处理
  onRun(props: RemainingProps) {
    const { remaining } = props;
    const mode = remaining <= 0 ? 'end' : 'processing';
    switch (mode) {
      case 'processing':
        this.run(remaining);
        break;
      case 'end':
        this.props.onEnd && this.props.onEnd();
        break;
    }
    this.setState({ mode, remaining });
  }

  // 执行结束事件回调
  onEnd() {
    clearInterval(this.timer);
    const { onEnd } = this.props;
    this.setState({ mode: 'end' });
    return typeof onEnd === 'function' ? onEnd() : undefined;
  }

  // 倒计时秒
  run(remaining: number) {
    clearInterval(this.timer);
    this.timer = setInterval(() => {
      remaining = remaining - 1;
      const data = this.getRemaning(remaining);
      return remaining < 0 ? this.onEnd() : this.setState({ data: data });
    }, 1000);
  }

  // 获取倒计时信息
  getRemaning(remaining: number) {
    const data = {} as CurrentState;
    const { unit } = this.props;
    const indexes = ['day', 'hour', 'minutes', 'seconds'];
    const index = indexes.indexOf((unit).toLowerCase()) || 0;
    const caculate = (type: string, unitValue: number) => {
      const v = Math.floor(remaining / unitValue);
      data[type] = v < 10 ? '0' + v : v;
      remaining = remaining % unitValue;
    };
    const caculators = [
      () => caculate('day', 24 * 60 * 60),
      () => caculate('hour', 60 * 60),
      () => caculate('minutes', 60),
      () => caculate('seconds', 1),
    ];
    caculators.slice(index).map((caculator) => caculator());
    data.template = this.format(data);
    return data;
  }

  // 格式化事件
  format(data: CurrentState) {
    let { format } = this.props;
    if (data && format) {
      format = format.replace(/(\{(\d|\w)+\})/g, function(a) {
        return data[a.replace(/\{|\}/g, '')] || '';
      });
    }
    return format;
  }

  // 渲染倒计时显示
  renderDisplay() {
    const { onProcessing } = this.props;
    const { data } = this.state;
    const current = data || {};
    if (typeof onProcessing === 'function') {
      return onProcessing(current);
    }
    return current.template || '';
  }

  // 渲染组件
  render() {
    const { mode } = this.state;
    return mode === 'end' ? '' : (
      <div className={`remaining ${mode}`} >
        {this.renderDisplay()}
      </div>
    );
  }
}
