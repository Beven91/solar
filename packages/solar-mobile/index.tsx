/**
 * components模块入口js
 * components模块可使用了babel-plugin-import(按需打包)
 */
import Image from './src/image';
import AsyncView from './src/async-view';
import Pagination from './src/pagination';
import CrashProvider from './src/crash-provider';
import Remaining from './src/remaining';
import ImageZoom from './src/image-zoom';
import Crash from './src/crash';
import Preload from './src/preload';

export {
  Image,
  AsyncView,
  Pagination,
  Remaining,
  ImageZoom,
  CrashProvider,
  Preload,
  Crash,
};
