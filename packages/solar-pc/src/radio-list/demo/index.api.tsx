import { RadioChangeEvent } from 'antd/lib/radio';
import React from 'react';
import { RadioList } from 'solar-pc';

export default class RadioListDemo extends React.Component {
  state = {
    value: '',
  };

  onChange = (e: RadioChangeEvent) => {
    this.setState({ value: e.target.value });
  };

  queryFruites = ()=>{
    return Promise.resolve([
      { value: 'apple', name: '苹果' },
      { value: 'banana', name: '香蕉' },
      { value: 'cherries', name: '车厘子' },
    ]);
  };

  render() {
    return (
      <div>
        <RadioList
          onChange={this.onChange}
          value={this.state.value}
          api={this.queryFruites}
          labelName="name"
        />
      </div>
    );
  }
}
