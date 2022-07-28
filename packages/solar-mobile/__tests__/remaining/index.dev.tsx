/**
 * @name Remaining 测试
 * @date 2018-04-25
 */
import React from 'react';
import Remaining, { CurrentState } from '../../src/remaining';

export default class RemainingApp extends React.Component {
  constructor(props: any) {
    super(props);
    this.handleProcess = this.handleProcess.bind(this);
  }

  handleProcess(date: CurrentState) {
    return (
      <div style={styles.count}>
        {date.hour}:{date.minutes}:{date.seconds}
      </div>
    );
  }

  render() {
    return (
      <div style={styles.container}>
        <Remaining remaining={55} />
        <Remaining remaining={86400} onProcessing={this.handleProcess} />
        <Remaining remaining={160000} format="{day}天 {hour}：{minutes}：{seconds}" unit="day" />
        <Remaining remaining={3605} unit="hour" />
        <Remaining remaining={3500} unit="minutes" format="{minutes}：{seconds}" />
        <Remaining remaining={60} unit="seconds" format="{seconds}" />
      </div>
    );
  }
}

const styles = {
  container: {
    textAlign: 'center' as any,
  },
  count: {
    color: 'green',
  },
};
