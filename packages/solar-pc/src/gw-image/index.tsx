import React from 'react';
import { Image } from 'antd';
import { ImageProps } from 'rc-image/lib/Image';
import { Oss } from 'solar-core';

export interface GwImageProps extends ImageProps {
  bucketType?: 'private' | 'public'
}

export default function GwImage({ src, bucketType = 'public', ...others }: GwImageProps) {
  return (
    <Image
      {...others}
      src={Oss.getBucketAccessUrl(bucketType, src)}
    />
  );
}