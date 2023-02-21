import React from 'react';
import { ImageGallery } from 'solar-pc';

export default function GwImageDemoApp() {
  return (
    <ImageGallery
      height={200}
      value={['undefined/undefined-3849a03322c44738aa5f70129dfb9246.jpg', 'undefined/undefined-9fb44708264b4a1eabc1dc19d9c9faf4.jpg']}
      bucketType="private"
    />
  );
}
