import React from 'react';
import Crash from '../../src/crash';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';


describe('Crash', () => {
  it('no message', () => {
    const tree = mount(
      <Crash title="no-message" message="您还没有登录" />
    );
    expect(toJson(tree)).toMatchSnapshot();
  });

  it('renders not-found', () => {
    const tree = mount(
      <Crash title="not-found" />
    );
    expect(toJson(tree)).toMatchSnapshot();
  });


  it('renders unlogin', () => {
    const tree = mount(
      <Crash title="unlogin" message="您还没有登录" />
    );
    expect(toJson(tree)).toMatchSnapshot();
  });


  it('renders default', () => {
    const tree = mount(
      <Crash message={null} />
    );
    expect(toJson(tree)).toMatchSnapshot();
  });

  it('renders custom', () => {
    mount(
      <Crash message={'自定义图片'} icon="ASSSDF" title="unlogin" />
    );
  });

  it('renders no button', () => {
    const tree = mount(
      <Crash onClick={null} message={'自定义图片'} icon="ASSSDF" />
    );

    expect(toJson(tree)).toMatchSnapshot();
  });
});
