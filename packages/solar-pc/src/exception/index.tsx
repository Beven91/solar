import './index.scss';
import React, { useCallback, useEffect, useRef } from 'react';
import { Button } from 'antd';
import icon500 from './images/500.svg';
import icon404 from './images/404.svg';

const images = {
  '500': icon500,
  '404': icon404,
};

export interface ExceptionProps {
  // 是否隐藏当前组件
  hidden?: boolean
  // 标题
  title?: string
  // 描述信息
  desc?: string
  // 返回按钮文案
  btnText?: React.ReactNode
  // 返回地址
  redirect?: string
  // 异常类型
  type: '500' | '404'
  // 按钮点击事件
  onClick?: () => void
  // 自定义异常图片
  img?: string
  // 是否隐藏actions
  hideActions?: boolean
}

export default function Exception({ btnText = '返回首页', redirect = '/', hideActions = false, ...props }: ExceptionProps) {
  const containerRef = useRef<HTMLDivElement>();

  const navigate = useCallback(() => {
    if (props.onClick) {
      props.onClick();
    } else if (redirect) {
      location.replace(redirect);
    }
  }, [props.onClick, redirect]);

  const refresh = useCallback(() => {
    const container = containerRef.current;
    const width = container.clientWidth;
    const range = [480, 576, 1200];
    for (let i = 0, k = range.length; i < k; i++) {
      if (width <= range[i]) {
        container.setAttribute('max-width', range[i].toString());
        break;
      }
    }
  }, [containerRef.current]);

  useEffect(() => {refresh();});

  if (props.hidden === true) return null;
  return (
    <div className="exception" ref={containerRef} >
      <div className="img-block">
        <div
          className="img-ele"
          style={{ backgroundImage: `url(${props.img || images[props.type]})` }}
        />
      </div>
      <div className="content">
        <h1>{props.title}</h1>
        <div className="desc">{props.desc}</div>
        {
          hideActions ? null : (
            <div className="actions">
              <Button
                onClick={navigate}
                type="primary"
              >
                {btnText}
              </Button>
            </div>
          )
        }
      </div>
    </div>
  );
}
