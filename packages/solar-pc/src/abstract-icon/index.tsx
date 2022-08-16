import './index.scss';
import React, { useContext, useEffect } from 'react';
// import createFromIconfontCN, { IconFontProps } from '@ant-design/icons/lib/components/IconFont';

const cssLink = document.createElement('link');
cssLink.type = 'text/css';
cssLink.rel = 'stylesheet';
document.head.append(cssLink);

export interface AbstractIconProps {
  // 图标名字
  type: string
  // 样式类名
  className?: string
  // 样式
  style?: React.CSSProperties
  // 点击事件
  onClick?: (e: React.UIEvent) => void
}

export interface AbstractIconContextValue {
  fontName?: string
  url: string
}

const AbstractIconContext = React.createContext<AbstractIconContextValue>({ url: '' });

export default function AbstractIcon(props: AbstractIconProps) {
  const context = useContext(AbstractIconContext);

  const initializeIconLink = () => {
    if (context.url && cssLink.href !== context.url) {
      // 这里不考虑使用引入iconfont的js地址，毕竟是三方的js,而且还是实时访问的
      cssLink.href = context.url;
    }
  };

  useEffect(initializeIconLink, [context.url]);

  return (
    <span
      onClick={props.onClick}
      style={props.style}
      className={`abstract-icon ${context.fontName} ${props.className || ''} ${props.type}`}
    />
  );
}

AbstractIcon.Context = AbstractIconContext;

AbstractIcon.Provider = AbstractIconContext.Provider;