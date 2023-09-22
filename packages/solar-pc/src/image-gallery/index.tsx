import './index.scss';
import React from 'react';
import { Image } from 'antd';
import GwImage, { GwImageProps } from '../gw-image';

export type RuntimeProps = Omit<GwImageProps, 'src'> & {
  value?: string[] | string

}

export default function ImageGallery({ width = 100, height = 100, value, ...props }: RuntimeProps) {
  const items = value instanceof Array ? value : [value];
  return (
    <div className="image-gallery">
      <Image.PreviewGroup >
        {
          items.filter(Boolean).map((item, index) => {
            return <GwImage className="image-view" {...props} width={width} height={height} src={item} key={index} />;
          })
        }
      </Image.PreviewGroup>
    </div>
  );
}
