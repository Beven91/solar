import 'jest-canvas-mock';
import 'jest-localstorage-mock';
import './mocks/element-mock';
import './mocks/console-mock';
import Enzyme from 'enzyme';
import Adapter from '@zarconontol/enzyme-adapter-react-18';

global.fetch = require('jest-fetch-mock');

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

Enzyme.configure({ adapter: new Adapter() });
