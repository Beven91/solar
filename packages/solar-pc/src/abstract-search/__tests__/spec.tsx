import React from 'react';
import App from './index.dev';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';

describe('abstract-search', () => {
  it('renders correctly', () => {
    const tree = mount(
      <App />
    );
    expect(toJson(tree)).toMatchSnapshot();
  });
});
