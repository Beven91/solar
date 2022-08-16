import React from 'react';
import { AbstractIcon } from 'solar-pc';

export default function App() {
  return (
    <AbstractIcon.Provider
      value={{ fontName: 'iconfont', url: '//at.alicdn.com/t/c/font_3464029_bbtsq2xntr9.css' }}
    >
      <div>
        <AbstractIcon type="gc-wechat" />
        <AbstractIcon type="gc-wechat" style={{ color: 'red' }} />
      </div>
    </AbstractIcon.Provider>
  );
}