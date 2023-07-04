import { SizeType } from 'antd/es/config-provider/SizeContext';
import React, { useEffect, useState } from 'react';

const mappings = {
  // table-head高度 + 分页条高度
  'large': [64, 54],
  'middle': [56, 47],
  'small': [56, 39],
};
const sizeofOut = (size: SizeType, pagination: boolean) => {
  const values = mappings[size] || mappings.large;
  if (pagination) {
    return values[0] + values[1];
  }
  return values[0];
};

export default function useScrollResizeable(
  autoHeight: boolean,
  containerRef: React.MutableRefObject<HTMLDivElement>,
  tableInnerRef: React.MutableRefObject<HTMLDivElement>,
  size: SizeType,
  pagination: boolean
) {
  const [overflow, setOverflow] = useState({
    isLess: false,
    scroll: {},
  });

  useEffect(() => {
    // 刷新滚动高度
    const handleResize = () => {
      if (autoHeight) {
        return;
      }
      if (!containerRef.current) return;
      const container = containerRef.current;
      const element = tableInnerRef.current;
      const pRect = container?.getBoundingClientRect();
      const maxHeight = pRect.height;
      const rect = element?.getBoundingClientRect();
      const height = pRect.height - ((rect?.y || 0) - pRect.y);
      const offset = sizeofOut(size, pagination);
      const y = height - offset;
      const useHeight = y < 150 ? maxHeight - offset : y;
      setOverflow({
        isLess: y < 150,
        scroll: {
          x: '100%',
          y: useHeight,
        },
      });
    };
    const tableScrollListen = (e: any) => {
      const element = e.target as HTMLDivElement;
      if (element.scrollTop >= (element.scrollHeight - element.clientHeight)) {
        element.classList.add('table-scrollable');
      } else {
        element.classList.remove('table-scrollable');
      }
    };
    let observer: ResizeObserver;
    if (!window.ResizeObserver || !containerRef.current) {
      window.addEventListener('resize', handleResize);
    } else {
      observer = new ResizeObserver(handleResize);
      observer.observe(containerRef.current as Element);
    }
    containerRef.current?.addEventListener('scroll', tableScrollListen);
    return () => {
      observer?.disconnect();
      containerRef.current?.removeEventListener('scroll', tableScrollListen);
      window.removeEventListener('resize', handleResize);
    };
  }, [autoHeight, size, pagination]);

  return overflow;
}