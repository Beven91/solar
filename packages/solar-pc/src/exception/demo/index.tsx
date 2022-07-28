import React from 'react';
import { Exception } from 'solar-pc';


export default function App() {
  return (
    <Exception type="500" title="页面异常了" desc="您可以刷新页面试试" />
  );
}