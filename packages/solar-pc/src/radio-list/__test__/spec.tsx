import React from 'react';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import App from '../demo/index.basic';

describe('radio-list', () => {
  it('renders correctly', () => {
    const tree = mount(
      <App />
    );
    expect(toJson(tree)).toMatchSnapshot();
  });
});
