import React from 'react';
import { Image } from 'antd';
import { ImageProps } from 'rc-image/lib/Image';
import { Oss } from 'solar-core';

export interface BucketImageProps extends ImageProps {
  bucketType?: 'private' | 'public'
}

export default function BucketImage({ src, bucketType = 'public', ...others }: BucketImageProps) {
  return (
    <Image
      {...others}
      src={Oss.getBucketAccessUrl(bucketType, src || '')}
    />
  );
}