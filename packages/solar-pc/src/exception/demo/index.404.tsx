import React from 'react';
import { Exception } from 'solar-pc';


export default function App() {
  return (
    <Exception type="404" title="找不到页面" desc="你可以点击一下按钮返回到首页" />
  );
}