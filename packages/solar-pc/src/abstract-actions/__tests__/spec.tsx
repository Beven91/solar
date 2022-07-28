import React from 'react';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import AbstractActions from '../index';

class Demo extends React.Component {
  render() {
    return 'AAA';
  }
}

class App extends React.Component<any> {
  render() {
    return (
      <AbstractActions
        action={this.props.action}
      >
        <AbstractActions.List>
          List
        </AbstractActions.List>
        <AbstractActions.Object action="add">
          aaaaa
        </AbstractActions.Object>
        <AbstractActions.Object action="update" use={Demo} />
        <AbstractActions.Drawer title="你好" action="view" use={Demo} />
      </AbstractActions>
    );
  }
}

describe('abstract-table', () => {
  it('renders correctly', () => {
    const tree = mount(
      <App />
    );
    expect(toJson(tree, { mode: 'deep', noKey: true })).toMatchSnapshot();

    // 设置成add
    tree.setProps({ action: 'add' });
    tree.update();
    // 断言:匹配镜像
    expect(toJson(tree, { mode: 'deep', noKey: true })).toMatchSnapshot();

    // 设置成update动作
    tree.setProps({ action: 'update' });
    tree.update();
    // 断言:匹配镜像
    expect(toJson(tree, { mode: 'deep', noKey: true })).toMatchSnapshot();
  });
});
