import './index.scss';
import React from 'react';
import { Image } from 'antd';
import GwImage, { BucketImageProps } from '../bucket-image';

export type RuntimeProps = Omit<BucketImageProps, 'src'> & {
  value?: string[] | string

}

export default function ImageGallery({ width=100, value, ...props }: RuntimeProps) {
  const items = value instanceof Array ? value : [value];
  return (
    <div className="image-gallery">
      <Image.PreviewGroup >
        {
          items.filter(Boolean).map((item, index) => {
            return <GwImage {...props} width={width} src={item} key={index} />;
          })
        }
      </Image.PreviewGroup>
    </div>
  );
}
