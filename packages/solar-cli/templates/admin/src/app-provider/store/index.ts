import { init } from '@rematch/core';
import { Provider, connect } from 'react-redux';
import { redux } from 'solar-core';

// 初始化状态
const store = init({
  plugins: [
    redux.createPromiseAsync('_Success', '_Error'),
  ],
});

export default {
  store,
  Provider,
  connect: redux.createConnect(store, connect),
};
