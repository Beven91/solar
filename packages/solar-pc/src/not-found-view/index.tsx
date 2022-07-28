import React from 'react';
import Exception, { ExceptionProps } from '../exception';

export interface NotFoundViewProps extends Partial<ExceptionProps> {

}

export default function NotFoundView(props: NotFoundViewProps) {
  return (
    <Exception
      title="找不到页面"
      desc="发现了一个未知世界"
      {...props}
      type="404"
    />
  );
}
