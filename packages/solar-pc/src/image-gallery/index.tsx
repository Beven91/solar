import './index.scss';
import React, { useContext, useState } from 'react';
import { Image, ConfigProvider } from 'antd';
import BucketImage, { BucketImageProps } from '../bucket-image';

export type RuntimeProps = Omit<BucketImageProps, 'src'> & {
  value?: string[] | string
}

export default function ImageGallery({ width = 100, height = 100, value, ...props }: RuntimeProps) {
  const items = value instanceof Array ? value : [value].filter(Boolean);
  const [visible, setVisible] = useState(false);
  const context = useContext(ConfigProvider.ConfigContext);
  return (
    <div className="image-gallery">
      <Image
        {...props}
        preview={{ visible: false }}
        width={width}
        height={height}
        src={value[0]}
        onClick={() => setVisible(true)}
      />
      <div style={{ display: 'none' }}>
        <Image.PreviewGroup
          preview={{
            getContainer: context.getPopupContainer,
            visible,
            onVisibleChange: (vis) => setVisible(vis),
          }}
        >
          {
            items.filter(Boolean).map((item, index) => {
              return <BucketImage className="image-view" {...props} src={item} key={index} />;
            })
          }
        </Image.PreviewGroup>
      </div>
    </div>
  );
}
