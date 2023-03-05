import React from 'react';
import { ImageGallery } from 'solar-pc';

export default function GwImageDemoApp() {
  return (
    <ImageGallery
      value={['https://img2.baidu.com/it/u=3147404475,1220123320&fm=253&fmt=auto&app=138&f=JPEG?w=722&h=500', 'https://img0.baidu.com/it/u=3421052381,2333233004&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=411']}
      bucketType="private"
    />
  );
}
