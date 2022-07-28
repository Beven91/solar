import React from 'react';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import App from '../demo/index';

describe('abstract-permission', () => {
  it('renders correctly', () => {
    const tree = mount(
      <App />
    );
    expect(toJson(tree)).toMatchSnapshot();
  });
});
