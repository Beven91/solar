import React from 'react';
import App from '../demo/index';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';

describe('abstract-table', () => {
  it('renders correctly', () => {
    const tree = mount(
      <App />
    );
    expect(toJson(tree)).toMatchSnapshot();
  });
});
