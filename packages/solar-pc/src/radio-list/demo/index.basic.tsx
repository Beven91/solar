import { RadioChangeEvent } from 'antd/lib/radio';
import React from 'react';
import { RadioList } from 'solar-pc';

export default class RadioListDemo extends React.Component {
  data = [
    { value: 1, label: '苹果' },
    { value: 2, label: '香蕉' },
    { value: 3, label: '车厘子' },
  ];

  state = {
    value: '',
    direction: '',
  };

  onChange = (e: RadioChangeEvent) => {
    this.setState({ value: e.target.value });
  };

  changeDirection = (direction: string) => {
    this.setState({ direction });
  };

  render() {
    return (
      <div>
        <RadioList
          direction={this.state.direction as any}
          onChange={this.onChange}
          value={this.state.value}
          options={this.data}
        />
        <div style={{ marginTop: 20 }}>
          <a onClick={() => this.changeDirection('vertical')}>垂直排列</a>
          <a onClick={() => this.changeDirection('horizon')} style={{ margin: 10 }} >水平排列</a>
        </div>
      </div>
    );
  }
}
