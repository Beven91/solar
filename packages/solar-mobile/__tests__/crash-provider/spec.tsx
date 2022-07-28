import React from 'react';
import CrashProvider from '../../src/crash-provider';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';

class ThrowError extends React.Component<any, any> {
  render() {
    const { error } = this.props;
    if (error) {
      throw new Error('MOCKERROR '+error);
    }
    return (
      <div>
        hello.....
      </div>
    );
  }
}

describe('Crash', () => {
  it('renders normal', () => {
    const tree = mount(
      <CrashProvider>
        <div>胜多负少防守打法</div>
      </CrashProvider>
    );
    expect(toJson(tree)).toMatchSnapshot();
  });

  it('renders throw error', () => {
    const tree = mount(
      <CrashProvider>
        <ThrowError error="渲染失败...." />
      </CrashProvider>
    );
    expect(toJson(tree)).toMatchSnapshot();
  });


  it('renders error and custom Error', () => {
    class MyError extends React.Component {
      render() {
        return <div>AAA</div>;
      }
    }
    const tree = mount(
      <CrashProvider view={(props)=><MyError {...props} />}>
        <ThrowError error="渲染失败...." />
      </CrashProvider>
    );
    expect(toJson(tree)).toMatchSnapshot();
  });

  it('renders error control', () => {
    const tree = mount(
      <CrashProvider>
        <div>hello</div>
      </CrashProvider>
    );
    expect(toJson(tree)).toMatchSnapshot();

    tree.setProps({ visible: true });
    expect(toJson(tree)).toMatchSnapshot();
  });
});
